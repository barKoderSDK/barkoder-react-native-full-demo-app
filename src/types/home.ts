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
