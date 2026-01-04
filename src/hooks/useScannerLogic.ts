import { useState, useRef, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { Barkoder } from 'barkoder-react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { ScannerSettings } from '../types/ScannerSettings';
import { BARCODE_TYPES_1D, BARCODE_TYPES_2D } from '../constants/settingTypes';
import { MODES } from '../constants/modes';
import { SettingsService } from '../services/SettingsService';
import { HistoryService } from '../services/HistoryService';

const ALL_TYPES = [...BARCODE_TYPES_1D, ...BARCODE_TYPES_2D];
const DEFAULT_ENABLED = ['ean13', 'upcA', 'code128', 'qr', 'datamatrix'];

/**
 * Determines which barcode types should be initially enabled based on the scanning mode.
 * Different modes enable different barcode types by default for optimized performance.
 * 
 * @param mode - The scanning mode (e.g., MODE_1D, MODE_2D, CONTINUOUS, etc.)
 * @returns Object mapping barcode type IDs to boolean enabled states
 */
const getInitialEnabledTypes = (mode: string) => {
    const types: {[key: string]: boolean} = {};
    ALL_TYPES.forEach(t => { 
        if (mode === MODES.MODE_1D) {
            const is1D = BARCODE_TYPES_1D.some(b => b.id === t.id);
            if (is1D) types[t.id] = true;
        } else if (mode === MODES.MODE_2D) {
            const is2D = BARCODE_TYPES_2D.some(b => b.id === t.id);
            if (is2D) types[t.id] = true;
        } else if (mode === MODES.CONTINUOUS || mode === 'v1') {
            types[t.id] = true;
        } else if (mode === MODES.DOTCODE) {
            types[t.id] = t.id === 'dotcode';
        } else if (mode === MODES.AR_MODE) {
            types[t.id] = ['qr', 'code128', 'code39', 'upcA', 'upcE', 'ean13', 'ean8'].includes(t.id);
        } else {
            types[t.id] = DEFAULT_ENABLED.includes(t.id); 
        }
    });
    return types;
};

/**
 * Returns the default scanner settings configuration for a given scanning mode.
 * Each mode has optimized settings for its specific use case:
 * - CONTINUOUS: Fast scanning with no delays
 * - MULTISCAN: Multiple barcodes with caching
 * - VIN/DPM: Slow, high-resolution scanning with ROI
 * - MRZ/AR_MODE/DOTCODE: Specialized configurations
 * 
 * @param currentMode - The scanning mode to configure
 * @returns ScannerSettings object with mode-specific defaults
 */
const getInitialSettings = (currentMode: string): ScannerSettings => {
    const initialSettings: ScannerSettings = {
        compositeMode: false,
        pinchToZoom: true,
        locationInPreview: true,
        regionOfInterest: false,
        beepOnSuccess: true,
        vibrateOnSuccess: true,
        scanBlurred: false,
        scanDeformed: false,
        continuousScanning: false,
        decodingSpeed: Barkoder.DecodingSpeed.normal,
        resolution: Barkoder.BarkoderResolution.HD,
        continuousThreshold: 0
    };

    if (currentMode === MODES.CONTINUOUS) {
        initialSettings.continuousScanning = true;
    } else if (currentMode === MODES.MULTISCAN) {
        initialSettings.continuousScanning = true;
        initialSettings.decodingSpeed = Barkoder.DecodingSpeed.normal;
        initialSettings.resolution = Barkoder.BarkoderResolution.HD;
        initialSettings.continuousThreshold = -1;
    } else if (currentMode === MODES.VIN) {
        initialSettings.continuousScanning = false;
        initialSettings.decodingSpeed = Barkoder.DecodingSpeed.slow;
        initialSettings.resolution = Barkoder.BarkoderResolution.FHD;
        initialSettings.regionOfInterest = true;
    } else if (currentMode === MODES.DPM) {
        initialSettings.continuousScanning = false;
        initialSettings.decodingSpeed = Barkoder.DecodingSpeed.slow;
        initialSettings.resolution = Barkoder.BarkoderResolution.FHD;
        initialSettings.regionOfInterest = true;
    } else if (currentMode === MODES.MRZ) {
        initialSettings.continuousScanning = true;
        initialSettings.pinchToZoom = true;
        initialSettings.beepOnSuccess = true;
        initialSettings.vibrateOnSuccess = true;
    } else if (currentMode === MODES.AR_MODE) {
        initialSettings.resolution = Barkoder.BarkoderResolution.FHD;
        initialSettings.decodingSpeed = Barkoder.DecodingSpeed.slow;
        initialSettings.continuousScanning = true;
        initialSettings.arMode = Barkoder.BarkoderARMode.interactiveEnabled;
        initialSettings.arLocationType = Barkoder.BarkoderARLocationType.none;
        initialSettings.arHeaderShowMode = Barkoder.BarkoderARHeaderShowMode.onSelected;
        initialSettings.arOverlayRefresh = Barkoder.BarkoderAROverlayRefresh.normal;
        initialSettings.arDoubleTapToFreeze = false;
    } else if (currentMode === MODES.GALLERY) {
        initialSettings.decodingSpeed = Barkoder.DecodingSpeed.rigorous;
        initialSettings.continuousScanning = false;
    } else if (currentMode === MODES.DOTCODE) {
        initialSettings.regionOfInterest = true;
        initialSettings.decodingSpeed = Barkoder.DecodingSpeed.slow;
        initialSettings.resolution = Barkoder.BarkoderResolution.HD; 
        initialSettings.pinchToZoom = true;
        initialSettings.beepOnSuccess = true;
        initialSettings.vibrateOnSuccess = true;
        initialSettings.continuousScanning = true;
    } else if (currentMode === MODES.DEBLUR) {
        initialSettings.scanBlurred = true;
        initialSettings.scanDeformed = true;
    }

    return initialSettings;
};

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
    // State: Scanned barcode results
    const [scannedItems, setScannedItems] = useState<Array<{text: string, type: string, image?: string}>>([]);
    
    // State: Which barcode types are currently enabled for scanning
    const [enabledTypes, setEnabledTypes] = useState<{[key: string]: boolean}>(() => getInitialEnabledTypes(mode));
    
    // State: Camera flash on/off
    const [isFlashOn, setIsFlashOn] = useState(false);
    
    // State: Camera zoom level (1.0 = normal, 1.5 = zoomed)
    const [zoomLevel, setZoomLevel] = useState(1.0);
    
    // State: Selected camera ID ('0' = back, '1' = front)
    const [selectedCameraId, setSelectedCameraId] = useState<string>('0');
    
    // State: Whether scanning is paused (used for single-scan mode to show tap-to-continue overlay)
    const [isScanningPaused, setIsScanningPaused] = useState(false);
    
    // State: Base64 image of the frozen camera frame when paused
    const [frozenImage, setFrozenImage] = useState<string | null>(null);
    
    // State: Current scanner configuration settings
    const [settings, setSettings] = useState<ScannerSettings>(() => getInitialSettings(mode));
    
    // Ref: Reference to the Barkoder SDK instance
    const barkoderRef = useRef<Barkoder | null>(null);

    /**
     * Updates the Barkoder SDK configuration with new enabled barcode types.
     * Different barcode types require different configuration classes:
     * - BarcodeConfigWithLength: For types with variable length (Code128, Code93, etc.)
     * - BarcodeConfigWithDpmMode: For 2D codes with DPM support (QR, DataMatrix)
     * - Code39BarcodeConfig: Special config for Code39
     * - IdDocumentBarcodeConfig: For ID document scanning
     * 
     * @param newEnabledTypes - Object mapping barcode type IDs to enabled state
     */
    const updateBarkoderConfig = useCallback((newEnabledTypes: {[key: string]: boolean}) => {
        if (!barkoderRef.current) return;
    
        const decoderConfig: any = {};
        
        ALL_TYPES.forEach(type => {
            const enabled = !!newEnabledTypes[type.id];
            let config;
            
            if (['code128', 'code93', 'codabar', 'code11', 'msi'].includes(type.id)) {
                 config = new Barkoder.BarcodeConfigWithLength({ enabled });
            } else if (['qr', 'qrMicro', 'datamatrix'].includes(type.id)) {
                 config = new Barkoder.BarcodeConfigWithDpmMode({ enabled });
            } else if (type.id === 'code39') {
                 config = new Barkoder.Code39BarcodeConfig({ enabled });
            } else if (type.id === 'idDocument') {
                 config = new Barkoder.IdDocumentBarcodeConfig({ 
                   enabled,
                   masterChecksum: Barkoder.IdDocumentMasterChecksumType.disabled
                 });
            } else {
                 config = new Barkoder.BarcodeConfig({ enabled });
            }
            decoderConfig[type.id] = config;
        });
    
        barkoderRef.current.configureBarkoder(
          new Barkoder.BarkoderConfig({
            decoder: new Barkoder.DekoderConfig(decoderConfig),
          })
        );
    }, []);

    /**
     * Starts the barcode scanning process and handles scan results.
     * 
     * Behavior:
     * - Continuous mode: Keeps scanning without pausing
     * - Single-scan mode: Pauses after each scan and freezes the camera frame
     * 
     * On successful scan:
     * - Processes and formats the barcode image (full image + thumbnail)
     * - Saves to scan history via HistoryService
     * - Adds to scannedItems state
     * - Pauses scanning if not in continuous mode
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
    
            if (!settings.continuousScanning) {
                setIsScanningPaused(true);
                if (fullImage) {
                    setFrozenImage(fullImage);
                }
            }
          }
        });
    }, [settings.continuousScanning]);

    /**
     * Applies scanner settings to the Barkoder SDK instance.
     * Called when settings are loaded or reset.
     * 
     * Note: Does not clear pause state to preserve current UI state.
     * Use onUpdateSetting for user-initiated changes that should clear pause state.
     * 
     * @param newSettings - The scanner settings to apply
     */
    const applySettings = useCallback((newSettings: ScannerSettings) => {
        if (!barkoderRef.current) return;
        
        const shouldEnableImages = !(newSettings.continuousScanning && (newSettings.continuousThreshold ?? 0) < 10);
        barkoderRef.current.setImageResultEnabled(shouldEnableImages);
        barkoderRef.current.setBarcodeThumbnailOnResultEnabled(shouldEnableImages);
  
        barkoderRef.current.setEnableComposite(newSettings.compositeMode ? 1 : 0);
        barkoderRef.current.setPinchToZoomEnabled(newSettings.pinchToZoom);
        barkoderRef.current.setLocationInPreviewEnabled(newSettings.locationInPreview);
        barkoderRef.current.setRegionOfInterestVisible(newSettings.regionOfInterest);
        if (newSettings.regionOfInterest && (mode !== MODES.VIN && mode !== MODES.DPM)) {
           barkoderRef.current.setRegionOfInterest(5, 5, 90, 90);
        }
        barkoderRef.current.setBeepOnSuccessEnabled(newSettings.beepOnSuccess);
        barkoderRef.current.setVibrateOnSuccessEnabled(newSettings.vibrateOnSuccess);
        barkoderRef.current.setUpcEanDeblurEnabled(newSettings.scanBlurred);
        barkoderRef.current.setEnableMisshaped1DEnabled(newSettings.scanDeformed);
        barkoderRef.current.setCloseSessionOnResultEnabled(!newSettings.continuousScanning);
        barkoderRef.current.setDecodingSpeed(newSettings.decodingSpeed);
        barkoderRef.current.setBarkoderResolution(newSettings.resolution);
        
        if (mode === MODES.AR_MODE) {
            barkoderRef.current.setARMode(newSettings.arMode!);
            barkoderRef.current.setARLocationType(newSettings.arLocationType!);
            barkoderRef.current.setARHeaderShowMode(newSettings.arHeaderShowMode!);
            barkoderRef.current.setAROverlayRefresh(newSettings.arOverlayRefresh!);
            barkoderRef.current.setARDoubleTapToFreezeEnabled(newSettings.arDoubleTapToFreeze!);
        }
        
        if (newSettings.continuousScanning) {
            barkoderRef.current.setThresholdBetweenDuplicatesScans(newSettings.continuousThreshold ?? 0);
            startScanning();
        }
    }, [mode, startScanning]);

    /**
     * Updates a single scanner setting and applies it to the Barkoder SDK.
     * User-initiated setting changes via the settings UI.
     * 
     * Special handling:
     * - continuousScanning ON: Clears pause overlay, sets threshold, restarts scanning
     * - continuousScanning OFF: Allows pause overlay to show on next scan
     * - continuousThreshold: Restarts scanning to apply new threshold if continuous mode is active
     * 
     * @param key - The setting key to update
     * @param value - The new value for the setting
     */
    const onUpdateSetting = useCallback((key: keyof ScannerSettings, value: any) => {
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);
        
        if (!barkoderRef.current) return;
    
        const shouldEnableImages = !(newSettings.continuousScanning && (newSettings.continuousThreshold ?? 0) < 10);
        barkoderRef.current.setImageResultEnabled(shouldEnableImages);
        barkoderRef.current.setBarcodeThumbnailOnResultEnabled(shouldEnableImages);
    
        switch (key) {
            case 'compositeMode':
                barkoderRef.current.setEnableComposite(value ? 1 : 0);
                break;
            case 'pinchToZoom':
                barkoderRef.current.setPinchToZoomEnabled(value);
                break;
            case 'locationInPreview':
                barkoderRef.current.setLocationInPreviewEnabled(value);
                break;
            case 'regionOfInterest':
                barkoderRef.current.setRegionOfInterestVisible(value);
                if (value && (mode !== MODES.VIN && mode !== MODES.DPM)) {
                    barkoderRef.current.setRegionOfInterest(5, 5, 90, 90); 
                }
                break;
            case 'beepOnSuccess':
                barkoderRef.current.setBeepOnSuccessEnabled(value);
                break;
            case 'vibrateOnSuccess':
                barkoderRef.current.setVibrateOnSuccessEnabled(value);
                break;
            case 'scanBlurred':
                barkoderRef.current.setUpcEanDeblurEnabled(value);
                break;
            case 'scanDeformed':
                barkoderRef.current.setEnableMisshaped1DEnabled(value);
                break;
            case 'continuousScanning':
                barkoderRef.current.setCloseSessionOnResultEnabled(!value);
                if (value) {
                    // When enabling continuous scanning, set the threshold immediately
                    barkoderRef.current.setThresholdBetweenDuplicatesScans(newSettings.continuousThreshold ?? 0);
                    // Clear any pause state
                    setIsScanningPaused(false);
                    setFrozenImage(null);
                    // Stop any ongoing scanning first
                    barkoderRef.current.stopScanning();
                    // Restart with new settings
                    setTimeout(() => startScanning(), 100);
                }
                break;
            case 'decodingSpeed':
                barkoderRef.current.setDecodingSpeed(value);
                break;
            case 'resolution':
                barkoderRef.current.setBarkoderResolution(value);
                break;
            case 'arMode':
                barkoderRef.current.setARMode(value);
                break;
            case 'arLocationType':
                barkoderRef.current.setARLocationType(value);
                break;
            case 'arHeaderShowMode':
                barkoderRef.current.setARHeaderShowMode(value);
                break;
            case 'arOverlayRefresh':
                barkoderRef.current.setAROverlayRefresh(value);
                break;
            case 'arDoubleTapToFreeze':
                barkoderRef.current.setARDoubleTapToFreezeEnabled(value);
                break;
            case 'continuousThreshold':
                barkoderRef.current.setThresholdBetweenDuplicatesScans(value);
                // If continuous scanning is enabled, restart to apply new threshold
                if (newSettings.continuousScanning) {
                    barkoderRef.current.stopScanning();
                    startScanning();
                }
                break;
        }
    }, [settings, mode, startScanning]);

    /**
     * Toggles a single barcode type on or off.
     * Updates both state and SDK configuration.
     * 
     * @param typeId - The barcode type ID to toggle
     * @param enabled - Whether to enable or disable the type
     */
    const onToggleBarcodeType = useCallback((typeId: string, enabled: boolean) => {
        const newEnabledTypes = { ...enabledTypes, [typeId]: enabled };
        setEnabledTypes(newEnabledTypes);
        updateBarkoderConfig(newEnabledTypes);
    }, [enabledTypes, updateBarkoderConfig]);

    /**
     * Enables or disables all barcode types in a category (1D or 2D).
     * Useful for bulk enabling/disabling groups of barcode types.
     * 
     * @param enabled - Whether to enable or disable all types
     * @param category - '1D' for linear barcodes, '2D' for matrix barcodes
     */
    const onEnableAllBarcodeTypes = useCallback((enabled: boolean, category: '1D' | '2D') => {
        const typesToUpdate = category === '1D' ? BARCODE_TYPES_1D : BARCODE_TYPES_2D;
        const newEnabledTypes = { ...enabledTypes };
        typesToUpdate.forEach(type => {
            newEnabledTypes[type.id] = enabled;
        });
        setEnabledTypes(newEnabledTypes);
        updateBarkoderConfig(newEnabledTypes);
    }, [enabledTypes, updateBarkoderConfig]);

    /**
     * Resets all scanner settings and enabled types to their mode-specific defaults.
     * Useful for returning to a known good configuration.
     */
    const resetConfig = useCallback(() => {
        const newSettings = getInitialSettings(mode);
        setSettings(newSettings);
        applySettings(newSettings);
  
        const newEnabledTypes = getInitialEnabledTypes(mode);
        setEnabledTypes(newEnabledTypes);
        updateBarkoderConfig(newEnabledTypes);
    }, [mode, applySettings, updateBarkoderConfig]);

    /**
     * Opens the device image picker and scans a barcode from a selected photo.
     * Used in Gallery mode to scan from saved images instead of live camera.
     * 
     * Process:
     * 1. Launch image picker with base64 encoding
     * 2. Send image to Barkoder SDK for processing
     * 3. Add detected barcode to scannedItems
     * 4. Show alert if no barcode found
     */
    const scanImagePressed = useCallback(async () => {
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
     * Callback fired when the BarkoderView component is created and ready.
     * Performs initial SDK configuration and starts scanning.
     * 
     * Configuration steps:
     * 1. Configure enabled barcode types
     * 2. Set up image result handling (optimized for continuous scanning)
     * 3. Apply all scanner settings
     * 4. Apply mode-specific configurations (VIN, DPM, AR, etc.)
     * 5. Start scanning (except in Gallery mode)
     * 
     * @param barkoder - The Barkoder SDK instance
     */
    const onBarkoderViewCreated = useCallback((barkoder: Barkoder) => {
        barkoderRef.current = barkoder;
        
        const decoderConfig: any = {};
        
        ALL_TYPES.forEach(type => {
            const enabled = !!enabledTypes[type.id];
            let config;
            
            if (['code128', 'code93', 'codabar', 'code11', 'msi'].includes(type.id)) {
                 config = new Barkoder.BarcodeConfigWithLength({ enabled });
            } else if (['qr', 'qrMicro', 'datamatrix'].includes(type.id)) {
                 config = new Barkoder.BarcodeConfigWithDpmMode({ enabled });
            } else if (type.id === 'code39') {
                 config = new Barkoder.Code39BarcodeConfig({ enabled });
            } else if (type.id === 'idDocument') {
                 config = new Barkoder.IdDocumentBarcodeConfig({ 
                   enabled,
                   masterChecksum: Barkoder.IdDocumentMasterChecksumType.disabled
                 });
            } else {
                 config = new Barkoder.BarcodeConfig({ enabled });
            }
            decoderConfig[type.id] = config;
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

    /**
     * Toggles the camera flash on or off.
     */
    const toggleFlash = useCallback(() => {
        const newFlashState = !isFlashOn;
        setIsFlashOn(newFlashState);
        barkoderRef.current?.setFlashEnabled(newFlashState);
    }, [isFlashOn]);
    
    /**
     * Toggles between normal (1.0x) and zoomed (1.5x) camera view.
     */
    const toggleZoom = useCallback(() => {
        const newZoomLevel = zoomLevel === 1.0 ? 1.5 : 1.0;
        setZoomLevel(newZoomLevel);
        barkoderRef.current?.setZoomFactor(newZoomLevel);
    }, [zoomLevel]);
    
    /**
     * Switches between back camera (0) and front camera (1).
     */
    const toggleCamera = useCallback(() => {
        const newCameraId = selectedCameraId === '0' ? '1' : '0';
        setSelectedCameraId(newCameraId);
        barkoderRef.current?.setCamera(parseInt(newCameraId, 10));
    }, [selectedCameraId]);

    /**
     * Effect: Load saved settings from persistent storage on mount.
     * Restores user's previous settings for this scanning mode.
     */
    useEffect(() => {
        const loadSettings = async () => {
          const saved = await SettingsService.getSettings(mode);
          if (saved) {
            if (saved.enabledTypes) {
                setEnabledTypes(saved.enabledTypes);
                if (barkoderRef.current) {
                    updateBarkoderConfig(saved.enabledTypes);
                }
            }
            if (saved.scannerSettings) {
                setSettings(saved.scannerSettings);
                if (barkoderRef.current) {
                    applySettings(saved.scannerSettings);
                }
            }
          }
        };
        loadSettings();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mode]);
    
    /**
     * Effect: Save settings to persistent storage whenever they change.
     * Uses a 500ms debounce to avoid excessive file writes.
     */
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
