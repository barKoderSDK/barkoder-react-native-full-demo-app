import * as React from 'react';
import {
  View,
  StyleSheet,
  Linking,
  Alert,
  ActivityIndicator,
  Modal,
  Text,
} from 'react-native';
import { BARKODER_LICENSE_KEY } from '@env';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { launchImageLibrary } from 'react-native-image-picker';
import { BarkoderView, Barkoder } from 'barkoder-react-native';
import { HistoryService } from '../services/HistoryService';
import { RootStackParamList } from '../types/navigation';
import { SECTIONS } from '../constants/homeSections';
import TopBar from '../components/TopBar';
import BottomBar from '../components/BottomBar';
import HomeGrid from '../components/HomeGrid';
import { BARCODE_TYPES_1D, BARCODE_TYPES_2D } from '../constants/settingTypes';
import BgImage from '../assets/images/BG.svg';

/**
 * HomeScreen Component
 * 
 * This is the main entry point of the application. It displays a grid of available
 * scanner modes and allows the user to navigate to the scanner or perform a gallery scan.
 * 
 * Features:
 * - Displays scanner modes categorized by type (General, Showcase).
 * - Handles navigation to ScannerScreen with specific modes.
 * - Handles Gallery Scan functionality.
 * - Initializes a hidden BarkoderView to pre-load the engine (optional optimization).
 */
const HomeScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const barkoderRef = React.useRef<Barkoder | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  /**
   * Callback when the hidden BarkoderView is created.
   * Configures the Barkoder engine with all supported barcode types.
   */
  const onBarkoderViewCreated = (barkoder: Barkoder) => {
    barkoderRef.current = barkoder;
    
    const decoderConfig: any = {};
    const allTypes = [...BARCODE_TYPES_1D, ...BARCODE_TYPES_2D];
    
    // Configure each barcode type with appropriate settings
    allTypes.forEach(type => {
        let config;
        if (['code128', 'code93', 'codabar', 'code11', 'msi'].includes(type.id)) {
             config = new Barkoder.BarcodeConfigWithLength({ enabled: true });
        } else if (['qr', 'qrMicro', 'datamatrix'].includes(type.id)) {
             config = new Barkoder.BarcodeConfigWithDpmMode({ enabled: true });
        } else if (type.id === 'code39') {
             config = new Barkoder.Code39BarcodeConfig({ enabled: true });
        } else if (type.id === 'idDocument') {
             config = new Barkoder.IdDocumentBarcodeConfig({ 
               enabled: true,
               masterChecksum: Barkoder.IdDocumentMasterChecksumType.disabled
             });
        } else {
             config = new Barkoder.BarcodeConfig({ enabled: true });
        }
        decoderConfig[type.id] = config;
    });

    barkoder.configureBarkoder(
      new Barkoder.BarkoderConfig({
        decoder: new Barkoder.DekoderConfig(decoderConfig),
        imageResultEnabled: true,
      })
    );
  };

  /**
   * Handles the press event on a grid item.
   * - 'gallery': Opens the image picker.
   * - 'url': Opens a URL in the browser.
   * - 'mode': Navigates to the ScannerScreen with the selected mode.
   */
  const handlePress = (item: any) => {
    if (item.id === 'gallery') {
      handleGalleryScan();
    } else if (item.action === 'url' && item.url) {
      Linking.openURL(item.url);
    } else if (item.mode) {
      navigation.navigate('Scanner', { mode: item.mode });
    }
  };

  /**
   * Logic for scanning an image from the gallery.
   */
  const handleGalleryScan = () => {
      setIsLoading(true);
      launchImageLibrary({ mediaType: 'photo', selectionLimit: 1, includeBase64: true }, (response) => {
        if (response.didCancel) {
            console.log('User cancelled image picker');
            setIsLoading(false);
        } else if (response.errorCode) {
            Alert.alert('Error', response.errorMessage);
            setIsLoading(false);
        } else if (response.assets?.[0]?.base64) {
            const base64Image = response.assets[0].base64;
            const displayImage = `data:${response.assets[0].type};base64,${base64Image}`;
            
            barkoderRef.current?.scanImage(base64Image, (result) => {
                setIsLoading(false);
                if (result.decoderResults && result.decoderResults.length > 0) {
                    const newResult = result.decoderResults[0];
                    
                    const scannedItem = {
                        text: newResult.textualData,
                        type: newResult.barcodeTypeName,
                        image: displayImage,
                    };

                    HistoryService.addScan(scannedItem);
                    navigation.navigate('BarcodeDetails', { item: scannedItem });
                } else {
                    Alert.alert('No barcode found', 'Could not detect any barcode in the selected image.');
                }
            });
        } else {
            setIsLoading(false);
        }
      });
  }

  return (
    <View style={styles.container}>
      <View style={StyleSheet.absoluteFill}>
        <BgImage width="100%" height="100%" preserveAspectRatio="xMidYMid slice" />
      </View>
      <SafeAreaView style={styles.safeArea}>
        <TopBar logoPosition="left" />

        <HomeGrid sections={SECTIONS} onItemPress={handlePress} />

        <BottomBar />
        
        {/* Hidden BarkoderView for background initialization and gallery scanning */}
        <View style={styles.hiddenBarkoderContainer}>
          <BarkoderView
              style={styles.hiddenBarkoder}
              licenseKey={BARKODER_LICENSE_KEY}
              onBarkoderViewCreated={onBarkoderViewCreated}
          />
        </View>

        <Modal transparent={true} visible={isLoading} animationType="fade">
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#E52E4c" />
              <Text style={styles.loadingText}>Processing image...</Text>
            </View>
          </View>
        </Modal>
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
  loadingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 5,
  },
  loadingText: {
    marginTop: 10,
    color: '#333',
    fontSize: 16,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  hiddenBarkoderContainer: {
    width: 0,
    height: 0,
    overflow: 'hidden',
  },
  hiddenBarkoder: {
    width: 1,
    height: 1,
  },
});

export default HomeScreen;
