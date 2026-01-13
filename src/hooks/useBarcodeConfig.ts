import { useCallback } from 'react';
import { Barkoder } from 'barkoder-react-native';
import { BARCODE_TYPES_1D, BARCODE_TYPES_2D } from '../constants/constants';
import { createBarcodeConfig } from '../utils/scannerConfig';

const ALL_TYPES = [...BARCODE_TYPES_1D, ...BARCODE_TYPES_2D];

export const useBarcodeConfig = (barkoderRef: React.RefObject<Barkoder | null>) => {
    const updateBarkoderConfig = useCallback((enabledTypes: {[key: string]: boolean}) => {
        if (!barkoderRef.current) return;
    
        const decoderConfig: any = {};
        ALL_TYPES.forEach(type => {
            decoderConfig[type.id] = createBarcodeConfig(type.id, !!enabledTypes[type.id]);
        });
    
        barkoderRef.current.configureBarkoder(
            new Barkoder.BarkoderConfig({
                decoder: new Barkoder.DekoderConfig(decoderConfig),
            })
        );
    }, [barkoderRef]);

    const toggleBarcodeType = useCallback((
        typeId: string, 
        enabled: boolean,
        currentEnabledTypes: {[key: string]: boolean}
    ) => {
        const newEnabledTypes = { ...currentEnabledTypes, [typeId]: enabled };
        updateBarkoderConfig(newEnabledTypes);
        return newEnabledTypes;
    }, [updateBarkoderConfig]);

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

    return { updateBarkoderConfig, toggleBarcodeType, enableAllBarcodeTypes };
};
