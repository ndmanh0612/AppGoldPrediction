import axios from 'axios';

// Dữ liệu kiểu NewsItem
export interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  publisher: string;
  description: string;
  imageUrl?: string;
}

// Map raw JSON fields to NewsItem
function mapRawToNewsItem(raw: any): NewsItem {
  return {
    title: raw['title'],
    link: raw['url'],
    pubDate: raw['publishedAt'],
    publisher: raw['source']['name'],
    description: raw['description'],
    imageUrl: raw['urlToImage'] || undefined,
  };
}

/**
 * Returns all crypto news items from CoinMarketCap API
 */


export function getCryptoNews(): Promise<NewsItem[]> {
  const apiKey = 'dbd2c2cd4d0b4b0abdfca7037c6fbd58'; // Thay bằng API key News API
  const url = `https://newsapi.org/v2/everything?q=metal&apiKey=${apiKey}`;
  return axios
    .get(url)
    .then((response) => response.data.articles.map(mapRawToNewsItem))
    .catch((error) => {
      console.error("Error fetching metal news:", error);
      return [];
    });
}

/**
 * Returns all metal news items from News API
 */
export function getMetalNews(): Promise<NewsItem[]> {
  const apiKey = 'dbd2c2cd4d0b4b0abdfca7037c6fbd58'; // Thay bằng API key News API
  const url = `https://newsapi.org/v2/everything?q=metal&apiKey=${apiKey}`;
  return axios
    .get(url)
    .then((response) => response.data.articles.map(mapRawToNewsItem))
    .catch((error) => {
      console.error("Error fetching metal news:", error);
      return [];
    });
}

/**
 * Returns combined metal and crypto news items
 */
export function getAllNews(): Promise<NewsItem[]> {
  return Promise.all([getMetalNews(), getCryptoNews()])
    .then(([metalNews, cryptoNews]) => [...metalNews, ...cryptoNews])
    .catch((error) => {
      console.error("Error fetching all news:", error);
      return [];
    });
}
