import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import TouchIcon from '../assets/icons/touch_icon.svg';

interface PauseOverlayProps {
  onResume: () => void;
}

/**
 * Overlay displayed when scanning is paused.
 */
const PauseOverlay: React.FC<PauseOverlayProps> = ({ onResume }) => {
  return (
    <TouchableOpacity
      style={styles.pauseOverlay}
      activeOpacity={1}
      onPress={onResume}
    >
      <View style={styles.messageContainer}>
        <TouchIcon width={24} height={24} fill="#fff" style={styles.icon} />
        <Text style={styles.pauseText}>Tap anywhere to continue</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  pauseOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.0)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
  },
  icon: {
    marginRight: 10,
  },
  pauseText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PauseOverlay;
