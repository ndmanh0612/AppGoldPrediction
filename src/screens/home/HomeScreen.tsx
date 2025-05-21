import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity } from 'react-native';
import {
  getGlobalGoldData,
  getGlobalSilverData,
  getBitcoinData,
  GoldItem,
  getVietGoldData,
  getExchangeRate
} from '../../services/api';
import BottomNavBar from '../../components/BottomNavBar';
import MenuCurrency from '../../components/MenuCurrency';
import PopupMenu from '../../components/PopupMenu';
import { Currency } from '../../@types/currency';
import ChartDrawer from '../../components/ChartView';

type ListItem =
  | { type: 'metalHeader' }
  | { type: 'metalItem'; item: GoldItem }
  | { type: 'rowHeader' }
  | { type: 'cryptoHeader' }
  | { type: 'cryptoItem'; item: GoldItem };

const HomeScreen: React.FC = () => {
  const [currency, setCurrency] = useState<Currency>('USD');
  const [listData, setListData] = useState<ListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currencyModalVisible, setCurrencyModalVisible] = useState(false);
  const [popupVisible, setPopupVisible] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [refreshing, setRefreshing] = useState(false); // State for pull-to-refresh

  const fetchAll = async () => {
    setLoading(true);
    try {
      let gold: GoldItem;
      let silver: GoldItem;
      let bitcoin: GoldItem;

      let rate = 1; // default rate if USD

      if (currency === 'VND') {
        gold = await getVietGoldData();
        silver = {
          name: 'Silver',
          updatedAt: gold.updatedAt,
          bid: 0,
          ask: 0,
          change: 0,
          changePercent: 0,
          low: 0,
          high: 0,
        };

        bitcoin = await getBitcoinData();
        // Assuming Bitcoin price from API is in USD, convert to VND
        rate = await getExchangeRate('USD', 'VND');
        bitcoin = {
          ...bitcoin,
          bid: bitcoin.bid * rate,
          ask: bitcoin.ask * rate,
          low: bitcoin.low * rate,
          high: bitcoin.high * rate,
        };
      } else if (currency === 'USD') {
        // If USD, no conversion needed
        gold = await getGlobalGoldData('USD');
        silver = await getGlobalSilverData('USD');
        bitcoin = await getBitcoinData();
      } else {
        // Other currencies, convert from USD
        rate = await getExchangeRate('USD', currency);

        const goldUSD = await getGlobalGoldData('USD');
        const silverUSD = await getGlobalSilverData('USD');

        gold = {
          ...goldUSD,
          bid: goldUSD.bid * rate,
          ask: goldUSD.ask * rate,
          low: goldUSD.low * rate,
          high: goldUSD.high * rate,
        };
        silver = {
          ...silverUSD,
          bid: silverUSD.bid * rate,
          ask: silverUSD.ask * rate,
          low: silverUSD.low * rate,
          high: silverUSD.high * rate,
        };

        bitcoin = await getBitcoinData();
        bitcoin = {
          ...bitcoin,
          bid: bitcoin.bid * rate,
          ask: bitcoin.ask * rate,
          low: bitcoin.low * rate,
          high: bitcoin.high * rate,
        };
      }

      const data: ListItem[] = [
        { type: 'metalHeader' },
        { type: 'rowHeader' },
        { type: 'metalItem', item: gold },
        { type: 'metalItem', item: silver },
        { type: 'cryptoHeader' },
        { type: 'rowHeader' },
        { type: 'cryptoItem', item: bitcoin },
      ];
      setListData(data);
    } catch (e) {
      console.error(e);
      setListData([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAll();
  };

  useEffect(() => {
    fetchAll();
  }, [currency]);

  const renderItem = ({ item }: { item: ListItem }) => {
    switch (item.type) {
      case 'metalHeader':
        return (
          <View style={styles.topBar}>
            <Text style={styles.title}>Precious Metals</Text>
            <TouchableOpacity
              style={styles.dropdownTrigger}
              onPress={() => setCurrencyModalVisible(true)}
            >
              <Text style={styles.triggerText}>
                {currency} ▼
              </Text>
            </TouchableOpacity>
            <Text style={styles.unit}>OUNCE</Text>
          </View>
        );

      case 'rowHeader':
        return (
          <View style={styles.headerRow}>
            <Text style={[styles.headerCell, styles.colTime, styles.leftAlign]}>
              Updated at
            </Text>
            <Text style={[styles.headerCell, styles.colBidAsk]}>Bid/Ask</Text>
            <Text style={[styles.headerCell, styles.colChange]}>Change</Text>
            <Text style={[styles.headerCell, styles.colLowHigh]}>Low/High</Text>
          </View>
        );

      case 'metalItem':
      case 'cryptoItem':
        return (
          <TouchableOpacity onPress={() => setShowChart(true)}>
            <View style={item.type === 'metalItem' ? styles.metalContainer : styles.cryptoContainer}>
              <View style={[styles.cell, styles.colTime]}>
                <Text style={styles.metalName}>{item.item.name}</Text>
                <Text style={styles.updatedAt}>{item.item.updatedAt}</Text>
              </View>
              <View style={[styles.cell, styles.colBidAsk]}>
                <Text>{item.item.bid.toFixed(2)}</Text>
                <Text>{item.item.ask.toFixed(2)}</Text>
              </View>
              <View style={[styles.cell, styles.colChange]}>
                <Text style={item.item.change >= 0 ? styles.pos : styles.neg}>
                  {item.item.change.toFixed(2)}
                </Text>
                <Text style={item.item.changePercent >= 0 ? styles.pos : styles.neg}>
                  {item.item.changePercent.toFixed(2)}%
                </Text>
              </View>
              <View style={[styles.cell, styles.colLowHigh]}>
                <Text>{item.item.low.toFixed(2)}</Text>
                <Text>{item.item.high.toFixed(2)}</Text>
              </View>
            </View>
          </TouchableOpacity>
        );

      case 'cryptoHeader':
        return (
          <View style={styles.topBar}>
            <Text style={styles.title}>Cryptos</Text>
            <Text style={styles.unit}>1H</Text>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <FlatList
          data={listData}
          keyExtractor={(_, idx) => idx.toString()}
          renderItem={renderItem}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      )}

      <ChartDrawer visible={showChart} onClose={() => setShowChart(false)} title={"CHART"} />
      <BottomNavBar onCenterPress={() => setPopupVisible(prev => !prev)} />

      <MenuCurrency visible={currencyModalVisible} onClose={() => setCurrencyModalVisible(false)} onSelect={(c) => setCurrency(c)} />

      <PopupMenu visible={popupVisible} onClose={() => setPopupVisible(false)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  loading: { flex: 1, justifyContent: 'center' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    backgroundColor: '#1e3d58',
    height: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  title: { fontSize: 18, fontWeight: 'bold', color: '#fff', flex: 1 },
  dropdownTrigger: { paddingHorizontal: 8, paddingVertical: 4, backgroundColor: '#f0f8ff' },
  triggerText: { fontSize: 16, color: '#333' },
  unit: { marginLeft: 12, fontSize: 14, fontWeight: '500', color: '#fff' },
  headerRow: { flexDirection: 'row', backgroundColor: '#fff', paddingVertical: 10, paddingHorizontal: 16 },
  headerCell: { fontSize: 14, fontWeight: '700', textAlign: 'center' },
  leftAlign: { textAlign: 'left', paddingLeft: 0 },
  metalContainer: {
    flexDirection: 'row',
    paddingVertical: 15,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  cryptoContainer: {
    flexDirection: 'row',
    paddingVertical: 15,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  cell: { justifyContent: 'center' },
  colTime: { flex: 1, alignItems: 'flex-start' },
  colBidAsk: { width: 80, alignItems: 'center' },
  colChange: { width: 80, alignItems: 'center' },
  colLowHigh: { width: 100, alignItems: 'center' },
  metalName: { fontWeight: '700', fontSize: 16 },
  updatedAt: { fontSize: 14, color: '#555' },
  pos: { color: 'green' },
  neg: { color: 'red' },
});

export default HomeScreen;
