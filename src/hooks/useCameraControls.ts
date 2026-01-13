import { useState, useCallback } from 'react';
import { Barkoder } from 'barkoder-react-native';

/**
 * Hook for managing camera controls (flash, zoom, camera switching)
 */
export const useCameraControls = (barkoderRef: React.RefObject<Barkoder | null>) => {
    const [isFlashOn, setIsFlashOn] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1.0);
    const [selectedCameraId, setSelectedCameraId] = useState<string>('0');

    /**
     * Toggles the camera flash on or off.
     */
    const toggleFlash = useCallback(() => {
        const newFlashState = !isFlashOn;
        setIsFlashOn(newFlashState);
        barkoderRef.current?.setFlashEnabled(newFlashState);
    }, [isFlashOn, barkoderRef]);
    
    /**
     * Toggles between normal (1.0x) and zoomed (1.5x) camera view.
     */
    const toggleZoom = useCallback(() => {
        const newZoomLevel = zoomLevel === 1.0 ? 1.5 : 1.0;
        setZoomLevel(newZoomLevel);
        barkoderRef.current?.setZoomFactor(newZoomLevel);
    }, [zoomLevel, barkoderRef]);
    
    /**
     * Switches between back camera (0) and front camera (1).
     */
    const toggleCamera = useCallback(() => {
        const newCameraId = selectedCameraId === '0' ? '1' : '0';
        setSelectedCameraId(newCameraId);
        barkoderRef.current?.setCamera(parseInt(newCameraId, 10));
    }, [selectedCameraId, barkoderRef]);

    return {
        isFlashOn,
        zoomLevel,
        selectedCameraId,
        toggleFlash,
        toggleZoom,
        toggleCamera,
    };
};
