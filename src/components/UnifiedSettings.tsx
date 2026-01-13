import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Barkoder } from 'barkoder-react-native';
import { MODES } from '../constants/constants';
import { BARCODE_TYPES_1D, BARCODE_TYPES_2D } from '../constants/constants';
import { ScannerSettings } from '../types/types';
import BgImage from '../assets/images/BG.svg';
import SettingSwitch from './SettingSwitch';
import SettingDropdown from './SettingDropdown';
import Chevreon from '../assets/icons/chevron.svg';

// --- Main Component ---
interface UnifiedSettingsProps {
  visible: boolean;
  settings: ScannerSettings;
  enabledTypes: { [key: string]: boolean };
  onUpdateSetting: (key: keyof ScannerSettings, value: any) => void;
  onToggleType: (typeId: string, enabled: boolean) => void;
  onEnableAll: (enabled: boolean, category: '1D' | '2D') => void;
  onResetConfig: () => void;
  onClose: () => void;
  mode?: string;
}

/**
 * UnifiedSettings Component
 * 
 * Combines general settings, decoding settings, and barcode type selection into a single screen.
 */
const UnifiedSettings = ({
  visible,
  settings,
  enabledTypes,
  onUpdateSetting,
  onToggleType,
  onEnableAll,
  onResetConfig,
  onClose,
  mode,
}: UnifiedSettingsProps) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  if (!visible) return null;

  const isDpmMode = mode === MODES.DPM;
  const isARMode = mode === MODES.AR_MODE;
  const isMultiScanMode = mode === MODES.MULTISCAN;
  const isVinMode = mode === MODES.VIN;
  const isMrsMode = mode === MODES.MRZ;
  const isDotCodeMode = mode === MODES.DOTCODE;
  const isMode1D = mode === MODES.MODE_1D;
  const isMode2D = mode === MODES.MODE_2D;

  const getGeneralSettings = () => {
    const items: any[] = [];

    if (
      !isDpmMode &&
      !isARMode &&
      !isMultiScanMode &&
      !isVinMode &&
      !isMrsMode &&
      !isDotCodeMode
    ) {
      items.push({
        type: 'switch',
        label: 'Composite Mode',
        key: 'compositeMode',
      });
    }
    items.push({
      type: 'switch',
      label: 'Allow Pinch to Zoom',
      key: 'pinchToZoom',
    });
    if (!isDpmMode && !isARMode && !isVinMode && !isMrsMode) {
      items.push({
        type: 'switch',
        label: 'Location in Preview',
        key: 'locationInPreview',
      });
    }
    if (!isDpmMode && !isARMode && !isMrsMode) {
      items.push({
        type: 'switch',
        label: isVinMode ? 'Narrow Viewfinder' : 'Region of Interest',
        key: 'regionOfInterest',
      });
    }
    items.push({
      type: 'switch',
      label: 'Beep on Success',
      key: 'beepOnSuccess',
    });
    items.push({
      type: 'switch',
      label: 'Vibrate on Success',
      key: 'vibrateOnSuccess',
    });
    if (!isDpmMode && !isARMode && !isVinMode && !isMrsMode && !isDotCodeMode) {
      items.push({
        type: 'switch',
        label: 'Scan Blurred UPC/EAN',
        key: 'scanBlurred',
      });
    }
    if (!isDpmMode && !isARMode && !isMrsMode && !isDotCodeMode) {
      items.push({
        type: 'switch',
        label: 'Scan Deformed Codes',
        key: 'scanDeformed',
      });
    }
    if (!isARMode) {
      items.push({
        type: 'switch',
        label: 'Continuous Scanning',
        key: 'continuousScanning',
      });

      if (settings.continuousScanning) {
        const thresholdOptions = [
            ...Array.from({ length: 11 }, (_, i) => ({
                label: `${i}s`,
                value: i
            }))
        ];

        items.push({
            type: 'dropdown',
            label: 'Duplicate Threshold',
            key: 'continuousThreshold',
            options: thresholdOptions
        });
      }
    }
    
    if (isARMode) {
        items.push({
            type: 'switch',
            label: 'Double Tap to Freeze',
            key: 'arDoubleTapToFreeze',
        });
        
        items.push({
            type: 'dropdown',
            label: 'AR Mode',
            key: 'arMode',
            options: [
              { label: 'Disabled', value: Barkoder.BarkoderARMode.interactiveDisabled },
              { label: 'Enabled', value: Barkoder.BarkoderARMode.interactiveEnabled },
              { label: 'Always', value: Barkoder.BarkoderARMode.nonInteractive },
            ],
        });
        items.push({
            type: 'dropdown',
            label: 'Location Type',
            key: 'arLocationType',
            options: [
              { label: 'None', value: Barkoder.BarkoderARLocationType.none },
              { label: 'Tight', value: Barkoder.BarkoderARLocationType.tight },
              { label: 'Box', value: Barkoder.BarkoderARLocationType.boundingBox },
            ],
        });
        items.push({
            type: 'dropdown',
            label: 'Header Show Mode',
            key: 'arHeaderShowMode',
            options: [
              { label: 'Never', value: Barkoder.BarkoderARHeaderShowMode.never },
              { label: 'Always', value: Barkoder.BarkoderARHeaderShowMode.always },
              { label: 'Selected', value: Barkoder.BarkoderARHeaderShowMode.onSelected },
            ],
        });
        items.push({
            type: 'dropdown',
            label: 'Overlay Refresh',
            key: 'arOverlayRefresh',
            options: [
              { label: 'Smooth', value: Barkoder.BarkoderAROverlayRefresh.smooth },
              { label: 'Normal', value: Barkoder.BarkoderAROverlayRefresh.normal },
            ],
        });
    }

    return items;
  };

  const getDecodingSettings = () => {
      const items: any[] = [];
      if (!isDpmMode && !isARMode && !isVinMode && !isMrsMode && !isDotCodeMode) {
        items.push({
            type: 'dropdown',
            label: 'Decoding Speed',
            key: 'decodingSpeed',
            options: [
                { label: 'Fast', value: Barkoder.DecodingSpeed.fast },
                { label: 'Normal', value: Barkoder.DecodingSpeed.normal },
                { label: 'Slow', value: Barkoder.DecodingSpeed.slow },
            ]
        });
      }
      
      if (!isDpmMode && !isARMode && !isVinMode && !isMrsMode && !isDotCodeMode) {
          items.push({
            type: 'dropdown',
            label: 'Resolution',
            key: 'resolution',
            options: [
                { label: 'HD', value: Barkoder.BarkoderResolution.HD },
                { label: 'FHD', value: Barkoder.BarkoderResolution.FHD },
            ]
          });
      }
      return items;
  };

  const getFilteredBarcodeTypes = (category: '1D' | '2D') => {
    let currentTypes = category === '1D' ? BARCODE_TYPES_1D : BARCODE_TYPES_2D;

    if (isDpmMode) {
        currentTypes = currentTypes.filter(t => ['datamatrix', 'qr', 'qrMicro'].includes(t.id));
    } else if (isDotCodeMode) {
        currentTypes = currentTypes.filter(t => t.id === 'dotcode');
    } else if (isVinMode) {
        currentTypes = currentTypes.filter(t => ['code39', 'code128', 'datamatrix', 'qr'].includes(t.id));
    } else if (isMrsMode) {
        return [];
    } else if (isMode1D && category === '2D') {
        return [];
    } else if (isMode2D && category === '1D') {
        return [];
    }

    return currentTypes;
  };

  const renderSectionHeader = (title: string) => (
    <View style={styles.sectionHeaderContainer}>
        <Text style={styles.sectionHeaderText}>{title}</Text>
    </View>
  );

  const renderSettingsGroup = (items: any[]) => {
      if (items.length === 0) return null;
      return (
        <View style={styles.groupContainer}>
            {items.map((item, index) => {
                const isLast = index === items.length - 1;
                if (item.type === 'switch') {
                    return (
                        <SettingSwitch
                            key={item.key}
                            label={item.label}
                            value={settings[item.key as keyof ScannerSettings] as boolean}
                            onValueChange={(val) => onUpdateSetting(item.key as keyof ScannerSettings, val)}
                            isLast={isLast}
                        />
                    );
                } else if (item.type === 'dropdown') {
                    return (
                        <SettingDropdown
                            key={item.key}
                            label={item.label}
                            options={item.options}
                            selectedValue={settings[item.key as keyof ScannerSettings]}
                            onSelect={(val) => onUpdateSetting(item.key as keyof ScannerSettings, val)}
                            isOpen={openDropdown === item.key}
                            onToggle={() => setOpenDropdown(openDropdown === item.key ? null : item.key)}
                            isLast={isLast}
                        />
                    );
                }
                return null;
            })}
        </View>
      );
  };

  const renderBarcodeGroup = (category: '1D' | '2D') => {
      const types = getFilteredBarcodeTypes(category);
      if (types.length === 0) return null;

      const isAllEnabled = types.every(type => enabledTypes[type.id]);

      return (
          <View>
              {renderSectionHeader(`${category} Barcodes`)}
              <View style={styles.groupContainer}>
                  <SettingSwitch
                      label="Enable All"
                      value={isAllEnabled}
                      onValueChange={(val) => onEnableAll(val, category)}
                      isLast={false}
                  />
                  {types.map((type, index) => {
                      const isLast = index === types.length - 1;
                      return (
                        <SettingSwitch
                            key={type.id}
                            label={type.label}
                            value={!!enabledTypes[type.id]}
                            onValueChange={(val) => onToggleType(type.id, val)}
                            isLast={isLast}
                        />
                      );
                  })}
              </View>
          </View>
      );
  };

  return (
    <View style={styles.container}>
      <View style={StyleSheet.absoluteFill}>
        <BgImage width="100%" height="100%" preserveAspectRatio="xMidYMid slice" />
      </View>
      <SafeAreaView edges={['top']}>
        <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.backButton}>
                <Chevreon width={20} height={20} />
            </TouchableOpacity>
            <Text style={styles.title}>Settings</Text>
            <View style={styles.spacer} />
        </View>
      </SafeAreaView>

      <FlatList
        style={styles.FlatList}
        contentContainerStyle={styles.FlatListContent}
        data={[
            { key: 'general', render: () => <>{renderSectionHeader('General Settings')}{renderSettingsGroup(getGeneralSettings())}</> },
            { key: 'decoding', render: () => {
                const decodingItems = getDecodingSettings();
                if (decodingItems.length === 0) return null;
                return <>{renderSectionHeader('Decoding Settings')}{renderSettingsGroup(decodingItems)}</>;
            }},
            { key: '1d', render: () => renderBarcodeGroup('1D') },
            { key: '2d', render: () => renderBarcodeGroup('2D') },
            { key: 'reset', render: () => (
                <TouchableOpacity style={styles.resetButton} onPress={onResetConfig}>
                    <Text style={styles.resetButtonText}>Reset All Settings</Text>
                </TouchableOpacity>
            )}
        ]}
        keyExtractor={item => item.key}
        renderItem={({ item }) => item.render()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  backButton: {
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    color: '#000',
    marginLeft: 16,
  },
  spacer: {
    flex: 1,
  },
  FlatList: {
    flex: 1,
  },
  FlatListContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionHeaderContainer: {
    marginBottom: 8,
    marginTop: 16,
    paddingHorizontal: 4,
  },
  sectionHeaderText: {
    color: '#E52E4c',
    fontSize: 14,
    fontWeight: 'bold',
  },
  groupContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
  },
  resetButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    marginTop: 20,
    marginBottom: 40,
  },
  resetButtonText: {
    fontSize: 16,
    color: '#E52E4c',
    fontWeight: '500',
  },
});

export default UnifiedSettings;
