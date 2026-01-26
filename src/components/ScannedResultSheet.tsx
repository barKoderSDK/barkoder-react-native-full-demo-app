import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import IconCSV from '../assets/icons/icon_csv.svg';
import IconCopy from '../assets/icons/icon_copy.svg';
import IconExpandAll from '../assets/icons/expand_all.svg';

interface ScannedItem {
  text: string;
  type: string;
  image?: string;
}

interface ScannedResultSheetProps {
  scannedItems: ScannedItem[];
  onCopy: () => void;
  onCSV: () => void;
  onDetails: (item: ScannedItem) => void;
  showResultSheet?: boolean;
  onClose: () => void;
}

const ScannedResultSheet = ({
  scannedItems,
  onCopy,
  onCSV,
  onDetails,
  showResultSheet = true,
  onClose,
}: ScannedResultSheetProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (scannedItems.length === 0 || !showResultSheet) return null;

  // Get unique items and their counts
  const getUniqueItems = () => {
    const uniqueTexts = new Set<string>();
    const uniqueItems: ScannedItem[] = [];
    
    for (const item of scannedItems) {
      if (!uniqueTexts.has(item.text)) {
        uniqueTexts.add(item.text);
        uniqueItems.push(item);
      }
    }
    
    return uniqueItems;
  };

  const getItemCount = (text: string) => {
    return scannedItems.filter(item => item.text === text).length;
  };

  const uniqueItems = getUniqueItems();
  const totalCount = scannedItems.length;
  const uniqueCount = uniqueItems.length;

  const renderBarcodeItem = (item: ScannedItem, index: number) => {
    const count = getItemCount(item.text);
    
    return (
      <TouchableOpacity
        key={`${item.text}-${index}`}
        style={styles.barcodeCard}
        onPress={() => onDetails(item)}
        activeOpacity={0.7}
      >
        <View style={styles.barcodeContent}>
          <View style={styles.barcodeInfo}>
            <Text style={styles.barcodeType}>{item.type}</Text>
            <Text style={styles.barcodeText}>{item.text}</Text>
          </View>
          {count > 1 && (
            <View style={styles.countContainer}>
              <Text style={styles.countText}>({count})</Text>
              <MaterialIcons name="info-outline" size={20} color="#6C757D" />
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const sheetContent = (
    <>
      <View style={styles.headerRow}>
        <Text style={styles.headerText}>
          {uniqueCount} result{uniqueCount === 1 ? '' : 's'} found ({totalCount} total)
        </Text>
        <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <MaterialIcons name="close" size={24} color="#000" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.itemsContainer}>
        {uniqueItems.map((item, index) => renderBarcodeItem(item, index))}
      </View>

      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity style={styles.actionBtn} onPress={onCopy}>
          <IconCopy width={20} height={20} />
          <Text style={styles.actionBtnText}>Copy</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={onCSV}>
          <IconCSV width={20} height={20} />
          <Text style={styles.actionBtnText}>CSV</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => setIsExpanded(true)}>
          <IconExpandAll width={20} height={20} />
          <Text style={styles.actionBtnText}>Expand</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <>
      <View style={styles.resultSheet}>
        {sheetContent}
      </View>

      <Modal
        visible={isExpanded}
        animationType="slide"
        onRequestClose={() => setIsExpanded(false)}
      >
        <SafeAreaView style={styles.expandedContainer} edges={['top', 'bottom']}>
          <View style={styles.expandedHeader}>
            <Text style={styles.expandedHeaderText}>
              {uniqueCount} result{uniqueCount === 1 ? '' : 's'} found ({totalCount} total)
            </Text>
          </View>
          
          <ScrollView 
            style={styles.expandedScrollContainer}
            contentContainerStyle={styles.expandedScrollContent}
          >
            {uniqueItems.map((item, index) => renderBarcodeItem(item, index))}
          </ScrollView>

          <View style={styles.expandedActionButtonsContainer}>
            <TouchableOpacity style={styles.actionBtn} onPress={onCopy}>
              <IconCopy width={20} height={20} />
              <Text style={styles.actionBtnText}>Copy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={onCSV}>
              <IconCSV width={20} height={20} />
              <Text style={styles.actionBtnText}>CSV</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={() => setIsExpanded(false)}>
              <IconExpandAll width={20} height={20} />
              <Text style={styles.actionBtnText}>Expand</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  resultSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerText: {
    fontSize: 13,
    fontWeight: '400',
    color: '#00000088',
  },
  itemsContainer: {
    gap: 12,
    marginBottom: 8,
  },
  barcodeCard: {
    backgroundColor: '#D4EDDA',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  barcodeContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  barcodeInfo: {
    flex: 1,
    marginRight: 12,
  },
  barcodeType: {
    fontSize: 12,
    color: '#6C757D',
    fontWeight: '400',
    marginBottom: 4,
  },
  barcodeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000DE',
  },
  countContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  countText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6C757D',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    marginTop: 8,
  },
  actionBtn: {
    alignItems: 'center',
    gap: 8,
  },
  actionBtnText: {
    fontSize: 13,
    color: '#000',
  },
  // Expanded modal styles
  expandedContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  expandedHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    alignItems: 'center',
  },
  expandedHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000DE',
  },
  expandedScrollContainer: {
    flex: 1,
  },
  expandedScrollContent: {
    padding: 20,
    gap: 12,
  },
  expandedActionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
});

export default ScannedResultSheet;
