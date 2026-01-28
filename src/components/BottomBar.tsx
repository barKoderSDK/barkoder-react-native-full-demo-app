import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import IconInfo from '../assets/icons/info.svg';
import IconRecent from '../assets/icons/recent.svg';
import IconStart from '../assets/icons/start.svg';

type RootStackParamList = {
  Home: undefined;
  Scanner: { mode: string; sessionId?: number };
  History: undefined;
  About: undefined;
};

const BottomBar = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  
  return (
    <View
      style={[
        styles.bottomBar,
        { paddingBottom: Math.max(insets.bottom, 10), height: 90 + Math.max(insets.bottom, 0) },
      ]}
    >
        <TouchableOpacity 
          style={styles.tabItem}
          onPress={() => navigation.navigate('History')}
        >
          <IconRecent width={24} height={24} color="#000" />
          <Text style={styles.tabLabel}>Recent</Text>
        </TouchableOpacity>

        <View style={styles.centerTabItem}>
            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('Scanner', { mode: 'v1', sessionId: Date.now() })}
            >
                <IconStart width={28} height={28} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.tabLabel}>Anyscan</Text>
        </View>

        <TouchableOpacity 
          style={styles.tabItem}
          onPress={() => navigation.navigate('About')}
        >
          <IconInfo width={24} height={24} color="#000" />
          <Text style={styles.tabLabel}>About</Text>
        </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    paddingHorizontal: 10,
    elevation: 10,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: 20,
    flex: 1,
    height: '100%',
  },
  centerTabItem: {
      alignItems: 'center',
      justifyContent: 'flex-end',
      flex: 1,
      height: '100%',
      paddingBottom: 20,
  },
  tabLabel: {
      fontSize: 13,
      color: '#444',
      marginTop: 6,
      fontWeight: '600',
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 22,
    backgroundColor: '#E52E4c',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
});

export default BottomBar;
