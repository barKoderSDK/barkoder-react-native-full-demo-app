import { BARCODE_TYPES_1D } from '../constants/constants';

export const normalize = (str: string) => str.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

export const is1D = (type: string) => {
  const normalizedType = normalize(type);
  return BARCODE_TYPES_1D.some(t => normalize(t.label) === normalizedType || normalize(t.id) === normalizedType);
};
