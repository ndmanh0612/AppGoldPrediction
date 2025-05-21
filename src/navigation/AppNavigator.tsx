import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { Image, StyleSheet } from 'react-native';
import HomeScreen from '../screens/home/HomeScreen';
import NewsScreen from '../screens/stack/NewsScreen';
import VNDGoldScreen from '../screens/stack/VNDGoldScreen';
import Calculator from '../screens/stack/CurrencyConverterScreen';

export type RootStackParamList = {
  HomeScreen: undefined;
  NewsScreen: { rssUrl: string };
  VNDGoldScreen: undefined;
  Calculator: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => (
  <Stack.Navigator initialRouteName="HomeScreen">
    <Stack.Screen
      name="HomeScreen"
      component={HomeScreen}
      options={{
        headerStyle: {
          backgroundColor: '#0077A2',
        },
        headerTitle: () => (
          <Image
            source={require('../../assets/icon/KITVN-logo.png')} // Đường dẫn đến logo
            style={styles.logo}
          />
        ),
      }}
    />
    
    <Stack.Screen
      name="NewsScreen"
      component={NewsScreen}
      options={{
        title: 'News',
        headerStyle: {
          backgroundColor: '#0077A2',
        },
        headerTintColor: '#000',
        headerTitleStyle: {
          fontSize: 30, // Increase the font size for title
          fontWeight: 'bold'},
        headerLeft: () => null,
      }}
    />
    
    <Stack.Screen
      name="VNDGoldScreen"
      component={VNDGoldScreen}
      options={{
        title: 'VNDGold',
        headerStyle: {
          backgroundColor: '#0077A2',
        },
        headerTintColor: '#000',
        headerTitleStyle: {
          fontSize: 30, // Increase the font size for title
          fontWeight: 'bold'},
        headerLeft: () => null,
      }}
    />
    
    <Stack.Screen
      name="Calculator"
      component={Calculator}
      options={{
        title: 'Đổi Tỷ Giá',
        headerStyle: {
          backgroundColor: '#0077A2',
        },
        headerTintColor: '#000',
        headerTitleStyle: {
          fontSize: 30, // Increase the font size for title
          fontWeight: 'bold'},
        headerLeft: () => null,
      }}
    />
  </Stack.Navigator>
);

const styles = StyleSheet.create({
  logo: {
    width: 350, // Width of the logo
    height: 100, // Height of the logo
    resizeMode: 'contain', // Ensures the logo maintains its aspect ratio
  },
});

export default AppNavigator;
