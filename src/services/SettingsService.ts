import RNFS from 'react-native-fs';
import { ScannerSettings } from '../types/ScannerSettings';

/**
 * File path for persistent storage of scanner settings.
 * Settings are stored in the app's document directory as JSON.
 */
const SETTINGS_FILE_PATH = RNFS.DocumentDirectoryPath + '/scanner_settings.json';

/**
 * Interface for saved settings data structure.
 * Settings are stored per mode to allow different configurations
 * for each scanning mode (Anyscan, 1D, 2D, MRZ, etc.).
 */
export interface SavedSettings {
  enabledTypes: {[key: string]: boolean};
  scannerSettings: ScannerSettings;
}

/**
 * SettingsService handles persistence of scanner configuration across app sessions.
 * 
 * Features:
 * - Mode-specific settings storage (each mode has independent settings)
 * - Automatic file creation and error handling
 * - JSON-based storage for easy debugging and migration
 * 
 * Storage structure:
 * {
 *   "v1": { enabledTypes: {...}, scannerSettings: {...} },
 *   "1D": { enabledTypes: {...}, scannerSettings: {...} },
 *   "MRZ": { enabledTypes: {...}, scannerSettings: {...} },
 *   ...
 * }
 */
export const SettingsService = {
  /**
   * Retrieves saved settings for a specific scanning mode.
   * 
   * @param mode - The scanning mode identifier (e.g., 'v1', '1D', 'MRZ')
   * @returns Saved settings object or null if no settings exist
   */
  async getSettings(mode: string): Promise<SavedSettings | null> {
    try {
      const exists = await RNFS.exists(SETTINGS_FILE_PATH);
      if (!exists) return null;
      const content = await RNFS.readFile(SETTINGS_FILE_PATH, 'utf8');
      const allSettings = JSON.parse(content);
      return allSettings[mode] || null;
    } catch (e) {
      console.error('Error reading settings:', e);
      return null;
    }
  },

  /**
   * Saves settings for a specific scanning mode.
   * Merges with existing settings to preserve other modes' configurations.
   * 
   * Process:
   * 1. Read existing settings file (if it exists)
   * 2. Parse JSON (or reset to empty object if corrupted)
   * 3. Update settings for the specified mode
   * 4. Write complete settings object back to file
   * 
   * @param mode - The scanning mode identifier
   * @param settings - The settings object to save
   */
  async saveSettings(mode: string, settings: SavedSettings) {
    try {
      let allSettings: any = {};
      const exists = await RNFS.exists(SETTINGS_FILE_PATH);
      if (exists) {
        const content = await RNFS.readFile(SETTINGS_FILE_PATH, 'utf8');
        try {
            allSettings = JSON.parse(content);
        } catch (parseError) {
            console.error('Error parsing settings file, resetting:', parseError);
            allSettings = {};
        }
      }
      
      allSettings[mode] = settings;
      
      await RNFS.writeFile(SETTINGS_FILE_PATH, JSON.stringify(allSettings), 'utf8');
    } catch (e) {
      console.error('Error saving settings:', e);
    }
  }
};
