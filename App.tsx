import 'react-native-url-polyfill/auto';
import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

import '@tensorflow/tfjs-react-native';            // TFJS React Native adapter :contentReference[oaicite:2]{index=2}
import * as tf from '@tensorflow/tfjs';

import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  const [tfReady, setTfReady] = useState(false);

  useEffect(() => {
    (async () => {
      await tf.ready();             // Đợi init cho tfjs-react-native :contentReference[oaicite:3]{index=3}
      await tf.setBackend('rn-webgl'); // Chọn WebGL backend để tận dụng GPU :contentReference[oaicite:4]{index=4}
      setTfReady(true);
    })();
  }, []);

  if (!tfReady) {
    return (
      <GestureHandlerRootView style={styles.loader}>
        <ActivityIndicator size="large" />
      </GestureHandlerRootView>
    );
  }
  return (
    <GestureHandlerRootView style={styles.root}>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});