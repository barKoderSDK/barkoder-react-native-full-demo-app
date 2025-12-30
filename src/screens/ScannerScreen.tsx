import React, { useState } from 'react';
import { View, StyleSheet, Linking, Alert, Image } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { BarkoderView } from 'barkoder-react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BARKODER_LICENSE_KEY } from '@env';
import TopBar from '../components/TopBar';
import UnifiedSettings from '../components/UnifiedSettings';
import PauseOverlay from '../components/PauseOverlay';
import ScannedResultSheet from '../components/ScannedResultSheet';
import BottomControls from '../components/BottomControls';
import ScannedItemsList from '../components/ScannedItemsList';
import { useScannerLogic } from '../hooks/useScannerLogic';
import { BARCODE_TYPES_1D, BARCODE_TYPES_2D } from '../constants/settingTypes';

type RootStackParamList = {
  Scanner: { mode: string };
  BarcodeDetails: { item: { text: string; type: string; image?: string } };
};

type ScannerNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Scanner'>;
type ScannerScreenRouteProp = RouteProp<RootStackParamList, 'Scanner'>;

const ALL_TYPES = [...BARCODE_TYPES_1D, ...BARCODE_TYPES_2D];

const ScannerScreen = () => {
  const navigation = useNavigation<ScannerNavigationProp>();
  const route = useRoute<ScannerScreenRouteProp>();
  const { mode } = route.params || { mode: 'v1' };
  const insets = useSafeAreaInsets();
  
  const [activeButton, setActiveButton] = useState<string | null>(null);

  const {
    scannedItems,
    setScannedItems,
    enabledTypes,
    settings,
    isFlashOn,
    zoomLevel,
    isScanningPaused,
    setIsScanningPaused,
    frozenImage,
    setFrozenImage,
    onBarkoderViewCreated,
    onUpdateSetting,
    onToggleBarcodeType,
    onEnableAllBarcodeTypes,
    resetConfig,
    toggleFlash,
    toggleZoom,
    toggleCamera,
    startScanning,
  } = useScannerLogic(mode);

  const handleMenuPress = () => {
    setActiveButton('settings');
  };

  const handleSearch = () => {
    if (scannedItems.length > 0) {
        const url = 'https://www.google.com/search?q=' + encodeURIComponent(scannedItems[0].text);
        Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
    }
  };

  const handleCopy = () => {
    if (scannedItems.length > 0) {
        Clipboard.setString(scannedItems[0].text);
        Alert.alert('Copied', 'Barcode copied to clipboard');
    }
  };

  const handleCSV = async () => {
    if (scannedItems.length === 0) return;
    
    const header = 'Barcode,Type\n';
    const rows = scannedItems.map(item => `"${item.text.replace(/"/g, '""')}","${item.type}"`).join('\n');
    const csvContent = header + rows;
    const path = RNFS.CachesDirectoryPath + '/scanned_barcodes.csv';
    
    try {
        await RNFS.writeFile(path, csvContent, 'utf8');
        await Share.open({
            url: 'file://' + path,
            type: 'text/csv',
            title: 'Share CSV',
            message: 'Here are your scanned barcodes',
            failOnCancel: false,
        });
    } catch (e) {
        console.log('Error sharing CSV:', e);
    }
  };

  const activeTypes = ALL_TYPES.filter(t => enabledTypes[t.id]);
  const activeBarcodeText = activeTypes.map(t => t.label).join(', ');

  return (
    <View style={styles.container}>
      <BarkoderView
        style={styles.scanner}
        licenseKey={BARKODER_LICENSE_KEY}
        onBarkoderViewCreated={onBarkoderViewCreated}
      />

      {isScanningPaused && frozenImage && (
        <Image 
            source={{ uri: frozenImage }} 
            style={StyleSheet.absoluteFill} 
            resizeMode="cover" 
        />
      )}

      {isScanningPaused && (
        <PauseOverlay onResume={() => {
            setIsScanningPaused(false);
            setFrozenImage(null);
            startScanning();
        }} />
      )}

      {/* Top Bar Overlay */}
      <View style={styles.topBarOverlay} pointerEvents="box-none">
         {activeButton !== 'settings' && (
            <View style={styles.topBarBackground}>
                <SafeAreaView edges={['top']}>
                    <TopBar onMenuPress={handleMenuPress} onClose={() => navigation.goBack()} />
                </SafeAreaView>
            </View>
         )}

        <UnifiedSettings
            visible={activeButton === 'settings'}
            settings={settings}
            enabledTypes={enabledTypes}
            onUpdateSetting={onUpdateSetting}
            onToggleType={onToggleBarcodeType}
            onEnableAll={onEnableAllBarcodeTypes}
            onResetConfig={resetConfig}
            mode={mode}
            onClose={() => setActiveButton(null)}
        />
      </View>
      
      <ScannedItemsList scannedItems={scannedItems} />
      
      <BottomControls
        activeBarcodeText={activeBarcodeText}
        zoomLevel={zoomLevel}
        isFlashOn={isFlashOn}
        onToggleZoom={toggleZoom}
        onToggleFlash={toggleFlash}
        onToggleCamera={toggleCamera}
      />
      
      <View style={styles.bottomContainer}>
        <ScannedResultSheet
          scannedItems={scannedItems}
          onClose={() => {
            setScannedItems([]);
            setIsScanningPaused(false);
            setFrozenImage(null);
            startScanning();
          }}
          onCopy={handleCopy}
          onCSV={handleCSV}
          onSearch={handleSearch}
          onDetails={(item) => navigation.navigate('BarcodeDetails', { item })}
        />
        
        <View style={[styles.bottomInset, { height: insets.bottom }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scanner: {
    flex: 1,
  },
  topBarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    zIndex: 30,
  },
  topBarBackground: {
    backgroundColor: '#fff',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    zIndex: 20,
  },
  bottomInset: {
    backgroundColor: '#fff',
  },
});

export default ScannerScreen;
