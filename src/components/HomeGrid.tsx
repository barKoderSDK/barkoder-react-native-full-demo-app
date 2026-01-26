import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { SvgProps } from 'react-native-svg';
import { HomeSection } from '../types/types';

interface HomeGridProps {
  sections: HomeSection[];
  onItemPress: (item: any) => void;
}

const HomeGrid: React.FC<HomeGridProps> = ({ sections, onItemPress }) => {
  const renderIcon = (Icon: React.FC<SvgProps>) => {
    return <Icon width={50} height={50} />;
  };

  return (
    <FlatList
      data={sections}
      keyExtractor={(item, index) => index.toString()}
      contentContainerStyle={styles.content}
      style={styles.container}
      renderItem={({ item: section }) => (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <View style={styles.grid}>
            {section.data.map((item, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.gridItem}
                onPress={() => onItemPress(item)}
              >
                {renderIcon(item.Icon)}
                <Text style={styles.itemLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -10,
  },
  gridItem: {
    width: '33.33%',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  itemLabel: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
    marginTop: 8,
  },
});

export default HomeGrid;
