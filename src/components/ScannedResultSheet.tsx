import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal, LayoutAnimation, Platform, UIManager } from 'react-native';
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
  lastScanCount?: number;
  onCopy: () => void;
  onCSV: () => void;
  onDetails: (item: ScannedItem) => void;
  showResultSheet?: boolean;
  onClose: () => void;
  onExpandedChange?: (expanded: boolean) => void;
}

const ScannedResultSheet = ({
  scannedItems,
  lastScanCount,
  onCopy,
  onCSV,
  onDetails,
  showResultSheet = true,
  onClose,
  onExpandedChange,
}: ScannedResultSheetProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  const setExpanded = (next: boolean) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(next);
    onExpandedChange?.(next);
  };

  if (scannedItems.length === 0 || !showResultSheet) return null;

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
  const scanCount = lastScanCount && lastScanCount > 0 ? lastScanCount : uniqueCount;

  const parseMRZData = (text: string) => {
    const fields: { id: string, label: string, value: string }[] = [];
    const lines = text.split('\n');
    
    lines.forEach(line => {
      const match = line.match(/^([^:]+):\s*(.+)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim();
        const label = key.split('_').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
        fields.push({ id: key, label, value });
      }
    });
    
    return fields;
  };

  const findMrzField = (fields: Array<{ id: string, label: string, value: string }>, keys: string[]) => {
    const loweredKeys = keys.map(key => key.toLowerCase());
    return fields.find(field => {
      const haystack = `${field.id} ${field.label}`.toLowerCase();
      return loweredKeys.some(key => haystack.includes(key));
    });
  };

  const getDisplayText = (item: ScannedItem) => {
    if (item.type.toLowerCase() !== 'mrz') return item.text;

    const mrzFields = parseMRZData(item.text);
    const mrzName = findMrzField(mrzFields, ['name', 'given name', 'given names', 'first name', 'forename']);
    const mrzSurname = findMrzField(mrzFields, ['surname', 'last name', 'family name']);
    const nameParts = [mrzName?.value, mrzSurname?.value].filter(Boolean);

    return nameParts.length > 0 ? nameParts.join(' ') : 'Name/Surname not found';
  };

  const renderBarcodeItem = (item: ScannedItem, index: number) => {
    const count = getItemCount(item.text);
    
    return (
      <TouchableOpacity
        key={`${item.text}-${index}`}
        style={[
          styles.barcodeCard,
          index === 0 ? styles.barcodeCardPrimary : styles.barcodeCardSecondary,
        ]}
        onPress={() => onDetails(item)}
        activeOpacity={0.7}
      >
        <View style={styles.barcodeContent}>
          <View style={styles.barcodeInfo}>
            <Text style={styles.barcodeType}>{item.type}</Text>
            <Text style={styles.barcodeText}>{getDisplayText(item)}</Text>
          </View>
          <View style={styles.countContainer}>
            {count > 1 && <Text style={styles.countText}>({count})</Text>}
            <MaterialIcons name="info-outline" size={20} color="#6C757D" />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const sheetContent = (
    <>
      <View style={styles.headerRow}>
        <Text style={styles.headerText}>
          {scanCount} result{scanCount === 1 ? '' : 's'} found ({totalCount} total)
        </Text>
        <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <MaterialIcons name="close" size={20} color="#6C757D" />
        </TouchableOpacity>
      </View>
      
      <ScrollView
        style={isExpanded ? styles.itemsScrollExpanded : styles.itemsScroll}
        contentContainerStyle={styles.itemsContainer}
        showsVerticalScrollIndicator={false}
      >
        {uniqueItems.map((item, index) => renderBarcodeItem(item, index))}
      </ScrollView>

      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity style={styles.actionBtn} onPress={onCopy}>
          <IconCopy width={20} height={20} />
          <Text style={styles.actionBtnText}>Copy</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={onCSV}>
          <IconCSV width={20} height={20} />
          <Text style={styles.actionBtnText}>CSV</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => setExpanded(!isExpanded)}>
          <IconExpandAll width={20} height={20} />
          <Text style={styles.actionBtnText}>{isExpanded ? 'Collapse' : 'Expand'}</Text>
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
        transparent
        animationType="fade"
        presentationStyle="overFullScreen"
        statusBarTranslucent
        onRequestClose={() => setExpanded(false)}
      >
        <View style={styles.expandedOverlay} pointerEvents="box-none">
          <SafeAreaView style={styles.expandedSheet} edges={['bottom']}>
            {sheetContent}
          </SafeAreaView>
        </View>
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
    zIndex: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#00000088',
  },
  itemsScroll: {
    maxHeight: 180,
  },
  itemsScrollExpanded: {
    flex: 1,
  },
  itemsContainer: {
    gap: 8,
    marginBottom: 4,
  },
  barcodeCard: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  barcodeCardPrimary: {
    backgroundColor: '#DFF4D7',
  },
  barcodeCardSecondary: {
    backgroundColor: '#F3F3F3',
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
    fontSize: 11,
    color: '#6C757D',
    fontWeight: '400',
    marginBottom: 4,
  },
  barcodeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000DE',
  },
  countContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  countText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6C757D',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    marginTop: 8,
  },
  actionBtn: {
    alignItems: 'center',
    gap: 8,
  },
  actionBtnText: {
    fontSize: 12,
    color: '#000',
  },
  expandedOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingTop: 72,
    backgroundColor: 'transparent',
  },
  expandedSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 14,
    paddingHorizontal: 20,
    paddingBottom: 24,
    height: '82%',
    minHeight: '82%',
  },
});

export default ScannedResultSheet;
