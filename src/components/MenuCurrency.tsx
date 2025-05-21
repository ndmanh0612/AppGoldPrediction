import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Currency } from '../@types/currency';

const CURRENCIES: { code: Currency; flag: string; name: string }[] = [
  { code: 'USD', flag: '🇺🇸', name: 'US Dollar' },
  { code: 'CAD', flag: '🇨🇦', name: 'Canadian Dollar' },
  { code: 'INR', flag: '🇮🇳', name: 'Indian Rupee' },
  { code: 'AUD', flag: '🇦🇺', name: 'Australian Dollar' },
  { code: 'EUR', flag: '🇪🇺', name: 'Euro' },
  { code: 'GBP', flag: '🇬🇧', name: 'British Pound' },
  { code: 'JPY', flag: '🇯🇵', name: 'Japanese Yen' },
  { code: 'VND', flag: '🇻🇳', name: 'Vietnamese Dong' },
];

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelect: (currency: Currency) => void;
}

const MenuCurrency: React.FC<Props> = ({ visible, onClose, onSelect }) => {
  const [selected, setSelected] = useState<Currency>('USD');

  const handleDone = () => {
    onSelect(selected);
    onClose();
  };

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.headerText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDone}>
              <Text style={styles.headerText}>Done</Text>
            </TouchableOpacity>
          </View>

          {/* Scrollable content */}
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            {CURRENCIES.map(({ code, flag, name }) => {
              const isSelected = code === selected;
              return (
                <TouchableOpacity
                  key={code}
                  style={[styles.item, isSelected && styles.selectedItem]}
                  onPress={() => setSelected(code)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.itemText, isSelected && styles.selectedText]}>
                    {flag} {name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default MenuCurrency;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: '#1c1c1e', // iOS dark background
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 10,
    paddingBottom: 20,
    maxHeight: '55%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#2c2c2e',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  headerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0a84ff', // iOS blue
  },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  item: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    marginVertical: 4,
  },
  selectedItem: {
    backgroundColor: '#3a3a3c',
  },
  itemText: {
    fontSize: 17,
    color: '#d1d1d6',
  },
  selectedText: {
    color: '#fff',
    fontWeight: '600',
  },
});
