import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import TouchIcon from '../assets/icons/touch_icon.svg';

interface PauseOverlayProps {
  onResume: () => void;
  isSheetExpanded?: boolean;
}

const PauseOverlay: React.FC<PauseOverlayProps> = ({ isSheetExpanded }) => {
  return (
    <View
      style={[
        styles.pauseOverlay,
        isSheetExpanded ? styles.pauseOverlayExpanded : styles.pauseOverlayCentered,
      ]}
      pointerEvents="none"
    >
      <View style={styles.messageContainer}>
        <TouchIcon width={18} height={18} fill="#fff" style={styles.icon} />
        <Text style={styles.pauseText}>Tap anywhere to continue</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  pauseOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.0)',
    alignItems: 'center',
    zIndex: 25,
  },
  pauseOverlayCentered: {
    justifyContent: 'center',
  },
  pauseOverlayExpanded: {
    justifyContent: 'flex-start',
    paddingTop: 100,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(120, 120, 120, 0.65)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  icon: {
    marginRight: 8,
  },
  pauseText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
  },
});

export default PauseOverlay;
