import { useCallback } from 'react';
import { Barkoder } from 'barkoder-react-native';
import { ScannerSettings } from '../types/types';
import { MODES } from '../constants/constants';

export const useBarkoderSettings = (
    barkoderRef: React.RefObject<Barkoder | null>,
    mode: string,
    startScanning: () => void
) => {
    const applySettings = useCallback((settings: ScannerSettings) => {
        if (!barkoderRef.current) return;
        
        barkoderRef.current.setImageResultEnabled(true);
        barkoderRef.current.setBarcodeThumbnailOnResultEnabled(true);
        const compositeEnabled = mode === 'v1' ? settings.compositeMode : false;
        barkoderRef.current.setEnableComposite(compositeEnabled ? 1 : 0);
        barkoderRef.current.setPinchToZoomEnabled(settings.pinchToZoom);
        barkoderRef.current.setLocationInPreviewEnabled(settings.locationInPreview);
        barkoderRef.current.setRegionOfInterestVisible(settings.regionOfInterest);
        
        if (settings.regionOfInterest && mode !== MODES.VIN && mode !== MODES.DPM) {
           barkoderRef.current.setRegionOfInterest(5, 5, 90, 90);
        }
        
        barkoderRef.current.setBeepOnSuccessEnabled(settings.beepOnSuccess);
        barkoderRef.current.setVibrateOnSuccessEnabled(settings.vibrateOnSuccess);
        barkoderRef.current.setUpcEanDeblurEnabled(settings.scanBlurred);
        barkoderRef.current.setEnableMisshaped1DEnabled(settings.scanDeformed);
        barkoderRef.current.setCloseSessionOnResultEnabled(!settings.continuousScanning);
        barkoderRef.current.setDecodingSpeed(settings.decodingSpeed);
        barkoderRef.current.setBarkoderResolution(settings.resolution);
        
        if (mode === MODES.AR_MODE && settings.arMode) {
            barkoderRef.current.setARMode(settings.arMode);
            barkoderRef.current.setARLocationType(settings.arLocationType!);
            barkoderRef.current.setARHeaderShowMode(settings.arHeaderShowMode!);
            barkoderRef.current.setAROverlayRefresh(settings.arOverlayRefresh!);
            barkoderRef.current.setARDoubleTapToFreezeEnabled(settings.arDoubleTapToFreeze!);
        }
        
        if (settings.continuousScanning) {
            barkoderRef.current.setThresholdBetweenDuplicatesScans(settings.continuousThreshold ?? 0);
        }
    }, [barkoderRef, mode]);

    const updateSingleSetting = useCallback((
        key: keyof ScannerSettings, 
        value: any,
        currentSettings: ScannerSettings,
        clearPauseState: () => void
    ): ScannerSettings => {
        const newSettings = { ...currentSettings, [key]: value };
        if (!barkoderRef.current) return newSettings;
    
        barkoderRef.current.setImageResultEnabled(true);
        barkoderRef.current.setBarcodeThumbnailOnResultEnabled(true);
    
        switch (key) {
            case 'compositeMode': {
                const compositeEnabled = mode === 'v1' ? value : false;
                barkoderRef.current.setEnableComposite(compositeEnabled ? 1 : 0);
                break;
            }
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
                    barkoderRef.current.setThresholdBetweenDuplicatesScans(newSettings.continuousThreshold ?? 0);
                    clearPauseState();
                    barkoderRef.current.stopScanning();
                    setTimeout(() => startScanning(), 100);
                } else {
                    clearPauseState();
                    barkoderRef.current.stopScanning();
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
                if (newSettings.continuousScanning) {
                    barkoderRef.current.stopScanning();
                    startScanning();
                }
                break;
        }
        
        return newSettings;
    }, [barkoderRef, mode, startScanning]);

    return {
        applySettings,
        updateSingleSetting,
    };
};
