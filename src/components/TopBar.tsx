import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import LogoBarkoder from '../assets/images/logo_barkoder.svg';

interface TopBarProps {
  /** Optional custom style for the container */
  style?: ViewStyle;
  /** Callback when the settings/menu button is pressed */
  onMenuPress?: () => void;
  /** Callback when the close button is pressed */
  onClose?: () => void;
  /** Position of the logo: 'center' (default) or 'left' */
  logoPosition?: 'left' | 'center';
}

/**
 * TopBar Component
 * Renders a navigation header with optional Close button, Logo, and Settings button.
 * Supports centering the logo or aligning it to the left.
 */
const TopBar = ({ 
  style, 
  onMenuPress, 
  onClose, 
  logoPosition = 'center' 
}: TopBarProps) => {

  // --- Render Helpers ---

  const renderCloseButton = () => {
    if (!onClose) return null;
    return (
      <TouchableOpacity 
        onPress={onClose} 
        style={[styles.closeButton, logoPosition === 'left' && styles.marginRight]}
      >
        <MaterialIcons name="close" size={28} color="#000" />
      </TouchableOpacity>
    );
  };

  const renderLogo = () => (
    <LogoBarkoder width={120} height={30} />
  );

  const renderMenuButton = () => {
    if (!onMenuPress) return null;
    return (
      <TouchableOpacity onPress={onMenuPress}>
        <MaterialIcons name="settings" size={28} color="#333" />
      </TouchableOpacity>
    );
  };

  // --- Layout Logic ---

  return (
    <View style={[styles.topBar, style]}>
      <View style={styles.sideContainer}>
        {logoPosition === 'left' ? renderLogo() : renderCloseButton()}
      </View>
        {logoPosition !== 'left' ? renderLogo() : null}      
      <View style={[styles.sideContainer, styles.rightSide]}>
        {renderMenuButton()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  // Styles for 'center' layout
  sideContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  rightSide: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  // Styles for 'left' layout
  leftAlignedContainer: {
    flexDirection: 'row', 
    alignItems: 'center', 
    flex: 1,
  },
  rightAlignedContainer: {
    flexDirection: 'row', 
    alignItems: 'center',
  },
  // Shared styles
  closeButton: {
    padding: 4,
  },
  marginRight: {
    marginRight: 8,
  },
});

export default TopBar;
