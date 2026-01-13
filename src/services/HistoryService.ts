import RNFS from 'react-native-fs';

export interface HistoryItem {
  text: string;
  type: string;
  image?: string;
  timestamp: number;
  count: number;
}

const FILE_PATH = RNFS.DocumentDirectoryPath + '/scan_history.json';

export const HistoryService = {
  async getHistory(): Promise<HistoryItem[]> {
    try {
      const exists = await RNFS.exists(FILE_PATH);
      if (!exists) return [];
      const content = await RNFS.readFile(FILE_PATH, 'utf8');
      return JSON.parse(content);
    } catch (e) {
      console.error('Error reading history:', e);
      return [];
    }
  },

  async addScan(item: Omit<HistoryItem, 'timestamp' | 'count'>) {
    try {
      let imagePath = item.image;

      if (item.image && item.image.startsWith('data:image')) {
        const timestamp = Date.now();
        const fileName = `scan_${timestamp}.jpg`;
        const destPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
        const base64Data = item.image.split(';base64,').pop();
        
        if (base64Data) {
            await RNFS.writeFile(destPath, base64Data, 'base64');
            imagePath = 'file://' + destPath;
        }
      }

      const history = await this.getHistory();
      const existingIndex = history.findIndex(
        h => h.text === item.text && h.type === item.type
      );

      if (existingIndex >= 0) {
        history[existingIndex].count += 1;
        history[existingIndex].timestamp = Date.now();
        if (imagePath) {
            history[existingIndex].image = imagePath;
        }
        const updatedItem = history.splice(existingIndex, 1)[0];
        history.unshift(updatedItem);
      } else {
        history.unshift({
          ...item,
          image: imagePath,
          timestamp: Date.now(),
          count: 1,
        });
      }

      await RNFS.writeFile(FILE_PATH, JSON.stringify(history), 'utf8');
    } catch (e) {
      console.error('Error saving history:', e);
    }
  },

  async clearHistory() {
    try {
      const files = await RNFS.readDir(RNFS.DocumentDirectoryPath);
      for (const file of files) {
        if (file.name.startsWith('scan_') && file.name.endsWith('.jpg')) {
          await RNFS.unlink(file.path);
        }
      }
      
      if (await RNFS.exists(FILE_PATH)) {
        await RNFS.unlink(FILE_PATH);
      }
    } catch (e) {
      console.error('Error clearing history:', e);
    }
  }
};
