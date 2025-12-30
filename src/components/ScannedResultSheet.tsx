import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import IconCSV from '../assets/icons/icon_csv.svg';
import IconCopy from '../assets/icons/icon_copy.svg';
import IconSearch from '../assets/icons/icon_search.svg';
import IconWebhook from '../assets/icons/icon_webhook.svg';

interface ScannedItem {
  text: string;
  type: string;
  image?: string;
}

interface ScannedResultSheetProps {
  scannedItems: ScannedItem[];
  onClose: () => void;
  onCopy: () => void;
  onCSV: () => void;
  onSearch: () => void;
  onDetails: (item: ScannedItem) => void;
}

const ScannedResultSheet = ({
  scannedItems,
  onClose,
  onCopy,
  onCSV,
  onSearch,
  onDetails,
}: ScannedResultSheetProps) => {
  if (scannedItems.length === 0) return null;

  const currentItem = scannedItems[0];

  return (
    <View style={styles.resultSheet}>
      <View style={styles.resultHeader}>
        <Text style={styles.itemsCount}>{scannedItems.length} items scanned</Text>
        <TouchableOpacity onPress={onClose}>
          <MaterialIcons name="close" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={styles.resultCard}>
        <View style={styles.cardHeaderRow}>
          <View>
            <Text style={styles.cardBarcodeText}>{currentItem.text}</Text>
            <Text style={styles.cardBarcodeType}>{currentItem.type}</Text>
          </View>
        </View>

        <View style={styles.actionButtonsRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={onCopy}>
            <IconCopy width={20} height={20} />
            <Text style={styles.actionBtnText}>Copy</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={onCSV}>
            <IconCSV width={20} height={20} />
            <Text style={styles.actionBtnText}>CSV</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={onSearch}>
            <IconSearch width={20} height={20} />
            <Text style={styles.actionBtnText}>Search</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => onDetails(currentItem)}>
            <IconWebhook width={20} height={20} />
            <Text style={styles.actionBtnText}>Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  resultSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 16,
    paddingBottom: 16,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemsCount: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#000',
  },
  resultCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  cardBarcodeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  cardBarcodeType: {
    fontSize: 12,
    color: '#666',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  actionBtn: {
    alignItems: 'center',
    gap: 8,
  },
  actionBtnText: {
    fontSize: 12,
    color: '#000',
  },
});

export default ScannedResultSheet;
