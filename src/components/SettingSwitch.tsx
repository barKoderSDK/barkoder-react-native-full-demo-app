import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';

interface SettingSwitchProps {
  label: string;
  value: boolean;
  onValueChange: (val: boolean) => void;
  isLast?: boolean;
}

/**
 * Reusable switch component for settings.
 */
const SettingSwitch = ({ label, value, onValueChange, isLast }: SettingSwitchProps) => (
  <View style={[styles.itemContainer, !isLast && styles.itemBorder]}>
    <Text style={styles.itemLabel}>{label}</Text>
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: '#767577', true: '#E52E4c' }}
      thumbColor={'#f4f3f4'}
    />
  </View>
);

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
  },
  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemLabel: {
    fontSize: 14,
    color: '#000',
    fontWeight: '400',
  },
});

export default SettingSwitch;
