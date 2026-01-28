import { SvgProps } from 'react-native-svg';

export interface HomeItem {
  id: string;
  label: string;
  Icon: React.FC<SvgProps>;
  mode: string;
  action?: string;
  url?: string;
}

export interface HomeSection {
  title: string;
  data: HomeItem[];
}

export type RootStackParamList = {
  Home: undefined;
  Scanner: { mode: string; sessionId?: number };
  BarcodeDetails: { item: { text: string; type: string; image?: string } };
  About: undefined;
};

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
  showResultSheet?: boolean; // Show/hide bottom result sheet
}
