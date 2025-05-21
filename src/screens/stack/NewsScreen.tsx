import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
  Dimensions,
  Image,
} from 'react-native';
import { TabView, TabBar } from 'react-native-tab-view';
import type { Route } from 'react-native-tab-view';
import moment from 'moment';
import {
  getMetalNews,
  getCryptoNews,
  NewsItem,
} from '../../services/newsApi';

const NewsList: React.FC<{ fetcher: () => Promise<NewsItem[]> }> = ({ fetcher }) => {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<NewsItem[]>([]);

  useEffect(() => {
    let mounted = true;
    fetcher()
      .then(data => { if (mounted) setItems(data); })
      .catch(console.error)
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [fetcher]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <FlatList
      style={{ flex: 1 }}
      data={items}
      keyExtractor={item => item.link}
      contentContainerStyle={styles.listContainer}
      renderItem={({ item }) => (
        <TouchableOpacity style={styles.card} onPress={() => Linking.openURL(item.link)}>
          {item.imageUrl && (
            <View style={styles.thumbContainer}>
              <Image
                source={{ uri: item.imageUrl }}
                style={styles.image}
                resizeMode="cover"
              />
            </View>
          )}
          <View style={styles.textContainer}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.publisher}>{item.publisher}</Text>
            <Text style={styles.date}>{moment(item.pubDate).format('LLL')}</Text>
          </View>
        </TouchableOpacity>
      )}
    />
  );
};

// scene renderer
const renderScene = ({ route }: { route: Route }) => {
  switch (route.key) {
    case 'metals':
      return <NewsList key="metals" fetcher={getMetalNews} />;
    case 'crypto':
      return <NewsList key="crypto" fetcher={getCryptoNews} />;
    default:
      return null;
  }
};

export default function NewsScreen() {
  const layout = Dimensions.get('window');
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'metals', title: 'Metals' },
    { key: 'crypto', title: 'Crypto' },
  ]);

  return (
    <View style={{ flex: 1 }}>
      <TabView
        style={{ flex: 1 }}
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        renderTabBar={(props: any) => (
          <TabBar
            {...props}
            style={styles.tabBar}
            indicatorStyle={styles.indicator}
            activeColor="#fff"
            inactiveColor="#888"
            renderLabel={({ route, color }: any) => (
              <Text style={[styles.label, { color }]}>{route.title}</Text>
            )}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: { backgroundColor: '#000' },
  indicator: { backgroundColor: '#fff' },
  label: { color: '#fff', fontWeight: '600' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContainer: { padding: 16 },
  card: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#111',
    borderRadius: 8,
    overflow: 'hidden',
  },
  thumbContainer: {
    width: 80,
    height: 60,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  textContainer: { flex: 1, padding: 8 },
  title: { color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 4 },
  publisher: { color: '#888', fontSize: 12, marginBottom: 2 },
  date: { color: '#555', fontSize: 12 },
});
