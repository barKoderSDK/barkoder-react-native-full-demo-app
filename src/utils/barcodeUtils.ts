import { BARCODE_TYPES_1D } from '../constants/settingTypes';
/**
 * Normalizes a string by removing non-alphanumeric characters and converting to lowercase.
 * @param str The string to normalize.
 * @returns The normalized string.
 */
export const normalize = (str: string) => str.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

/**
 * Checks if a barcode type is a 1D barcode.
 * @param type The barcode type string.
 * @returns True if the type is 1D, false otherwise.
 */
export const is1D = (type: string) => {
  const normalizedType = normalize(type);
  return BARCODE_TYPES_1D.some(t => normalize(t.label) === normalizedType || normalize(t.id) === normalizedType);
};
