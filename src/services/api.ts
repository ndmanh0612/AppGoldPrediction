import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import goldHistory from '../../assets/data/Gold_Price(2013-2022).json';

const GOLD_URL = 'https://www.goldapi.io/api/XAU/USD';
const SILVER_URL = 'https://www.goldapi.io/api/XAG/USD';
const GOLDAPI_KEY = 'goldapi-aqmpcwsm9pbi9dy-io';

export interface GlobalMetalResponse {
  timestamp: number;
  price: number;
  ch: number;
  chp: number;
  bid: number;
  ask: number;
  low_price: number;
  high_price: number;
}

export interface GoldItem {
  name: string;
  updatedAt: string;
  bid: number;
  ask: number;
  change: number;
  changePercent: number;
  low: number;
  high: number;
}

interface GiavangRaw {
  jewelry: {
    dateTime: string;
    prices: Array<{ name: string; key: string; buy: number; sell: number | null }>;
  };
}

export interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface MetalPriceTSResponse {
  success: boolean;
  base: string;
  start_date: string;
  end_date: string;
  rates?: {
    [date: string]: { [symbol: string]: number };
  };
}

// Hàm lấy dữ liệu API với cơ chế thử lại khi gặp lỗi
async function fetchWithRetry<T>(
  url: string,
  config: any,
  cacheKey: string,
  retries = 3
): Promise<T> {
  try {
    const resp = await axios.get(url, config);
    const data = resp.data as T;
    await AsyncStorage.setItem(cacheKey, JSON.stringify(resp.data));
    return resp.data;
  } catch (err: any) {
    const status = err.response?.status;
    if (status === 503 && retries > 0) {
      await new Promise(r => setTimeout(r, (4 - retries) * 1000)); // Retry với độ trễ
      return fetchWithRetry(url, config, cacheKey, retries - 1); // Gọi lại hàm với số lần retry giảm
    }
    const cached = await AsyncStorage.getItem(cacheKey); // Lấy dữ liệu từ cache nếu có lỗi
    if (cached) {
      return JSON.parse(cached) as T;
    }
    throw err;
  }
}

// Hàm lấy giá vàng từ API
export const getGlobalGoldData = async (currency: string): Promise<GoldItem> => {
  const url = `https://www.goldapi.io/api/XAU/USD`;
  const data = await fetchWithRetry<GlobalMetalResponse>(
    url,
    { headers: { 'x-access-token': GOLDAPI_KEY, 'Content-Type': 'application/json' } },
    `cache:globalGold:USD`
  );
  const updatedAt = new Date(data.timestamp * 1000)
    .toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Bangkok' });
  return {
    name: 'Gold',
    updatedAt,
    bid: data.bid,
    ask: data.ask,
    change: data.ch,
    changePercent: data.chp,
    low: data.low_price,
    high: data.high_price,
  };
};

// Hàm lấy giá bạc từ API
export const getGlobalSilverData = async (currency: string): Promise<GoldItem> => {
  const url = `https://www.goldapi.io/api/XAG/USD`;
  const data = await fetchWithRetry<GlobalMetalResponse>(
    url,
    { headers: { 'x-access-token': GOLDAPI_KEY, 'Content-Type': 'application/json' } },
    `cache:globalSilver:USD`
  );
  const updatedAt = new Date(data.timestamp * 1000)
    .toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Bangkok' });
  return {
    name: 'Silver',
    updatedAt,
    bid: data.bid,
    ask: data.ask,
    change: data.ch,
    changePercent: data.chp,
    low: data.low_price,
    high: data.high_price,
  };
};

// Hàm lấy tỷ giá tiền tệ từ API
export const getExchangeRate = async (from: string, to: string): Promise<number> => {
  const url = `https://v6.exchangerate-api.com/v6/814726d37c54f354a9afb5cf/pair/${from}/${to}`;
  const res = await axios.get(url);
  return res.data.conversion_rate;
};

// Hàm lấy dữ liệu Bitcoin từ API
export const getBitcoinData = async (): Promise<GoldItem> => {
  const data = await fetchWithRetry<{ bitcoin: { usd: number; last_updated_at: number } }>(
    'https://api.coingecko.com/api/v3/simple/price',
    { params: { ids: 'bitcoin', vs_currencies: 'usd', include_last_updated_at: 'true' } },
    'cache:bitcoin'
  );
  const price = data.bitcoin.usd;
  const ts = data.bitcoin.last_updated_at;
  const updatedAt = new Date(ts * 1000)
    .toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Bangkok' });
  return {
    name: 'Bitcoin',
    updatedAt,
    bid: price,
    ask: price,
    change: 0,
    changePercent: 0,
    low: price,
    high: price,
  };
};

// Hàm lấy giá vàng Việt Nam từ API
export const getVietGoldData = async (): Promise<GoldItem> => {
  const data = await fetchWithRetry<GiavangRaw>(
    'https://giavang365.io.vn/v1/gold-prices',
    { headers: { accept: 'application/json' } },
    'cache:vietGold'
  );
  const { dateTime, prices } = data.jewelry;
  const gold24k = prices.find(p => p.key === 'vang24k');
  if (!gold24k) throw new Error('Không tìm thấy vàng 24k');
  const updatedAt = new Date(dateTime)
    .toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Bangkok' });
  return {
    name: 'Gold',
    updatedAt,
    bid: gold24k.buy,
    ask: gold24k.sell ?? 0,
    change: 0,
    changePercent: 0,
    low: 0,
    high: 0,
  };
};

export async function getVietAllGoldPrices(): Promise<{ name: string; buy: number; sell: number }[]> {
    const data = await fetchWithRetry<GiavangRaw>(
      'https://giavang365.io.vn/v1/gold-prices',
      { headers: { accept: 'application/json' } },
      'cache:vietAllGold'
    );
    return data.jewelry.prices.map(p => ({ name: p.name, buy: p.buy, sell: p.sell ?? 0 }));
  }



// Hàm lấy lịch sử giá vàng
export const getPriceHistory = async (): Promise<CandleData[]> => {
  try {
    type Raw = { Date: string; Price: string; Open: string; High: string; Low: string };
    const raw: Raw[] = goldHistory as any;

    const candles: CandleData[] = raw.map(item => {
      const [d, m, y] = item.Date.split('/').map(n => parseInt(n, 10));
      const ts = Math.floor(new Date(y, m - 1, d).getTime() / 1000);

      const parseNum = (s: string) => {
        const n = parseFloat(s.replace(/,/g, ''));
        return Number.isFinite(n) ? n : 0;
      };

      return {
        time: ts,
        close: parseNum(item.Price),
        open: parseNum(item.Open),
        high: parseNum(item.High),
        low: parseNum(item.Low),
      };
    });

    return candles.sort((a, b) => a.time - b.time);
  } catch (err) {
    console.error('Lỗi khi tải lịch sử giá vàng:', err);
    throw err;
  }
};
