import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import DeviceInfo from 'react-native-device-info';
import Chevron from '../assets/icons/chevron.svg';
import BgImage from '../assets/images/BG.svg';
import LogoBarkoder from '../assets/images/logo_barkoder.svg';

/**
 * AboutScreen Component
 * 
 * Displays information about the barKoder SDK, app version, and device details.
 * Includes a description of the SDK capabilities and a call-to-action button
 * for getting a free trial demo.
 */
const AboutScreen = () => {
  const navigation = useNavigation();
  const [deviceId, setDeviceId] = useState<string>('');

  useEffect(() => {
    // Get Device ID using react-native-device-info
    DeviceInfo.getUniqueId().then((id) => {
      setDeviceId(id);
    });
  }, []);

  const handleGetFreeTrial = () => {
    Linking.openURL('https://barkoder.com/trial');
  };

  const handleLinkPress = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      {/* Background */}
      <View style={StyleSheet.absoluteFill}>
        <BgImage width="100%" height="100%" preserveAspectRatio="xMidYMid slice" />
      </View>

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Chevron width={20} height={20} />
          </TouchableOpacity>
          <LogoBarkoder width={100} height={24} />
        </View>

        {/* Content */}
        <FlatList
          data={[{ key: 'content' }]}
          renderItem={() => (
            <>
              {/* Description Container */}
              <View style={styles.contentCard}>
                <Text style={styles.title}>Barcode Scanner SDK by barKoder</Text>
                
                <Text style={styles.description}>
                  <Text
                    style={styles.link}
                    onPress={() => handleLinkPress('https://barkoder.com/')}
                  >
                    Barcode Scanner Demo by barKoder
                  </Text>
                  {' '}showcases the enterprise-grade performance of the <Text style={styles.bold}>barKoder Barcode Scanner SDK</Text> along with most of its features in a wide variety of scanning scenarios.{'\n\n'}
                  Whether from{' '}
                  <Text
                    style={styles.link}
                    onPress={() => handleLinkPress('https://barkoder.com/barcode-types#1D-barcodes')}
                  >
                    One-Dimensional
                  </Text>
                  {' '}or{' '}
                  <Text
                    style={styles.link}
                    onPress={() => handleLinkPress('https://barkoder.com/barcode-types#2D-barcodes')}
                  >
                    Two-Dimensional
                  </Text>
                  {' '}barcodes, the barKoder API can capture the data reliably, accurately and surprisingly fast, even under very challenging conditions and environments.{'\n\n'}
                  You can test the barKoder Barcode Scanner SDK at your own convenience by signing up for a free trial:
                </Text>

                {/* CTA Button */}
                <TouchableOpacity style={styles.ctaButton} onPress={handleGetFreeTrial}>
                  <Text style={styles.ctaButtonText}>Get a free trial demo</Text>
                </TouchableOpacity>
              </View>

              {/* Info Section Container */}
              <View style={styles.infoCard}>
                <Text style={styles.infoTitle}>Info</Text>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Device ID</Text>
                  <Text style={styles.infoValue}>{deviceId}</Text>
                </View>

                <View style={styles.infoDivider} />

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>App Version</Text>
                  <Text style={[styles.infoValue, styles.versionText]}>0.0.1</Text>
                </View>

                <View style={styles.infoDivider} />

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>SDK Version</Text>
                  <Text style={styles.infoValue}>1.6.7</Text>
                </View>

                <View style={styles.infoDivider} />

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Lib Version</Text>
                  <Text style={styles.infoValue}>19.1.1</Text>
                </View>
              </View>
            </>
          )}
          contentContainerStyle={styles.listContent}
        />
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  contentCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  description: {
    fontSize: 12,
    lineHeight: 20,
    color: '#333',
    marginBottom: 20,
  },
  link: {
    color: '#E52E4c',
    fontWeight: '600',
  },
  bold: {
    fontWeight: '600',
    color: '#000',
  },
  ctaButton: {
    backgroundColor: '#E52E4c',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 25,
    alignSelf: 'center',
    marginTop: 8,
  },
  ctaButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  infoDivider: {
    height: 1,
    backgroundColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 13,
    color: '#666',
  },
  infoValue: {
    fontSize: 13,
    color: '#000',
    fontWeight: '500',
  },
  versionText: {
    color: '#E52E4c',
    fontWeight: '600',
  },
});

export default AboutScreen;
