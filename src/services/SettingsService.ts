import RNFS from 'react-native-fs';
import { ScannerSettings } from '../types/types';

const SETTINGS_FILE_PATH = RNFS.DocumentDirectoryPath + '/scanner_settings.json';

export interface SavedSettings {
  enabledTypes: {[key: string]: boolean};
  scannerSettings: ScannerSettings;
}

export const SettingsService = {
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
  },
};
