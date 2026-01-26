import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Linking, Alert, FlatList, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Clipboard from '@react-native-clipboard/clipboard';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import BgImage from '../assets/images/BG.svg';
import Chevreon from '../assets/icons/chevron.svg';
import IconCopy from '../assets/icons/icon_copy.svg';
import IconSearch from '../assets/icons/icon_search.svg';
import Icon1D from '../assets/icons/icon_1d.svg';
import Icon2D from '../assets/icons/icon_2d.svg';
import { BARCODE_TYPES_1D } from '../constants/constants';

type RootStackParamList = {
  BarcodeDetails: { item: { text: string, type: string, image?: string } };
};

type BarcodeDetailsScreenRouteProp = RouteProp<RootStackParamList, 'BarcodeDetails'>;

const normalize = (str: string) => str.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

const is1D = (type: string) => {
  const normalizedType = normalize(type);
  return BARCODE_TYPES_1D.some(t => normalize(t.label) === normalizedType || normalize(t.id) === normalizedType);
};

const BarcodeHeader = ({ item }: { item: { text: string, type: string, image?: string } }) => (
  <>
    <View style={styles.imageCard}>
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.barcodeImage} resizeMode="contain" />
      ) : (
        <View style={styles.placeholderImage}>
          {is1D(item.type) ? (
            <Icon1D width={64} height={64} />
          ) : (
            <Icon2D width={64} height={64} />
          )}
        </View>
      )}
    </View>

    <Text style={styles.sectionLabel}>DATA</Text>
  </>
);

const BarcodeDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<BarcodeDetailsScreenRouteProp>();
  const { item } = route.params;

  const handleCopy = () => {
    Clipboard.setString(item.text);
    Alert.alert('Copied', 'Barcode copied to clipboard');
  };

  const handleSearch = () => {
    const url = 'https://www.google.com/search?q=' + encodeURIComponent(item.text);
    Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
  };

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

  const isMRZ = item.type.toLowerCase() === 'mrz';
  const detailsData = isMRZ 
    ? [
        { id: 'type', label: 'Barcode Type', value: item.type },
        ...parseMRZData(item.text)
      ]
    : [
        { id: 'type', label: 'Barcode Type', value: item.type },
        { id: 'value', label: 'Value', value: item.text, multiline: true }
      ];

  const renderItem = ({ item: detail }: { item: { id: string, label: string, value: string, multiline?: boolean } }) => (
    <View style={styles.infoCard}>
      <Text style={styles.dataLabel}>{detail.label}</Text>
      <Text style={detail.multiline ? styles.dataValueMultiline : styles.dataValue}>{detail.value}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={StyleSheet.absoluteFill}>
        <BgImage width="100%" height="100%" preserveAspectRatio="xMidYMid slice" />
      </View>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Chevreon width={20} height={20} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Barcode Details</Text>
        </View>

        <FlatList
          data={detailsData}
          renderItem={renderItem}
          keyExtractor={detail => detail.id}
          ListHeaderComponent={<BarcodeHeader item={item} />}
          contentContainerStyle={styles.content}
        />

        <View style={styles.bottomBar}>
            <TouchableOpacity style={styles.actionButton} onPress={handleCopy}>
                <IconCopy width={24} height={24} />
                <Text style={styles.actionText}>Copy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleSearch}>
                <IconSearch width={24} height={24} />
                <Text style={styles.actionText}>Search</Text>
            </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  menuButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: '#000',
    marginLeft: 16,
    flex: 1,
  },
  content: {
    padding: 20,
  },
  imageCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 24,
  },
  barcodeImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: 120,
    height: 120,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  sectionLabel: {
    color: '#E52E4c',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 12,
    minHeight: 56,
  },
  dataLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  dataValue: {
    fontSize: 16,
    color: '#000',
    fontWeight: '400',
  },
  dataValueMultiline: {
    fontSize: 16,
    color: '#000',
    fontWeight: '400',
    flex: 1,
    textAlign: 'right',
    marginLeft: 16,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionButton: {
    alignItems: 'center',
    gap: 5,
  },
  actionText: {
    color: '#000',
    fontSize: 12,
  },
});

export default BarcodeDetailsScreen;
