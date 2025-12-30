import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

interface ScannedItem {
  text: string;
  type: string;
  image?: string;
}

interface ScannedItemsListProps {
  scannedItems: ScannedItem[];
}

const ScannedItemsList = ({ scannedItems }: ScannedItemsListProps) => {
  return (
    <View style={styles.scannedListOverlay}>
      <FlatList
        data={scannedItems}
        inverted
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={[styles.scannedItemBadge]}>
            <Text style={styles.scannedItemText}>{item.text} {item.type}</Text>
          </View>
        )}
        contentContainerStyle={styles.scannedListContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  scannedListOverlay: {
    position: 'absolute',
    top: 100,
    left: 10,
    bottom: 300,
    width: 200,
  },
  scannedListContent: {
    paddingBottom: 20,
    gap: 8,
  },
  scannedItemBadge: {
    width: 160,
    height: 24,
    backgroundColor: '#111111',
    borderRadius: 24,
    paddingVertical: 4,
    paddingHorizontal: 8,
    justifyContent: 'flex-end',
    alignSelf: 'flex-start',
  },
  scannedItemText: {
    color: '#fff',
    fontSize: 10,
    textAlign: 'left',
  },
});

export default ScannedItemsList;
