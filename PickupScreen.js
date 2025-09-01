import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Linking, Platform
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import {
  collection, query, where, onSnapshot, updateDoc, doc
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import * as Location from 'expo-location';
import polyline from '@mapbox/polyline';
import axios from 'axios';
import Constants from 'expo-constants';

const GOOGLE_MAPS_API_KEY = Constants.expoConfig?.extra?.GOOGLE_MAPS_API_KEY;
console.log('GOOGLE_MAPS_API_KEY', GOOGLE_MAPS_API_KEY)

const PickupScreen = () => {
  const [ordersMap, setOrdersMap] = useState({});
  const [activeOrderIds, setActiveOrderIds] = useState([]);
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const [pausedOrder, setPausedOrder] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);

  const navigation = useNavigation();

  // Get driver's location
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setDriverLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        });
      }
    })();
  }, []);

  // Watch orders in Firestore
  useEffect(() => {
    const q = query(collection(db, 'orders'), where('status', 'in', ['in_progress', 'paused']));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allOrders = {};
      const activeIds = [];
      let paused = null;

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        allOrders[docSnap.id] = { id: docSnap.id, ...data };

        if (data.status === 'in_progress') activeIds.push(docSnap.id);
        if (data.status === 'paused') paused = { id: docSnap.id, ...data };
      });

      setOrdersMap(allOrders);
      setActiveOrderIds(activeIds);
      setPausedOrder(paused);

      if (!currentOrderId && activeIds.length > 0) {
        setCurrentOrderId(activeIds[0]);
      }
    });

    return () => unsubscribe();
  }, [currentOrderId]);

  // Fetch Directions API polyline when location or order changes
  useEffect(() => {
    const fetchRoute = async () => {
      if (!driverLocation || !currentOrderId) return;

      const currentOrder = ordersMap[currentOrderId];
      if (!currentOrder?.pickupLocation) return;

      const origin = `${driverLocation.latitude},${driverLocation.longitude}`;
      const destination = `${currentOrder.pickupLocation.latitude},${currentOrder.pickupLocation.longitude}`;
      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${GOOGLE_MAPS_API_KEY}`;

      try {
        const response = await axios.get(url);
        const points = polyline.decode(response.data.routes[0].overview_polyline.points);
        const coords = points.map(([lat, lng]) => ({
          latitude: lat,
          longitude: lng
        }));
        setRouteCoords(coords);
      } catch (error) {
        console.error('Error fetching route:', error);
      }
    };

    fetchRoute();
  }, [driverLocation, currentOrderId, ordersMap]);

  const handleCall = (phone) => {
    const link = Platform.OS === 'ios' ? `telprompt:${phone}` : `tel:${phone}`;
    Linking.openURL(link);
  };

  const handlePause = async () => {
    const current = ordersMap[currentOrderId];
    if (!current) return;

    await updateDoc(doc(db, 'orders', current.id), { status: 'paused' });

    const idx = activeOrderIds.indexOf(current.id);
    if (idx !== -1 && idx + 1 < activeOrderIds.length) {
      setCurrentOrderId(activeOrderIds[idx + 1]);
    } else if (pausedOrder) {
      setCurrentOrderId(pausedOrder.id);
    } else {
      setCurrentOrderId(null);
    }
  };

  const handlePickup = async () => {
    const current = ordersMap[currentOrderId];
    if (!current) return;

    await updateDoc(doc(db, 'orders', current.id), { status: 'picked_up' });

    const idx = activeOrderIds.indexOf(current.id);
    if (idx !== -1 && idx + 1 < activeOrderIds.length) {
      setCurrentOrderId(activeOrderIds[idx + 1]);
    } else if (pausedOrder && pausedOrder.id !== current.id) {
      await updateDoc(doc(db, 'orders', pausedOrder.id), { status: 'in_progress' });
      setCurrentOrderId(pausedOrder.id);
    } else {
      setCurrentOrderId(null); // All done
    }
  };

  if (!driverLocation) {
    return (
      <View style={styles.loading}>
        <Text>Getting location...</Text>
      </View>
    );
  }

  const currentOrder = currentOrderId ? ordersMap[currentOrderId] : null;

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={{
          ...driverLocation,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05
        }}
        showsUserLocation
      >
        {currentOrder?.pickupLocation && (
          <Marker
            coordinate={currentOrder.pickupLocation}
            title={currentOrder.storeName || 'Store'}
            pinColor="green"
          />
        )}

        {routeCoords.length > 0 && (
          <Polyline coordinates={routeCoords} strokeWidth={5} strokeColor="blue" />
        )}
      </MapView>

      {currentOrder ? (
        <View style={styles.panel}>
          <Text style={styles.price}>Pickup Order</Text>
          <Text style={styles.storeName}>{currentOrder.storeName}</Text>
          <TouchableOpacity onPress={() => handleCall(currentOrder.storePhone)}>
            <Text style={styles.callLink}>📞 Call Store</Text>
          </TouchableOpacity>

          <Text style={styles.itemsTitle}>Items:</Text>
          {currentOrder.items?.map((item, idx) => (
            <Text key={idx} style={styles.itemText}>
              • {item.qty} x {item.name}
            </Text>
          ))}

          <View style={styles.buttonRow}>
            {pausedOrder?.id !== currentOrder.id && (
              <TouchableOpacity style={styles.pauseButton} onPress={handlePause}>
                <Text style={styles.pauseText}>Pause</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.pickupButton} onPress={handlePickup}>
              <Text style={styles.pickupText}>Pickup</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.waiting}>
          <Text style={styles.waitingText}>All pickups completed</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  waiting: {
    position: 'absolute', bottom: 50, left: 0, right: 0, alignItems: 'center'
  },
  waitingText: { fontSize: 18, color: '#999' },
  panel: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#fff', padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20, elevation: 5
  },
  price: { fontSize: 24, fontWeight: 'bold', marginBottom: 5 },
  storeName: { fontWeight: 'bold', fontSize: 18, marginVertical: 5 },
  callLink: { color: '#1E90FF', marginTop: 2 },
  itemsTitle: { marginTop: 10, fontWeight: 'bold' },
  itemText: { marginLeft: 10 },
  buttonRow: { flexDirection: 'row', marginTop: 15, justifyContent: 'space-between' },
  pauseButton: {
    backgroundColor: '#999', padding: 12, borderRadius: 10, flex: 1, marginRight: 10, alignItems: 'center'
  },
  pickupButton: {
    backgroundColor: 'green', padding: 12, borderRadius: 10, flex: 1, alignItems: 'center'
  },
  pauseText: { color: 'white', fontWeight: 'bold' },
  pickupText: { color: 'white', fontWeight: 'bold' }
});

export default PickupScreen;