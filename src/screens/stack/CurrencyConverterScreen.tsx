import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Modal, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { getExchangeRate } from '../../services/api';

const Calculator: React.FC = () => {
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('VND');
  const [amount, setAmount] = useState('');
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);

  const [modalVisible, setModalVisible] = useState(false); // State Modal
  const [isFromCurrency, setIsFromCurrency] = useState(true); // Kiểm tra chọn tiền tệ gốc hay cần đổi

  // Danh sách các loại tiền tệ và cờ
  const currencies = [
    { code: 'USD', flag: '🇺🇸' },
    { code: 'VND', flag: '🇻🇳' },
    { code: 'JPY', flag: '🇯🇵' },
    { code: 'EUR', flag: '🇪🇺' },
    { code: 'GBP', flag: '🇬🇧' },
    { code: 'AUD', flag: '🇦🇺' },
    { code: 'CAD', flag: '🇨🇦' },
    { code: 'INR', flag: '🇮🇳' }
  ];

  const handleConversion = async () => {
    if (!amount || isNaN(Number(amount))) {
      Alert.alert('Lỗi', 'Vui lòng nhập số tiền hợp lệ.');
      return;
    }

    setLoading(true);
    try {
      const rate = await getExchangeRate(fromCurrency, toCurrency);
      setExchangeRate(rate);  // Cập nhật tỷ giá
      const converted = parseFloat(amount) * rate;
      setConvertedAmount(converted);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể lấy tỉ giá. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Hàm mở Modal để chọn tiền tệ
  const showCurrencyModal = (isFromCurrency: boolean) => {
    setIsFromCurrency(isFromCurrency);
    setModalVisible(true); // Mở Modal
  };

  // Hàm chọn tiền tệ từ Modal
  const handleSelectCurrency = (currency: string) => {
    if (isFromCurrency) {
      setFromCurrency(currency);
    } else {
      setToCurrency(currency);
    }
    setModalVisible(false); // Đóng Modal
  };

  // Hàm hủy chọn tiền tệ và đóng Modal
  const handleCancel = () => {
    setModalVisible(false); // Đóng Modal mà không thay đổi gì
  };

  // Hàm lấy cờ cho mỗi tiền tệ
  const getFlagForCurrency = (currencyCode: string) => {
    const currency = currencies.find(item => item.code === currencyCode);
    return currency ? currency.flag : '';
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.header}>Currency Converter</Text>

        {/* Chọn tiền tệ gốc */}
        <Text style={styles.selectText}>Chọn tiền tệ gốc</Text>
        <TouchableOpacity
          style={styles.pickerContainer}
          onPress={() => showCurrencyModal(true)} // Gọi hàm mở modal cho tiền tệ gốc
        >
          <Text style={styles.pickerText}>
            {getFlagForCurrency(fromCurrency)} {fromCurrency}
          </Text>
        </TouchableOpacity>

        {/* Chọn tiền tệ cần đổi */}
        <Text style={styles.selectText}>Chọn tiền tệ cần đổi</Text>
        <TouchableOpacity
          style={styles.pickerContainer}
          onPress={() => showCurrencyModal(false)} // Gọi hàm mở modal cho tiền tệ cần đổi
        >
          <Text style={styles.pickerText}>
            {getFlagForCurrency(toCurrency)} {toCurrency}
          </Text>
        </TouchableOpacity>

        {/* Nhập số tiền */}
        <Text style={styles.selectText}>Nhập số tiền</Text>
        <TextInput
          style={styles.input}
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          placeholder="Nhập số tiền"
        />

        {/* Nút tính toán */}
        <TouchableOpacity
          style={styles.button}
          onPress={handleConversion}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Đang tải...' : 'Tính toán'}
          </Text>
        </TouchableOpacity>

        {/* Kết quả */}
        {loading && (
          <ActivityIndicator size="large" color="#0000ff" style={styles.loadingIndicator} />
        )}

        {convertedAmount !== null && !loading && (
          <Text style={styles.result}>
            {amount} {fromCurrency} = {convertedAmount.toFixed(2)} {toCurrency}
          </Text>
        )}

        {/* Hiển thị tỷ giá */}
        {exchangeRate !== null && !loading && (
          <Text style={styles.rateText}>
            Tỷ Giá Hiện Tại: 1 {fromCurrency} = {exchangeRate.toFixed(2)} {toCurrency}
          </Text>
        )}
      </ScrollView>

      {/* Modal chọn tiền tệ */}
      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={handleCancel}
      >
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            {/* Nút Cancel nhỏ ở góc phải */}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <ScrollView>
              {currencies.map(({ code, flag }) => (
                <TouchableOpacity
                  key={code}
                  style={styles.item}
                  onPress={() => handleSelectCurrency(code)}
                >
                  <Text style={styles.itemText}>
                    {flag} {code}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
    justifyContent: 'center',
  },
  scrollContainer: {
    padding: 20,
    alignItems: 'center',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#0077A2',
  },
  selectText: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  pickerContainer: {
    width: '90%',
    marginBottom: 20,
    alignSelf: 'center',
    backgroundColor: '#fff',
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: '#0077A2',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerText: {
    fontSize: 18,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    padding: 10,
    width: '90%',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    borderRadius: 8,
    alignSelf: 'center',
    borderColor: '#0077A2',
    backgroundColor: '#fff',
  },
  result: {
    fontSize: 18,
    marginTop: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#28a745',
  },
  rateText: {
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
    color: '#0077A2',
  },
  loadingIndicator: {
    marginVertical: 20,
  },
  button: {
    width: '90%',
    backgroundColor: '#0077A2',
    paddingVertical: 15,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: '#1c1c1e',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 10,
    paddingBottom: 20,
    maxHeight: '50%',
    position: 'relative',
  },
  item: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    marginVertical: 4,
  },
  itemText: {
    fontSize: 17,
    color: '#d1d1d6',
  },
  cancelButton: {
    position: 'absolute',
    top: 10,
    right: 20,
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#0077A2',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default Calculator;
