import { useState, useRef, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { Barkoder } from 'barkoder-react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { ScannerSettings } from '../types/ScannerSettings';
import { MODES } from '../constants/modes';
import { SettingsService } from '../services/SettingsService';
import { HistoryService } from '../services/HistoryService';
import { getInitialEnabledTypes, getInitialSettings, createBarcodeConfig } from '../utils/scannerConfig';
import { useBarcodeConfig } from './useBarcodeConfig';
import { useCameraControls } from './useCameraControls';
import { useBarkoderSettings } from './useBarkoderSettings';
import { BARCODE_TYPES_1D, BARCODE_TYPES_2D } from '../constants/settingTypes';

const ALL_TYPES = [...BARCODE_TYPES_1D, ...BARCODE_TYPES_2D];

/**
 * Custom hook that manages all scanner-related logic and state.
 * Handles barcode scanning, configuration, settings, and user interactions.
 * 
 * Features:
 * - Barcode type configuration and toggling
 * - Continuous vs single-scan modes
 * - Camera controls (flash, zoom, camera switching)
 * - Settings persistence across app sessions
 * - Scan result management and history
 * - Mode-specific optimizations
 * 
 * @param mode - The scanning mode to initialize with
 * @returns Object containing all scanner state and control functions
 */
export const useScannerLogic = (mode: string) => {
    // State
    const [scannedItems, setScannedItems] = useState<Array<{text: string, type: string, image?: string}>>([]);
    const [enabledTypes, setEnabledTypes] = useState<{[key: string]: boolean}>(() => getInitialEnabledTypes(mode));
    const [isScanningPaused, setIsScanningPaused] = useState(false);
    const [frozenImage, setFrozenImage] = useState<string | null>(null);
    const [settings, setSettings] = useState<ScannerSettings>(() => getInitialSettings(mode));
    
    const barkoderRef = useRef<Barkoder | null>(null);

    // Custom hooks for separated concerns
    const { updateBarkoderConfig, toggleBarcodeType, enableAllBarcodeTypes } = useBarcodeConfig(barkoderRef);
    const { isFlashOn, zoomLevel, selectedCameraId, toggleFlash, toggleZoom, toggleCamera } = useCameraControls(barkoderRef);

    /**
     * Starts the barcode scanning process and handles scan results.
     */
    const startScanning = useCallback(() => {
        barkoderRef.current?.startScanning((result) => {
          if (result.decoderResults && result.decoderResults.length > 0) {
            const newResult = result.decoderResults[0];
            
            let fullImage = result.resultImageAsBase64;
            if (fullImage && !fullImage.startsWith('data:')) {
                fullImage = `data:image/jpeg;base64,${fullImage}`;
            }
    
            let displayImage = fullImage;
            if (result.resultThumbnailsAsBase64 && result.resultThumbnailsAsBase64.length > 0) {
                let thumb = result.resultThumbnailsAsBase64[0];
                if (thumb && !thumb.startsWith('data:')) {
                    thumb = `data:image/jpeg;base64,${thumb}`;
                }
                displayImage = thumb;
            }
    
            HistoryService.addScan({
                text: newResult.textualData,
                type: newResult.barcodeTypeName,
                image: displayImage || undefined,
            });
    
            const newItem = {
                text: newResult.textualData,
                type: newResult.barcodeTypeName,
                image: displayImage || undefined
            };
            
            setScannedItems(prev => [newItem, ...prev]);
    
            // Check current settings state to decide if we should pause
            setSettings(currentSettings => {
                if (!currentSettings.continuousScanning) {
                    setIsScanningPaused(true);
                    if (fullImage) {
                        setFrozenImage(fullImage);
                    }
                }
                return currentSettings;
            });
          }
        });
    }, []);

    // Settings management hook
    const { applySettings, updateSingleSetting } = useBarkoderSettings(barkoderRef, mode, startScanning);

    /**
     * Clears pause state (used when resuming or switching to continuous mode)
     */
    const clearPauseState = useCallback(() => {
        setIsScanningPaused(false);
        setFrozenImage(null);
    }, []);

    /**
     * Updates a single scanner setting
     */
    const onUpdateSetting = useCallback((key: keyof ScannerSettings, value: any) => {
        const newSettings = updateSingleSetting(key, value, settings, clearPauseState);
        setSettings(newSettings);
    }, [settings, updateSingleSetting, clearPauseState]);

    /**
     * Toggles a barcode type on or off
     */
    const onToggleBarcodeType = useCallback((typeId: string, enabled: boolean) => {
        const newEnabledTypes = toggleBarcodeType(typeId, enabled, enabledTypes);
        setEnabledTypes(newEnabledTypes);
    }, [enabledTypes, toggleBarcodeType]);

    /**
     * Enables/disables all barcode types in a category
     */
    const onEnableAllBarcodeTypes = useCallback((enabled: boolean, category: '1D' | '2D') => {
        const newEnabledTypes = enableAllBarcodeTypes(enabled, category, enabledTypes);
        setEnabledTypes(newEnabledTypes);
    }, [enabledTypes, enableAllBarcodeTypes]);

    /**
     * Resets all scanner settings and enabled types to their mode-specific defaults.
     */
    const resetConfig = useCallback(() => {
        const newSettings = getInitialSettings(mode);
        const newEnabledTypes = getInitialEnabledTypes(mode);
        
        setSettings(newSettings);
        setEnabledTypes(newEnabledTypes);
        
        applySettings(newSettings);
        updateBarkoderConfig(newEnabledTypes);
    }, [mode, applySettings, updateBarkoderConfig]);

    /**
     * Scans a barcode from a gallery image
     */
    const scanImagePressed = useCallback(() => {
        try {
          launchImageLibrary(
            { mediaType: 'photo', includeBase64: true },
            (response) => {
              if (response.didCancel) {
                console.log('User cancelled image picker');
              } else if (response.errorCode) {
                console.error('Image Picker Error:', response.errorMessage);
              } else if (response.assets?.[0]?.base64) {
                const base64Image = response.assets[0].base64;
                barkoderRef.current?.scanImage(base64Image, (result) => {
                    if (result.decoderResults && result.decoderResults.length > 0) {
                        const newResult = result.decoderResults[0];
                        
                        let image = `data:${response.assets?.[0]?.type || 'image/jpeg'};base64,${base64Image}`;
                        if (result.resultThumbnailsAsBase64 && result.resultThumbnailsAsBase64.length > 0) {
                            image = result.resultThumbnailsAsBase64[0];
                        }
    
                        const newItem = {
                            text: newResult.textualData,
                            type: newResult.barcodeTypeName,
                            image: image
                        };
                        setScannedItems(prev => [newItem, ...prev]);
                    } else {
                        Alert.alert('No barcode found', 'Could not detect any barcode in the selected image.');
                    }
                });
              } else {
                console.error('No valid image selected');
              }
            }
          );
        } catch (error) {
          console.error('Error launching image library:', error);
        }
    }, []);

    /**
     * Initializes Barkoder when the view is created
     */
    const onBarkoderViewCreated = useCallback((barkoder: Barkoder) => {
        barkoderRef.current = barkoder;
        
        // Configure barcode types
        const decoderConfig: any = {};
        ALL_TYPES.forEach(type => {
            const enabled = !!enabledTypes[type.id];
            decoderConfig[type.id] = createBarcodeConfig(type.id, enabled);
        });
    
        const shouldEnableImages = !(settings.continuousScanning && (settings.continuousThreshold ?? 0) < 10);
    
        barkoder.configureBarkoder(
          new Barkoder.BarkoderConfig({
            decoder: new Barkoder.DekoderConfig(decoderConfig),
            imageResultEnabled: shouldEnableImages,
            locationInImageResultEnabled: true,
            pinchToZoomEnabled: settings.pinchToZoom,
            locationInPreviewEnabled: settings.locationInPreview,
            regionOfInterestVisible: settings.regionOfInterest,
            beepOnSuccessEnabled: settings.beepOnSuccess,
            vibrateOnSuccessEnabled: settings.vibrateOnSuccess,
          })
        );
    
        barkoder.setEnableComposite(settings.compositeMode ? 1 : 0);
        barkoder.setUpcEanDeblurEnabled(settings.scanBlurred);
        barkoder.setEnableMisshaped1DEnabled(settings.scanDeformed);
        barkoder.setDecodingSpeed(settings.decodingSpeed);
        barkoder.setBarkoderResolution(settings.resolution);
        barkoder.setCloseSessionOnResultEnabled(!settings.continuousScanning);
        
        if (settings.continuousScanning) {
            barkoder.setThresholdBetweenDuplicatesScans(settings.continuousThreshold ?? 0);
        }
    
        if (mode === MODES.CONTINUOUS) {
            // No additional config needed
        } else if (mode === MODES.MULTISCAN) {
            barkoder.setMaximumResultsCount(200);
            barkoder.setMulticodeCachingDuration(3000);
            barkoder.setMulticodeCachingEnabled(true);
        } else if (mode === MODES.VIN) {
            barkoder.setEnableVINRestrictions(true);
            barkoder.setRegionOfInterest(0, 35, 100, 30);
        } else if (mode === MODES.DPM) {
            barkoder.setBarcodeTypeEnabled(Barkoder.BarcodeType.datamatrix, true);
            barkoder.setDatamatrixDpmModeEnabled(true);
            barkoder.setRegionOfInterest(40, 40, 20, 10);
        } else if (mode === MODES.AR_MODE) {
            barkoder.setARMode(Barkoder.BarkoderARMode.interactiveEnabled);
            barkoder.setARSelectedLocationColor('#00FF00');
            barkoder.setARNonSelectedLocationColor('#FF0000');
            barkoder.setARHeaderShowMode(Barkoder.BarkoderARHeaderShowMode.onSelected);
        } else if (mode === MODES.GALLERY) {
            setTimeout(() => {
                scanImagePressed();
            }, 500);
        } else if (mode === MODES.DOTCODE) {
            barkoder.setBarcodeTypeEnabled(Barkoder.BarcodeType.dotcode, true);
            barkoder.setRegionOfInterest(30, 40, 40, 9);
        }
    
        barkoder.setBarcodeThumbnailOnResultEnabled(shouldEnableImages);
    
        if (mode !== MODES.GALLERY) {
            startScanning();
        }
    }, [enabledTypes, settings, mode, scanImagePressed, startScanning]);

    // Load saved settings on mount
    useEffect(() => {
        const loadSettings = async () => {
          const saved = await SettingsService.getSettings(mode);
          if (saved) {
            if (saved.enabledTypes) {
                setEnabledTypes(saved.enabledTypes);
            }
            if (saved.scannerSettings) {
                setSettings(saved.scannerSettings);
            }
          }
        };
        loadSettings();
    }, [mode]);
    
    useEffect(() => {
        const save = async () => {
            await SettingsService.saveSettings(mode, {
                enabledTypes,
                scannerSettings: settings
            });
        };
        const timeoutId = setTimeout(save, 500);
        return () => clearTimeout(timeoutId);
    }, [enabledTypes, settings, mode]);

    return {
        barkoderRef,
        scannedItems,
        setScannedItems,
        enabledTypes,
        settings,
        isFlashOn,
        zoomLevel,
        selectedCameraId,
        isScanningPaused,
        setIsScanningPaused,
        frozenImage,
        setFrozenImage,
        onBarkoderViewCreated,
        onUpdateSetting,
        onToggleBarcodeType,
        onEnableAllBarcodeTypes,
        resetConfig,
        toggleFlash,
        toggleZoom,
        toggleCamera,
        startScanning,
        scanImagePressed
    };
};
    