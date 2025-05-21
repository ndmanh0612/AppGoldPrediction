import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import moment from 'moment';
import { getVietAllGoldPrices } from '../../services/api';

interface VietGold {
  name: string;
  buy: number;
  sell: number;
  dateTime: string;
}

const VNDGoldScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [prices, setPrices] = useState<VietGold[]>([]);
  const [refreshing, setRefreshing] = useState(false); // Add refreshing state

  const fetchPrices = async () => {
    setLoading(true);
    try {
      const data = await getVietAllGoldPrices();
      const now = new Date().toISOString();
      const enriched = data.map(item => ({
        ...item,
        dateTime: now, // hoặc bạn có thể gán theo từng item nếu có timestamp
      }));
      setPrices(enriched);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false); // Stop refreshing when done
    }
  };

  useEffect(() => {
    fetchPrices();
  }, []);

  const onRefresh = () => {
    setRefreshing(true); // Start refreshing
    fetchPrices(); // Fetch data again
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.list}
      data={prices}
      keyExtractor={item => item.name}
      contentContainerStyle={styles.container}
      refreshing={refreshing} // Bind refreshing state
      onRefresh={onRefresh} // Bind refresh function
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.headerTitle}>{item.name}</Text>
          <Text style={styles.timestamp}>{moment(item.dateTime).format('HH:mm:ss DD/MM/YYYY')}</Text>
          <View style={styles.row}>
            <View style={styles.priceBlock}>
              <Text style={styles.label}>Mua vào</Text>
              <Text style={styles.label}>Bán ra</Text>
            </View>
            <View style={styles.priceBlock}>
              <Text style={styles.price}>{item.buy.toLocaleString()} đ</Text>
              <Text style={styles.price}>{item.sell.toLocaleString()} đ</Text>
            </View>
          </View>
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },
  list: { flex: 1, backgroundColor: '#f5f5f5' },
  container: { padding: 16 },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  headerTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#333', 
    marginBottom: 8,
  },
  timestamp: { 
    fontSize: 14, 
    color: '#999', 
    marginBottom: 12, 
    fontStyle: 'italic',
  },
  row: { 
    flexDirection: 'row', 
    justifyContent: 'space-between' 
  },
  priceBlock: { 
    alignItems: 'flex-start', 
    justifyContent: 'center' 
  },
  label: { 
    fontSize: 16, 
    color: '#757575', 
    marginBottom: 4,
  },
  price: { 
    fontSize: 18, 
    fontWeight: '600', 
    color: '#4CAF50', 
    marginBottom: 4,
  },
});

export default VNDGoldScreen;
