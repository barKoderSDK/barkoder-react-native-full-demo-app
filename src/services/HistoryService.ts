import RNFS from 'react-native-fs';

/**
 * Interface for scan history items.
 * Each scanned barcode is stored with metadata for tracking and deduplication.
 */
export interface HistoryItem {
  text: string;          // Barcode data/text
  type: string;          // Barcode type (e.g., 'QR', 'EAN13')
  image?: string;        // File path to saved barcode image
  timestamp: number;     // Unix timestamp of last scan
  count: number;         // Number of times this barcode has been scanned
}

/**
 * File path for persistent storage of scan history.
 */
const FILE_PATH = RNFS.DocumentDirectoryPath + '/scan_history.json';

/**
 * HistoryService manages the persistent storage of scanned barcodes.
 * 
 * Features:
 * - Automatic deduplication (increments count for repeat scans)
 * - Image optimization (saves images as separate files instead of base64 in JSON)
 * - Most recent scans appear first
 * - Automatic file cleanup when clearing history
 * 
 * Storage strategy:
 * - JSON file: scan_history.json (barcode data, timestamps, counts)
 * - Image files: scan_<timestamp>.jpg (saved separately for performance)
 */
export const HistoryService = {
  /**
   * Retrieves all scan history items.
   * 
   * @returns Array of HistoryItem objects, sorted by most recent first
   */
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

  /**
   * Adds a new scan to history or updates an existing entry.
   * 
   * Behavior:
   * - If barcode already exists: Increments count, updates timestamp, moves to top
   * - If barcode is new: Creates new entry with count=1
   * 
   * Image handling:
   * - Base64 images are converted to file references to reduce JSON size
   * - Images are saved as scan_<timestamp>.jpg in DocumentDirectory
   * - File paths are stored in history instead of full base64 strings
   * 
   * This approach significantly improves:
   * - JSON parsing performance (smaller file size)
   * - Memory usage (images loaded on-demand)
   * - Storage efficiency
   * 
   * @param item - Scan data (text, type, optional image)
   */
  async addScan(item: Omit<HistoryItem, 'timestamp' | 'count'>) {
    try {
      let imagePath = item.image;

      // If image is base64, save to file to reduce JSON size and improve performance
      if (item.image && item.image.startsWith('data:image')) {
        const timestamp = Date.now();
        const fileName = `scan_${timestamp}.jpg`;
        const destPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
        
        // Strip header
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
        // Update existing item
        history[existingIndex].count += 1;
        history[existingIndex].timestamp = Date.now();
        // If we have a new image, update it (optional, but good if the old one was deleted or we want the latest capture)
        if (imagePath) {
            history[existingIndex].image = imagePath;
        }
        
        // Move to top
        const updatedItem = history.splice(existingIndex, 1)[0];
        history.unshift(updatedItem);
      } else {
        // Add new item
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

  /**
   * Clears all scan history and deletes associated image files.
   * 
   * Process:
   * 1. Scans DocumentDirectory for image files (scan_*.jpg pattern)
   * 2. Deletes all matching image files
   * 3. Deletes the history JSON file
   * 
   * This ensures no orphaned files are left in storage.
   */
  async clearHistory() {
    try {
      // Delete all image files
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
