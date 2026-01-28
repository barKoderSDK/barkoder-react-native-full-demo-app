import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, Image, BackHandler } from 'react-native';
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
import { useScannerLogic } from '../hooks/useScannerLogic';
import { BARCODE_TYPES_1D, BARCODE_TYPES_2D, MODES } from '../constants/constants';

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
    barkoderRef,
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

  useEffect(() => {
    if (activeButton !== 'settings') return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      setActiveButton(null);
      if (mode !== MODES.GALLERY) {
        startScanning();
      }
      return true;
    });
    return () => subscription.remove();
  }, [activeButton, mode, startScanning]);

  const handleMenuPress = () => {
    barkoderRef.current?.stopScanning();
    setActiveButton('settings');
  };

  const handleCopy = () => {
    if (scannedItems.length > 0) {
        const allText = scannedItems.map(item => item.text).join('\n');
        Clipboard.setString(allText);
        Alert.alert('Copied', `${scannedItems.length} barcode(s) copied to clipboard`);
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
                    <TopBar 
                        transparent={true} 
                        onMenuPress={handleMenuPress} 
                        onClose={() => navigation.goBack()} 
                    />
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
            onClose={() => {
              setActiveButton(null);
              if (mode !== MODES.GALLERY) {
                startScanning();
              }
            }}
        />
      </View>
      
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
          onCopy={handleCopy}
          onCSV={handleCSV}
          onDetails={(item) => navigation.navigate('BarcodeDetails', { item })}
          showResultSheet={settings.showResultSheet}
          onClose={() => {
            setScannedItems([]);
          }}
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
    backgroundColor: 'transparent',
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
