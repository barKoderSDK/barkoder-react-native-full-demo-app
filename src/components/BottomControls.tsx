import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import ZoomInIcon from '../assets/icons/zoom_in.svg';
import ZoomOutIcon from '../assets/icons/zoom_out.svg';
import FlashOn from '../assets/icons/flash_on.svg';
import FlashOff from '../assets/icons/flash_off.svg';
import CameraSwitch from '../assets/icons/camera_switch.svg';

interface BottomControlsProps {
  activeBarcodeText: string;
  zoomLevel: number;
  isFlashOn: boolean;
  onToggleZoom: () => void;
  onToggleFlash: () => void;
  onToggleCamera: () => void;
}

const BottomControls = ({
  activeBarcodeText,
  zoomLevel,
  isFlashOn,
  onToggleZoom,
  onToggleFlash,
  onToggleCamera,
}: BottomControlsProps) => {
  return (
    <View style={styles.bottomControlsContainer} pointerEvents="box-none">
      {activeBarcodeText.length > 0 && (
        <View style={styles.typesContainer}>
          <Text style={styles.typesText}>
            {activeBarcodeText}
          </Text>
        </View>
      )}
      
      <View style={styles.controlsRow}>
        <TouchableOpacity style={styles.controlButton} onPress={onToggleZoom}>
          {zoomLevel === 1.0 ? (
            <ZoomOutIcon width={30} height={30} />
          ) : (
            <ZoomInIcon width={30} height={30} />
          )}
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.controlButton} onPress={onToggleFlash}>
          {isFlashOn ? (
            <FlashOff width={30} height={30} />
          ) : (
            <FlashOn width={30} height={30} />
          )}
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.controlButton} onPress={onToggleCamera}>
          <CameraSwitch width={30} height={30} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomControlsContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 15,
    paddingBottom: 20,
  },
  typesContainer: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  typesText: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
  },
  controlsRow: {
    flexDirection: 'row',
    gap: 20,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 8,
    borderColor: '#e52e4d',
    borderWidth: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
});

export default BottomControls;
