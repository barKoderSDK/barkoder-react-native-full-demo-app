import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import LogoBarkoder from '../assets/images/logo_barkoder.svg';
import LogoBarkoderWhite from '../assets/images/logo_barkoder_white.svg';

interface TopBarProps {
  style?: ViewStyle;
  onMenuPress?: () => void;
  onClose?: () => void;
  logoPosition?: 'left' | 'center';
  transparent?: boolean;
}

const TopBar = ({ 
  style, 
  onMenuPress, 
  onClose, 
  logoPosition = 'center',
  transparent = false
}: TopBarProps) => {

  const iconColor = transparent ? '#fff' : '#000';

  const renderCloseButton = () => {
    if (!onClose) return null;
    return (
      <TouchableOpacity 
        onPress={onClose} 
        style={[styles.closeButton, logoPosition === 'left' && styles.marginRight]}
      >
        <MaterialIcons name="close" size={28} color={iconColor} />
      </TouchableOpacity>
    );
  };

  const renderLogo = () => {
    const Logo = transparent ? LogoBarkoderWhite : LogoBarkoder;
    return <Logo width={120} height={30} />;
  };

  const renderMenuButton = () => {
    if (!onMenuPress) return null;
    return (
      <TouchableOpacity onPress={onMenuPress}>
        <MaterialIcons name="settings" size={28} color={iconColor} />
      </TouchableOpacity>
    );
  };

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
    backgroundColor: 'transparent',
  },
  sideContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  rightSide: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  leftAlignedContainer: {
    flexDirection: 'row', 
    alignItems: 'center', 
    flex: 1,
  },
  rightAlignedContainer: {
    flexDirection: 'row', 
    alignItems: 'center',
  },
  closeButton: {
    padding: 4,
  },
  marginRight: {
    marginRight: 8,
  },
});

export default TopBar;
