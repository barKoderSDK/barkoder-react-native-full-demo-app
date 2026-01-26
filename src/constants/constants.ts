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
import { HomeSection } from '../types/types';

export const BARCODE_TYPES_1D = [
  { id: 'australianPost', label: 'Australian Post' },
  { id: 'codabar', label: 'Codabar' },
  { id: 'code11', label: 'Code 11' },
  { id: 'code128', label: 'Code 128' },
  { id: 'code25', label: 'Code 2 of 5 Standard' },
  { id: 'code32', label: 'Code 32' },
  { id: 'code39', label: 'Code 39' },
  { id: 'code93', label: 'Code 93' },
  { id: 'coop25', label: 'COOP 25' },
  { id: 'datalogic25', label: 'Code 2 of 5 Datalogic' },
  { id: 'databar14', label: 'GS1 Databar 14' },
  { id: 'databarExpanded', label: 'GS1 Databar Expanded' },
  { id: 'databarLimited', label: 'GS1 Databar Limited' },
  { id: 'ean13', label: 'EAN 13' },
  { id: 'ean8', label: 'EAN 8' },
  { id: 'iata25', label: 'IATA 25' },
  { id: 'interleaved25', label: 'Interleaved 2 of 5' },
  { id: 'itf14', label: 'ITF 14' },
  { id: 'japanesePost', label: 'Japanese Post' },
  { id: 'kix', label: 'KIX' },
  { id: 'matrix25', label: 'Matrix 25' },
  { id: 'msi', label: 'MSI' },
  { id: 'planet', label: 'Planet' },
  { id: 'postalIMB', label: 'Postal IMB' },
  { id: 'postnet', label: 'Postnet' },
  { id: 'royalMail', label: 'Royal Mail' },
  { id: 'telepen', label: 'Telepen' },
  { id: 'upcA', label: 'UPC-A' },
  { id: 'upcE', label: 'UPC-E' },
  { id: 'upcE1', label: 'UPC-E1' },
];

export const BARCODE_TYPES_2D = [
  { id: 'aztec', label: 'Aztec' },
  { id: 'aztecCompact', label: 'Aztec Compact' },
  { id: 'datamatrix', label: 'Datamatrix' },
  { id: 'dotcode', label: 'Dotcode' },
  { id: 'idDocument', label: 'ID Document' },
  { id: 'maxiCode', label: 'MaxiCode' },
  { id: 'ocrText', label: 'OCR Text' },
  { id: 'pdf417', label: 'PDF 417' },
  { id: 'pdf417Micro', label: 'PDF 417 Micro' },
  { id: 'qr', label: 'QR' },
  { id: 'qrMicro', label: 'QR Micro' },
];

export const MODES = {
  MODE_1D: 'mode_1d',
  MODE_2D: 'mode_2d',
  CONTINUOUS: 'continuous',
  MULTISCAN: 'multiscan',
  VIN: 'vin',
  DPM: 'dpm',
  DEBLUR: 'deblur',
  DOTCODE: 'dotcode',
  AR_MODE: 'ar_mode',
  MRZ: 'mrz',
  GALLERY: 'gallery',
};

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
