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

export const useScannerLogic = (mode: string) => {
    const [scannedItems, setScannedItems] = useState<Array<{text: string, type: string, image?: string}>>([]);
    const [enabledTypes, setEnabledTypes] = useState<{[key: string]: boolean}>(() => getInitialEnabledTypes(mode));
    const [isFlashOn, setIsFlashOn] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1.0);
    const [selectedCameraId, setSelectedCameraId] = useState<string>('0');
    const [isScanningPaused, setIsScanningPaused] = useState(false);
    const [frozenImage, setFrozenImage] = useState<string | null>(null);
    const [settings, setSettings] = useState<ScannerSettings>(() => getInitialSettings(mode));
    
    const barkoderRef = useRef<Barkoder | null>(null);

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
                    startScanning();
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
                break;
        }
    }, [settings, mode, startScanning]);

    const onToggleBarcodeType = useCallback((typeId: string, enabled: boolean) => {
        const newEnabledTypes = { ...enabledTypes, [typeId]: enabled };
        setEnabledTypes(newEnabledTypes);
        updateBarkoderConfig(newEnabledTypes);
    }, [enabledTypes, updateBarkoderConfig]);

    const onEnableAllBarcodeTypes = useCallback((enabled: boolean, category: '1D' | '2D') => {
        const typesToUpdate = category === '1D' ? BARCODE_TYPES_1D : BARCODE_TYPES_2D;
        const newEnabledTypes = { ...enabledTypes };
        typesToUpdate.forEach(type => {
            newEnabledTypes[type.id] = enabled;
        });
        setEnabledTypes(newEnabledTypes);
        updateBarkoderConfig(newEnabledTypes);
    }, [enabledTypes, updateBarkoderConfig]);

    const resetConfig = useCallback(() => {
        const newSettings = getInitialSettings(mode);
        setSettings(newSettings);
        applySettings(newSettings);
  
        const newEnabledTypes = getInitialEnabledTypes(mode);
        setEnabledTypes(newEnabledTypes);
        updateBarkoderConfig(newEnabledTypes);
    }, [mode, applySettings, updateBarkoderConfig]);

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

    const toggleFlash = useCallback(() => {
        const newFlashState = !isFlashOn;
        setIsFlashOn(newFlashState);
        barkoderRef.current?.setFlashEnabled(newFlashState);
    }, [isFlashOn]);
    
    const toggleZoom = useCallback(() => {
        const newZoomLevel = zoomLevel === 1.0 ? 1.5 : 1.0;
        setZoomLevel(newZoomLevel);
        barkoderRef.current?.setZoomFactor(newZoomLevel);
    }, [zoomLevel]);
    
    const toggleCamera = useCallback(() => {
        const newCameraId = selectedCameraId === '0' ? '1' : '0';
        setSelectedCameraId(newCameraId);
        barkoderRef.current?.setCamera(parseInt(newCameraId, 10));
    }, [selectedCameraId]);

    // Load settings on mount
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
    
    // Save settings when they change
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
