import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const BottomNavBar = ({ onCenterPress }: { onCenterPress: () => void }) => {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.item}>
        <Icon name="home" size={24} color="#fff" />
        <Text style={styles.label}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={onCenterPress} style={styles.centerButton}>
        <Icon name="chevron-up" size={30} color="#fff" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.item}
        onPress={() => navigation.navigate('NewsScreen')}
      >
        <Icon name="newspaper" size={24} color="#fff" />
        <Text style={styles.label}>News</Text>
      </TouchableOpacity>
    </View>
  );
};

export default BottomNavBar;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 80,
    backgroundColor: '#0077A2',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 10,
    paddingHorizontal: 10,
  },
  item: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 12,
    color: '#fff',
    marginTop: 2,
  },
  centerButton: {
    backgroundColor: '#0099cc',
    width: 50,
    height: 50,
    borderRadius: 25,
    marginTop: -15,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
});
