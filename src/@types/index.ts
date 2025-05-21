import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

export type RootStackParamList = {
  HomeScreen: undefined;
  NewsScreen: { rssUrl: string };
  VNDGoldScreen: undefined;
};