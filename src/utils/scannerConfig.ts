import { Barkoder } from 'barkoder-react-native';
import { ScannerSettings } from '../types/types';
import { BARCODE_TYPES_1D, BARCODE_TYPES_2D } from '../constants/constants';
import { MODES } from '../constants/constants';

const ALL_TYPES = [...BARCODE_TYPES_1D, ...BARCODE_TYPES_2D];
const DEFAULT_ENABLED = ['ean13', 'upcA', 'code128', 'qr', 'datamatrix'];

export const getInitialEnabledTypes = (mode: string): {[key: string]: boolean} => {
    const types: {[key: string]: boolean} = {};
    
    ALL_TYPES.forEach(t => { 
        if (mode === MODES.MODE_1D) {
            types[t.id] = BARCODE_TYPES_1D.some(b => b.id === t.id);
        } else if (mode === MODES.MODE_2D) {
            const is2DType = BARCODE_TYPES_2D.some(b => b.id === t.id);
            types[t.id] = is2DType && t.id !== 'ocrText';
        } else if (mode === MODES.CONTINUOUS || mode === 'v1') {
            types[t.id] = t.id !== 'ocrText';
        } else if (mode === MODES.DOTCODE) {
            types[t.id] = t.id === 'dotcode';
        } else if (mode === MODES.MRZ) {
            types[t.id] = t.id === 'idDocument';
        } else if (mode === MODES.VIN) {
            types[t.id] = ['code39', 'code128', 'qr', 'datamatrix', 'ocrText'].includes(t.id);
        } else if (mode === MODES.AR_MODE) {
            types[t.id] = ['qr', 'code128', 'code39', 'upcA', 'upcE', 'ean13', 'ean8'].includes(t.id);
        } else {
            types[t.id] = t.id !== 'ocrText' && DEFAULT_ENABLED.includes(t.id); 
        }
    });
    
    return types;
};

export const getInitialSettings = (currentMode: string): ScannerSettings => {
    const baseSettings: ScannerSettings = {
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
        continuousThreshold: 0,
        showResultSheet: true,
    };

    const modeSettings: Partial<ScannerSettings> = (() => {
        switch (currentMode) {
            case MODES.CONTINUOUS:
                return { continuousScanning: true };
                
            case MODES.MULTISCAN:
                return {
                    continuousScanning: true,
                    continuousThreshold: -1,
                };
                
            case MODES.VIN:
                return {
                    decodingSpeed: Barkoder.DecodingSpeed.slow,
                    resolution: Barkoder.BarkoderResolution.FHD,
                    regionOfInterest: true,
                    scanDeformed: true,
                };
                
            case MODES.DPM:
                return {
                    decodingSpeed: Barkoder.DecodingSpeed.slow,
                    resolution: Barkoder.BarkoderResolution.FHD,
                    regionOfInterest: true,
                };
                
            case MODES.MRZ:
                return { continuousScanning: false };
                
            case MODES.AR_MODE:
                return {
                    resolution: Barkoder.BarkoderResolution.FHD,
                    decodingSpeed: Barkoder.DecodingSpeed.slow,
                    continuousScanning: true,
                    arMode: Barkoder.BarkoderARMode.interactiveEnabled,
                    arLocationType: Barkoder.BarkoderARLocationType.none,
                    arHeaderShowMode: Barkoder.BarkoderARHeaderShowMode.onSelected,
                    arOverlayRefresh: Barkoder.BarkoderAROverlayRefresh.normal,
                    arDoubleTapToFreeze: false,
                };
                
            case MODES.GALLERY:
                return {
                    decodingSpeed: Barkoder.DecodingSpeed.rigorous,
                };
                
            case MODES.DOTCODE:
                return {
                    regionOfInterest: true,
                    decodingSpeed: Barkoder.DecodingSpeed.slow,
                    continuousScanning: true,
                };
                
            case MODES.DEBLUR:
                return {
                    scanBlurred: true,
                    scanDeformed: true,
                };
                
            default:
                return {};
        }
    })();

    return { ...baseSettings, ...modeSettings };
};

export const createBarcodeConfig = (typeId: string, enabled: boolean) => {
    if (['code128', 'code93', 'codabar', 'code11', 'msi'].includes(typeId)) {
        return new Barkoder.BarcodeConfigWithLength({ enabled });
    }
    
    if (['qr', 'qrMicro', 'datamatrix'].includes(typeId)) {
        return new Barkoder.BarcodeConfigWithDpmMode({ enabled });
    }
    
    if (typeId === 'code39') {
        return new Barkoder.Code39BarcodeConfig({ enabled });
    }
    
    if (typeId === 'idDocument') {
        return new Barkoder.IdDocumentBarcodeConfig({ 
            enabled,
            masterChecksum: Barkoder.IdDocumentMasterChecksumType.disabled
        });
    }
    
    if (typeId === 'ocrText') {
        return new Barkoder.BarcodeConfig({ enabled });
    }
    
    return new Barkoder.BarcodeConfig({ enabled });
};
