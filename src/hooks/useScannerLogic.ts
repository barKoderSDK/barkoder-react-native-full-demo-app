import { useState, useRef, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { Barkoder } from 'barkoder-react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { ScannerSettings } from '../types/types';
import { MODES } from '../constants/constants';
import { SettingsService } from '../services/SettingsService';
import { HistoryService } from '../services/HistoryService';
import { getInitialEnabledTypes, getInitialSettings, createBarcodeConfig } from '../utils/scannerConfig';
import { useBarcodeConfig } from './useBarcodeConfig';
import { useCameraControls } from './useCameraControls';
import { useBarkoderSettings } from './useBarkoderSettings';
import { BARCODE_TYPES_1D, BARCODE_TYPES_2D } from '../constants/constants';

const ALL_TYPES = [...BARCODE_TYPES_1D, ...BARCODE_TYPES_2D];

export const useScannerLogic = (mode: string) => {
    const [scannedItems, setScannedItems] = useState<Array<{text: string, type: string, image?: string}>>([]);
    const [enabledTypes, setEnabledTypes] = useState<{[key: string]: boolean}>(() => getInitialEnabledTypes(mode));
    const [isScanningPaused, setIsScanningPaused] = useState(false);
    const [frozenImage, setFrozenImage] = useState<string | null>(null);
    const [settings, setSettings] = useState<ScannerSettings>(() => getInitialSettings(mode));
    const barkoderRef = useRef<Barkoder | null>(null);
    const { updateBarkoderConfig, toggleBarcodeType, enableAllBarcodeTypes } = useBarcodeConfig(barkoderRef);
    const { isFlashOn, zoomLevel, selectedCameraId, toggleFlash, toggleZoom, toggleCamera } = useCameraControls(barkoderRef);

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

    const { applySettings, updateSingleSetting } = useBarkoderSettings(barkoderRef, mode, startScanning);

    const clearPauseState = useCallback(() => {
        setIsScanningPaused(false);
        setFrozenImage(null);
    }, []);

    const onUpdateSetting = useCallback((key: keyof ScannerSettings, value: any) => {
        const newSettings = updateSingleSetting(key, value, settings, clearPauseState);
        setSettings(newSettings);
    }, [settings, updateSingleSetting, clearPauseState]);

    const onToggleBarcodeType = useCallback((typeId: string, enabled: boolean) => {
        if (typeId === 'ocrText' && mode !== MODES.VIN) {
            return;
        }
        const newEnabledTypes = toggleBarcodeType(typeId, enabled, enabledTypes);
        setEnabledTypes(newEnabledTypes);
        
        if (typeId === 'ocrText' && mode === MODES.VIN && barkoderRef.current) {
            barkoderRef.current.setCustomOption('enable_ocr_functionality', enabled ? 1 : 0);
        }
    }, [enabledTypes, toggleBarcodeType, mode]);

    const onEnableAllBarcodeTypes = useCallback((enabled: boolean, category: '1D' | '2D') => {
        const newEnabledTypes = enableAllBarcodeTypes(enabled, category, enabledTypes);
        if (mode !== MODES.VIN) {
            newEnabledTypes.ocrText = false;
        }
        setEnabledTypes(newEnabledTypes);
        
        if (category === '2D' && mode === MODES.VIN && barkoderRef.current) {
            if (newEnabledTypes.ocrText) {
                barkoderRef.current.setCustomOption('enable_ocr_functionality', enabled ? 1 : 0);
            }
        }
    }, [enabledTypes, enableAllBarcodeTypes, mode]);

    const resetConfig = useCallback(() => {
        const newSettings = getInitialSettings(mode);
        const newEnabledTypes = getInitialEnabledTypes(mode);
        
        setSettings(newSettings);
        setEnabledTypes(newEnabledTypes);
        
        applySettings(newSettings);
        updateBarkoderConfig(newEnabledTypes);
    }, [mode, applySettings, updateBarkoderConfig]);

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


    const onBarkoderViewCreated = useCallback((barkoder: Barkoder) => {
        barkoderRef.current = barkoder;
        
        const decoderConfig: any = {};
        ALL_TYPES.forEach(type => {
            decoderConfig[type.id] = createBarcodeConfig(type.id, !!enabledTypes[type.id]);
        });
    
        barkoder.configureBarkoder(
          new Barkoder.BarkoderConfig({
            decoder: new Barkoder.DekoderConfig(decoderConfig),
            imageResultEnabled: true,
            locationInImageResultEnabled: true,
            pinchToZoomEnabled: settings.pinchToZoom,
            locationInPreviewEnabled: settings.locationInPreview,
            regionOfInterestVisible: settings.regionOfInterest,
            beepOnSuccessEnabled: settings.beepOnSuccess,
            vibrateOnSuccessEnabled: settings.vibrateOnSuccess,
          })
        );
    
        const compositeEnabled = mode === 'v1' ? settings.compositeMode : false;
        barkoder.setEnableComposite(compositeEnabled ? 1 : 0);
        barkoder.setUpcEanDeblurEnabled(settings.scanBlurred);
        barkoder.setEnableMisshaped1DEnabled(settings.scanDeformed);
        barkoder.setDecodingSpeed(settings.decodingSpeed);
        barkoder.setBarkoderResolution(settings.resolution);
        barkoder.setCloseSessionOnResultEnabled(!settings.continuousScanning);
        barkoder.setBarcodeThumbnailOnResultEnabled(true);
        
        if (settings.continuousScanning) {
            barkoder.setThresholdBetweenDuplicatesScans(settings.continuousThreshold ?? 0);
        }
    
        if (mode !== MODES.VIN) {
            barkoder.setCustomOption('enable_ocr_functionality', 0);
        }

        if (mode === MODES.MULTISCAN) {
            barkoder.setMaximumResultsCount(200);
            barkoder.setMulticodeCachingDuration(3000);
            barkoder.setMulticodeCachingEnabled(true);
        } else if (mode === MODES.VIN) {
            barkoder.setEnableVINRestrictions(true);
            barkoder.setRegionOfInterest(0, 35, 100, 30);

            if (enabledTypes.ocrText) {
                barkoder.setCustomOption('enable_ocr_functionality', 1);
            } else {
                barkoder.setCustomOption('enable_ocr_functionality', 0);
            }
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
        
        if (mode !== MODES.GALLERY) {
            startScanning();
        }
    }, [enabledTypes, settings, mode, scanImagePressed, startScanning]);

    useEffect(() => {
        const loadSettings = async () => {
          const saved = await SettingsService.getSettings(mode);
          if (saved) {
            if (saved.enabledTypes) {
                const sanitizedEnabledTypes = { ...saved.enabledTypes };
                if (mode !== MODES.VIN) {
                    sanitizedEnabledTypes.ocrText = false;
                }
                setEnabledTypes(sanitizedEnabledTypes);
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
    
