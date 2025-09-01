import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Linking, Platform } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import { collection, query, where, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from './firebaseConfig';
import * as Location from 'expo-location';
import { Audio } from 'expo-av';

const IncomingOrderScreen = () => {
  const [orders, setOrders] = useState([]);
  const [driverLocation, setDriverLocation] = useState(null);
  const navigation = useNavigation();
  const soundRef = useRef(null);
  const isAcceptingRef = useRef(false);

  // Get current location
  useEffect(() => {
    const fetchLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setDriverLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      }
    };

    fetchLocation();
  }, []);

  // Listen for assigned orders
  useEffect(() => {
    const q = query(collection(db, 'orders'), where('status', '==', 'assigned'));

    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(data);

      if (data.length > 0 && !soundRef.current && !isAcceptingRef.current) {
        const { sound } = await Audio.Sound.createAsync(
          require('./assets/alert.mp3'),
          { shouldPlay: true, isLooping: true }
        );
        soundRef.current = sound;
        await sound.playAsync();
      } else if (data.length === 0 && soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
    });

    return () => unsubscribe();
  }, []);

  // Accept orders
  const handleAccept = async () => {
    isAcceptingRef.current = true;

    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }

    const batchPromises = orders.map(order =>
      updateDoc(doc(db, 'orders', order.id), {
        status: 'in_progress',
      })
    );
    await Promise.all(batchPromises);

    // Small delay to allow Firestore to update before navigating
    setTimeout(() => {
      navigation.navigate('PickupScreen', { acceptedOrderIds: orders.map(o => o.id) });
    }, 500);
  };

  const handleCall = (phone) => {
    const link = Platform.OS === 'ios' ? `telprompt:${phone}` : `tel:${phone}`;
    Linking.openURL(link);
  };

  if (!driverLocation) {
    return <View style={styles.loading}><Text>Getting location...</Text></View>;
  }

  const combinedETA = orders.reduce((sum, o) => sum + (o.etaMinutes || 0), 0);
  const combinedDistance = (orders.length * 5.5).toFixed(1); // mock value

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          ...driverLocation,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation
      >
        {orders.map((order, index) => (
          <Marker
            key={index}
            coordinate={order.pickupLocation}
            title={order.storeName || 'Store'}
            pinColor="green"
          />
        ))}
      </MapView>

      {orders.length === 0 ? (
        <View style={styles.waiting}>
          <Text style={styles.waitingText}>Waiting for new orders...</Text>
        </View>
      ) : (
        <View style={styles.panel}>
          <View style={styles.tagsRow}>
            <View style={styles.tag}><Text style={styles.tagText}>Delivery ({orders.length})</Text></View>
            <View style={styles.tagOutline}><Text style={styles.tagOutlineText}>Exclusive</Text></View>
          </View>

          <Text style={styles.price}>${orders.reduce((sum, o) => sum + (o.tripPrice || 0), 0).toFixed(2)}</Text>
          <Text style={styles.subText}>Includes expected tip</Text>
          <Text style={styles.subText}>⏱ {combinedETA} min ({combinedDistance} mi) total</Text>

          {orders.map((order, index) => (
            <View key={index} style={styles.orderDetails}>
              <Text style={styles.storeName}>{order.storeName}</Text>
              <TouchableOpacity onPress={() => handleCall(order.storePhone)}>
                <Text style={styles.callLink}>📞 Call Store</Text>
              </TouchableOpacity>
              <Text style={styles.itemsTitle}>Items:</Text>
              {order.items?.map((item, idx) => (
                <Text key={idx} style={styles.itemText}>• {item.qty} x {item.name}</Text>
              ))}
            </View>
          ))}

          <TouchableOpacity style={styles.acceptButton} onPress={handleAccept}>
            <Text style={styles.acceptText}>Accept</Text>
          </TouchableOpacity>
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
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 5
  },
  tagsRow: { flexDirection: 'row', marginBottom: 10 },
  tag: {
    backgroundColor: 'green',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 10
  },
  tagText: { color: 'white', fontWeight: 'bold' },
  tagOutline: {
    borderColor: 'green',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12
  },
  tagOutlineText: { color: 'green', fontWeight: 'bold' },

  price: { fontSize: 30, fontWeight: 'bold' },
  subText: { color: '#777', marginVertical: 2 },

  orderDetails: { marginVertical: 10 },
  storeName: { fontWeight: 'bold', fontSize: 16 },
  callLink: { color: '#1E90FF', marginTop: 2 },
  itemsTitle: { marginTop: 5, fontWeight: 'bold' },
  itemText: { marginLeft: 10 },

  acceptButton: {
    backgroundColor: 'green',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10
  },
  acceptText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});

export default IncomingOrderScreen;