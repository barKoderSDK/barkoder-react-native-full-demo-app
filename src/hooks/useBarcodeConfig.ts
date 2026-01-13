import { useCallback } from 'react';
import { Barkoder } from 'barkoder-react-native';
import { BARCODE_TYPES_1D, BARCODE_TYPES_2D } from '../constants/settingTypes';
import { createBarcodeConfig } from '../utils/scannerConfig';

const ALL_TYPES = [...BARCODE_TYPES_1D, ...BARCODE_TYPES_2D];

/**
 * Hook for managing barcode type configuration
 */
export const useBarcodeConfig = (barkoderRef: React.RefObject<Barkoder | null>) => {
    /**
     * Updates the Barkoder SDK configuration with new enabled barcode types.
     */
    const updateBarkoderConfig = useCallback((enabledTypes: {[key: string]: boolean}) => {
        if (!barkoderRef.current) return;
    
        const decoderConfig: any = {};
        
        ALL_TYPES.forEach(type => {
            const enabled = !!enabledTypes[type.id];
            decoderConfig[type.id] = createBarcodeConfig(type.id, enabled);
        });
    
        barkoderRef.current.configureBarkoder(
            new Barkoder.BarkoderConfig({
                decoder: new Barkoder.DekoderConfig(decoderConfig),
            })
        );
    }, [barkoderRef]);

    /**
     * Toggles a single barcode type on or off.
     */
    const toggleBarcodeType = useCallback((
        typeId: string, 
        enabled: boolean,
        currentEnabledTypes: {[key: string]: boolean}
    ) => {
        const newEnabledTypes = { ...currentEnabledTypes, [typeId]: enabled };
        updateBarkoderConfig(newEnabledTypes);
        return newEnabledTypes;
    }, [updateBarkoderConfig]);

    /**
     * Enables or disables all barcode types in a category (1D or 2D).
     */
    const enableAllBarcodeTypes = useCallback((
        enabled: boolean, 
        category: '1D' | '2D',
        currentEnabledTypes: {[key: string]: boolean}
    ) => {
        const typesToUpdate = category === '1D' ? BARCODE_TYPES_1D : BARCODE_TYPES_2D;
        const newEnabledTypes = { ...currentEnabledTypes };
        
        typesToUpdate.forEach(type => {
            newEnabledTypes[type.id] = enabled;
        });
        
        updateBarkoderConfig(newEnabledTypes);
        return newEnabledTypes;
    }, [updateBarkoderConfig]);

    return {
        updateBarkoderConfig,
        toggleBarcodeType,
        enableAllBarcodeTypes,
    };
};
