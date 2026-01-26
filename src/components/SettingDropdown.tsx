import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import ChevreonRight from '../assets/icons/chevron_right.svg';

interface SettingDropdownProps {
  label: string;
  options: { label: string; value: any }[];
  selectedValue: any;
  onSelect: (val: any) => void;
  isOpen: boolean;
  onToggle: () => void;
  isLast?: boolean;
}

const SettingDropdown = ({ label, options, selectedValue, onSelect, isOpen, onToggle, isLast }: SettingDropdownProps) => {
  const selectedOption = options.find(o => o.value === selectedValue);
  const displayValue = selectedOption ? selectedOption.label : 'Select';

  return (
    <View style={styles.dropdownWrapper}>
      <TouchableOpacity
        style={[styles.itemContainer, !isLast && styles.itemBorder]}
        onPress={onToggle}
      >
        <Text style={styles.itemLabel}>{label}</Text>
        <View style={styles.dropdownValueContainer}>
          <Text style={styles.dropdownValueText}>{displayValue}</Text>
          <ChevreonRight width={14} height={14} />
        </View>
      </TouchableOpacity>
      {isOpen && (
        <View style={styles.dropdownOptions}>
          {options.map((opt, index) => (
            <TouchableOpacity
              key={index}
              style={styles.dropdownOptionItem}
              onPress={() => {
                onSelect(opt.value);
                onToggle();
              }}
            >
              <Text
                style={[
                  styles.dropdownOptionText,
                  opt.value === selectedValue && styles.dropdownOptionTextSelected,
                ]}
              >
                {opt.label}
              </Text>
              {opt.value === selectedValue && (
                <MaterialIcons name="check" size={16} color="#E52E4c" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
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
  dropdownWrapper: {
    backgroundColor: '#fff',
  },
  dropdownValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownValueText: {
    fontSize: 14,
    color: '#666',
    marginRight: 10,
  },
  dropdownOptions: {
    backgroundColor: '#f9f9f9',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownOptionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    paddingLeft: 32,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  dropdownOptionText: {
    fontSize: 14,
    color: '#666',
  },
  dropdownOptionTextSelected: {
    color: '#E52E4c',
    fontWeight: 'bold',
  },
});

export default SettingDropdown;
