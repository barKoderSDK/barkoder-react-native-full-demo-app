import { useCallback } from 'react';
import { Barkoder } from 'barkoder-react-native';
import { ScannerSettings } from '../types/ScannerSettings';
import { MODES } from '../constants/modes';

/**
 * Hook for applying scanner settings to Barkoder instance
 */
export const useBarkoderSettings = (
    barkoderRef: React.RefObject<Barkoder | null>,
    mode: string,
    startScanning: () => void
) => {
    /**
     * Applies all scanner settings to the Barkoder SDK instance.
     */
    const applySettings = useCallback((settings: ScannerSettings) => {
        if (!barkoderRef.current) return;
        
        const shouldEnableImages = !(settings.continuousScanning && (settings.continuousThreshold ?? 0) < 10);
        
        // Image settings
        barkoderRef.current.setImageResultEnabled(shouldEnableImages);
        barkoderRef.current.setBarcodeThumbnailOnResultEnabled(shouldEnableImages);
  
        // General settings
        barkoderRef.current.setEnableComposite(settings.compositeMode ? 1 : 0);
        barkoderRef.current.setPinchToZoomEnabled(settings.pinchToZoom);
        barkoderRef.current.setLocationInPreviewEnabled(settings.locationInPreview);
        barkoderRef.current.setRegionOfInterestVisible(settings.regionOfInterest);
        
        // Region of Interest
        if (settings.regionOfInterest && (mode !== MODES.VIN && mode !== MODES.DPM)) {
           barkoderRef.current.setRegionOfInterest(5, 5, 90, 90);
        }
        
        // Feedback
        barkoderRef.current.setBeepOnSuccessEnabled(settings.beepOnSuccess);
        barkoderRef.current.setVibrateOnSuccessEnabled(settings.vibrateOnSuccess);
        
        // Quality enhancement
        barkoderRef.current.setUpcEanDeblurEnabled(settings.scanBlurred);
        barkoderRef.current.setEnableMisshaped1DEnabled(settings.scanDeformed);
        
        // Scanning behavior
        barkoderRef.current.setCloseSessionOnResultEnabled(!settings.continuousScanning);
        barkoderRef.current.setDecodingSpeed(settings.decodingSpeed);
        barkoderRef.current.setBarkoderResolution(settings.resolution);
        
        // AR Mode
        if (mode === MODES.AR_MODE && settings.arMode) {
            barkoderRef.current.setARMode(settings.arMode);
            barkoderRef.current.setARLocationType(settings.arLocationType!);
            barkoderRef.current.setARHeaderShowMode(settings.arHeaderShowMode!);
            barkoderRef.current.setAROverlayRefresh(settings.arOverlayRefresh!);
            barkoderRef.current.setARDoubleTapToFreezeEnabled(settings.arDoubleTapToFreeze!);
        }
        
        // Continuous scanning threshold
        if (settings.continuousScanning) {
            barkoderRef.current.setThresholdBetweenDuplicatesScans(settings.continuousThreshold ?? 0);
        }
    }, [barkoderRef, mode]);

    /**
     * Updates a single setting and applies it to the Barkoder SDK.
     */
    const updateSingleSetting = useCallback((
        key: keyof ScannerSettings, 
        value: any,
        currentSettings: ScannerSettings,
        clearPauseState: () => void
    ): ScannerSettings => {
        const newSettings = { ...currentSettings, [key]: value };
        
        if (!barkoderRef.current) return newSettings;
    
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
                    // Turning ON continuous scanning
                    barkoderRef.current.setThresholdBetweenDuplicatesScans(newSettings.continuousThreshold ?? 0);
                    clearPauseState();
                    barkoderRef.current.stopScanning();
                    setTimeout(() => startScanning(), 100);
                } else {
                    // Turning OFF continuous scanning
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
