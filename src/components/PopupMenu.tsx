import React from 'react';
import { Modal, View, TouchableOpacity, Text, StyleSheet, Pressable } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native'; // Import useNavigation và NavigationProp
import { RootStackParamList } from '../navigation/AppNavigator'; // Import RootStackParamList

interface Props {
  visible: boolean;
  onClose: () => void;
}

// Cập nhật kiểu navigation sử dụng StackNavigationProp
const PopupMenu: React.FC<Props> = ({ visible, onClose }) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>(); // Khai báo kiểu đúng cho navigation

  const navigateToVNDGoldScreen = () => {
    onClose(); // Đóng menu popup
    navigation.navigate('VNDGoldScreen'); 
  };
  const navigateToCaculator = () => {
    onClose(); // Đóng menu popup
    navigation.navigate('Calculator'); 
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.popupMenu}>
          <TouchableOpacity
            style={styles.popupButton}
            onPress={navigateToVNDGoldScreen}
          >
            <Text style={styles.popupText}>Giá Vàng Trong Nước</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.popupButton}
            onPress={navigateToCaculator}
          >
            <Text style={styles.popupText}>Đổi Tỷ Giá</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // Tăng độ mờ cho overlay để nổi bật hơn
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  popupMenu: {
    backgroundColor: '#ffffff',
    width: '92%',
    borderRadius: 15, // Bo góc mềm mại hơn
    paddingTop: 24,
    paddingBottom: 30,
    paddingHorizontal: 20,
    marginBottom: 85,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3, // Giảm độ mờ của bóng đổ để nhẹ nhàng hơn
    shadowRadius: 10,
    elevation: 12,
  },
  popupButton: {
    backgroundColor: '#0077A2',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginVertical: 6,
    width: '100%',
    alignItems: 'center',
  },
  popupText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PopupMenu;
