import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SectionList,
  Image,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import BgImage from '../assets/images/BG.svg';
import { HistoryService, HistoryItem } from '../services/HistoryService';
import { BARCODE_TYPES_1D } from '../constants/settingTypes';
import IconInfo from '../assets/icons/info.svg';
import Icon1D from '../assets/icons/icon_1d.svg';
import Icon2D from '../assets/icons/icon_2d.svg';
import Chevreon from '../assets/icons/chevron.svg';

const normalize = (str: string) => str.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

const is1D = (type: string) => {
  const normalizedType = normalize(type);
  return BARCODE_TYPES_1D.some(t => normalize(t.label) === normalizedType || normalize(t.id) === normalizedType);
};

const HistoryScreen = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const [sections, setSections] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadHistory();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const loadHistory = async () => {
    try {
      const history = await HistoryService.getHistory();
      const grouped = history.reduce((acc: any, item) => {
        const date = new Date(item.timestamp).toLocaleDateString('en-GB');
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(item);
        return acc;
      }, {});

      const sectionsData = Object.keys(grouped).map(date => ({
        title: date,
        data: grouped[date],
      }));

      setSections(sectionsData);
    } finally {
      setIsLoading(false);
    }
  };

  const renderItem = ({ item }: { item: HistoryItem }) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemLeft}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.itemImage} />
        ) : (
          <View style={[styles.itemImage, styles.placeholderImage]}>
            {is1D(item.type) ? (
              <Icon1D width={24} height={24} />
            ) : (
              <Icon2D width={24} height={24} />
            )}
          </View>
        )}
        <View style={styles.itemTextContainer}>
          <Text style={styles.itemText} numberOfLines={1}>{item.text}</Text>
          <Text style={styles.itemType}>{item.type}</Text>
        </View>
      </View>
      <View style={styles.itemRight}>
        {item.count > 1 && (
          <Text style={styles.itemCount}>({item.count})</Text>
        )}
        
        <TouchableOpacity 
          onPress={() => navigation.navigate('BarcodeDetails', { item })}
          style={styles.infoButton}
        >
          <IconInfo width={20} height={20} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSectionHeader = ({ section: { title } }: any) => (
    <View style={styles.sectionHeaderContainer}>
      <Text style={styles.sectionHeader}>{title}</Text>
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
          <Text style={styles.headerTitle}>Recent Scans</Text>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#E52E4c" />
          </View>
        ) : (
          <SectionList
            sections={sections}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderItem}
            renderSectionHeader={renderSectionHeader}
            contentContainerStyle={styles.listContent}
            stickySectionHeadersEnabled={false}
          />
        )}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  listContent: {
    paddingBottom: 20,
  },
  sectionHeaderContainer: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    alignSelf: 'flex-start',
    marginTop: 20,
    marginBottom: 10,
    minWidth: 120,
  },
  sectionHeader: {
    fontSize: 12,
    color: '#E52E4c',
    fontWeight: '600',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 16,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemTextContainer: {
    flex: 1,
  },
  itemText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
    marginBottom: 2,
  },
  itemType: {
    fontSize: 12,
    color: '#666',
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemCount: {
    fontSize: 14,
    color: '#666',
    marginRight: 12,
  },
  infoButton: {
    padding: 4,
  },
});

export default HistoryScreen;
