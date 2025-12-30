import { Barkoder } from 'barkoder-react-native';

export interface ScannerSettings {
  compositeMode: boolean;
  pinchToZoom: boolean;
  locationInPreview: boolean;
  regionOfInterest: boolean;
  beepOnSuccess: boolean;
  vibrateOnSuccess: boolean;
  scanBlurred: boolean;
  scanDeformed: boolean;
  continuousScanning: boolean;
  decodingSpeed: Barkoder.DecodingSpeed;
  resolution: Barkoder.BarkoderResolution;
  arMode?: Barkoder.BarkoderARMode;
  arLocationType?: Barkoder.BarkoderARLocationType;
  arHeaderShowMode?: Barkoder.BarkoderARHeaderShowMode;
  arOverlayRefresh?: Barkoder.BarkoderAROverlayRefresh;
  arDoubleTapToFreeze?: boolean;
  continuousThreshold?: number; // 0-10, -1 for unlimited
}