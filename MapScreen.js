// MapScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Linking,
  ScrollView
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useRoute } from '@react-navigation/native';
import * as Location from 'expo-location';

const MapScreen = () => {
  const route = useRoute();
  const {
    pickupLocation,
    deliveryLocation,
    storeName,
    storePhone,
    items,
    etaMinutes,
    tripPrice
  } = route.params;

  const [driverLocation, setDriverLocation] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setDriverLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });
    })();
  }, []);

  if (!driverLocation) {
    return (
      <View style={styles.centered}><Text>Loading map...</Text></View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: pickupLocation.latitude,
          longitude: pickupLocation.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02
        }}>
        <Marker coordinate={driverLocation} title="Driver" pinColor="blue" />
        <Marker coordinate={pickupLocation} title="Pickup" pinColor="green" />
        <Marker coordinate={deliveryLocation} title="Delivery" pinColor="red" />

        <Polyline
          coordinates={[driverLocation, pickupLocation, deliveryLocation]}
          strokeColor="#1E90FF"
          strokeWidth={3}
        />
      </MapView>

      {/* Floating Card */}
      <View style={styles.card}>
        <Text style={styles.price}>${tripPrice?.toFixed(2)}</Text>
        <Text style={styles.meta}>Includes expected tip</Text>
        <Text style={styles.eta}>ETA: {etaMinutes}</Text>

        <Text style={styles.section}>Pickup From:</Text>
        <Text style={styles.detail}>{storeName}</Text>
        <TouchableOpacity onPress={() => Linking.openURL(`tel:${storePhone}`)}>
          <Text style={styles.link}>Call Store: {storePhone}</Text>
        </TouchableOpacity>

        <Text style={styles.section}>Items:</Text>
        {items?.map((item, index) => (
          <Text key={index} style={styles.itemText}>• {item.qty} x {item.name}</Text>
        ))}

        <TouchableOpacity style={styles.acceptBtn}>
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Pickup Order</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  card: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000'
  },
  meta: {
    color: '#666',
    marginBottom: 4
  },
  eta: {
    fontSize: 14,
    marginBottom: 10
  },
  section: {
    fontWeight: 'bold',
    marginTop: 10
  },
  detail: {
    fontSize: 16,
    marginBottom: 6
  },
  link: {
    color: '#1E90FF',
    marginBottom: 10
  },
  itemText: {
    marginLeft: 6,
    fontSize: 14
  },
  acceptBtn: {
    marginTop: 16,
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center'
  }
});

export default MapScreen;
