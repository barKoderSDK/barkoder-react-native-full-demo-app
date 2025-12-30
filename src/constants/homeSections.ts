import Icon1D from '../assets/icons/icon_1d.svg';
import Icon2D from '../assets/icons/icon_2d.svg';
import IconContinuous from '../assets/icons/icon_continuous.svg';
import IconMultiscan from '../assets/icons/icon_multiscan.svg';
import IconVin from '../assets/icons/icon_vin.svg';
import IconDpm from '../assets/icons/icon_dpm.svg';
import IconBlur from '../assets/icons/icon_blur.svg';
import IconDotCode from '../assets/icons/icon_dotcode.svg';
import IconAr from '../assets/icons/icon_ar.svg';
import IconMrz from '../assets/icons/icon_mrz.svg';
import IconGallery from '../assets/icons/icon_gallery.svg';
import { MODES } from './modes';
import { HomeSection } from '../types/home';

export const SECTIONS: HomeSection[] = [
  {
    title: 'General Barcodes',
    data: [
      {
        id: '1d',
        label: '1D',
        Icon: Icon1D,
        mode: MODES.MODE_1D,
      },
      {
        id: '2d',
        label: '2D',
        Icon: Icon2D,
        mode: MODES.MODE_2D,
      },
      {
        id: 'continuous',
        label: 'Continuous',
        Icon: IconContinuous,
        mode: MODES.CONTINUOUS,
      },
    ],
  },
  {
    title: 'Showcase',
    data: [
      {
        id: 'multiscan',
        label: 'MultiScan',
        Icon: IconMultiscan,
        mode: MODES.MULTISCAN,
      },
      {
        id: 'vin',
        label: 'VIN',
        Icon: IconVin,
        mode: MODES.VIN,
      },
      {
        id: 'dpm',
        label: 'DPM',
        Icon: IconDpm,
        mode: MODES.DPM,
      },
      {
        id: 'deblur',
        label: 'DeBlur',
        Icon: IconBlur,
        mode: MODES.DEBLUR,
      },
      {
        id: 'dotcode',
        label: 'DotCode',
        Icon: IconDotCode,
        mode: MODES.DOTCODE,
      },
      {
        id: 'ar_mode',
        label: 'AR Mode',
        Icon: IconAr,
        mode: MODES.AR_MODE,
      },
      {
        id: 'mrz',
        label: 'MRZ',
        Icon: IconMrz,
        mode: MODES.MRZ,
      },
      {
        id: 'gallery',
        label: 'Gallery Scan',
        Icon: IconGallery,
        mode: MODES.GALLERY,
      },
    ],
  },
];
