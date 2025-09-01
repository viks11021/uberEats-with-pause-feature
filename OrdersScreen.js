// import React, { useEffect, useState } from 'react';
// import {
//   View,
//   Text,
//   FlatList,
//   StyleSheet,
//   TouchableOpacity,
//   Button,
//   Alert,
//   TextInput
// } from 'react-native';
// import Modal from 'react-native-modal';
// import {
//   collection,
//   query,
//   where,
//   getDocs,
//   doc,
//   updateDoc
// } from 'firebase/firestore';
// import { db } from './firebaseConfig';
// import { useNavigation } from '@react-navigation/native';
// import { MaterialIcons } from '@expo/vector-icons';

// const OrdersScreen = () => {
//   const [orders, setOrders] = useState([]);
//   const [modalVisible, setModalVisible] = useState(false);
//   const [pickupInputCode, setPickupInputCode] = useState('');
//   const [selectedOrder, setSelectedOrder] = useState(null);
//   const navigation = useNavigation();

//   const fetchOrders = async () => {
//     const q = query(
//       collection(db, 'orders'),
//       where('driverId', '==', 'driver_001')
//     );
//     const querySnapshot = await getDocs(q);
//     const data = querySnapshot.docs.map(doc => ({
//       id: doc.id,
//       ...doc.data()
//     }));
//     setOrders(data);
//   };

//   useEffect(() => {
//     fetchOrders();
//   }, []);

//   const pauseOrder = async (orderId) => {
//     const pausedOrderRef = doc(db, 'orders', orderId);
//     await updateDoc(pausedOrderRef, {
//       status: 'paused',
//       orderPausedReason: 'Delayed by store'
//     });

//     for (const order of orders) {
//       if (
//         order.id !== orderId &&
//         order.status === 'assigned'
//       ) {
//         const otherOrderRef = doc(db, 'orders', order.id);
//         await updateDoc(otherOrderRef, {
//           status: 'in_progress'
//         });
//         break;
//       }
//     }

//     await fetchOrders();
//   };

//   const validatePickupAndOpenModal = async (order) => {
//     const firstOrder = orders[0];
//     if (
//       firstOrder.id !== order.id &&
//       firstOrder.status !== 'picked_up' &&
//       firstOrder.status !== 'paused'
//     ) {
//       Alert.alert(
//         'Pickup Not Allowed',
//         `You must pause or pick up the first order (${firstOrder.id}) before picking up this one.`
//       );
//       return;
//     }

//     setSelectedOrder(order);
//     setModalVisible(true);
//   };

//   const handlePickupConfirm = async () => {
//     if (pickupInputCode !== selectedOrder.pickupCode) {
//       Alert.alert('Incorrect Code', 'The pickup code is incorrect.');
//       return;
//     }

//     const orderRef = doc(db, 'orders', selectedOrder.id);
//     await updateDoc(orderRef, {
//       status: 'picked_up'
//     });

//     for (const o of orders) {
//       if (o.status === 'paused') {
//         const pausedRef = doc(db, 'orders', o.id);
//         await updateDoc(pausedRef, {
//           status: 'in_progress',
//           orderPausedReason: ''
//         });
//       }
//     }

//     for (const o of orders) {
//       if (o.status === 'assigned') {
//         const assignedRef = doc(db, 'orders', o.id);
//         await updateDoc(assignedRef, {
//           status: 'in_progress'
//         });
//         break;
//       }
//     }

//     setModalVisible(false);
//     setPickupInputCode('');
//     setSelectedOrder(null);
//     await fetchOrders();
//   };

//   const renderItem = ({ item }) => {
//     const firstOrder = orders[0];
//     const isFirst = item.id === firstOrder?.id;
//     const canPickup =
//       item.status === 'in_progress' &&
//       (isFirst || firstOrder?.status === 'picked_up' || firstOrder?.status === 'paused');

//     return (
//       <TouchableOpacity style={styles.card}>
//         <View style={styles.row}>
//           <MaterialIcons name="local-shipping" size={24} color="#000" />
//           <Text style={styles.orderId}>Order ID: {item.id}</Text>
//         </View>

//         <View style={styles.row}>
//           <MaterialIcons name="schedule" size={20} color="#777" />
//           <Text style={styles.status}>
//             {item.status.toUpperCase()} — ETA: {item.etaMinutes}
//           </Text>
//         </View>

//         {item.status === 'in_progress' && canPickup && (
//           <View style={styles.buttonRow}>
//             <TouchableOpacity
//               style={[styles.actionButton, { backgroundColor: '#FFC107' }]}
//               onPress={() => pauseOrder(item.id)}
//             >
//               <Text style={styles.buttonText}>Pause</Text>
//             </TouchableOpacity>
//             <TouchableOpacity
//               style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
//               onPress={() => validatePickupAndOpenModal(item)}
//             >
//               <Text style={styles.buttonText}>Pickup</Text>
//             </TouchableOpacity>
//           </View>
//         )}

//         <View style={{ marginTop: 8 }}>
//           <Button
//             title="View Route"
//             onPress={() =>
//               navigation.navigate('MapScreen', {
//                 pickupLocation: item.pickupLocation,
//                 deliveryLocation: item.deliveryLocation
//               })
//             }
//           />
//         </View>
//       </TouchableOpacity>
//     );
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.heading}>Your Orders</Text>
//       <FlatList
//         data={orders}
//         keyExtractor={item => item.id}
//         renderItem={renderItem}
//       />

//       <Modal isVisible={modalVisible}>
//         <View style={styles.modalContent}>
//           <Text style={styles.modalTitle}>
//             Enter Pickup Code for Order {selectedOrder?.id}
//           </Text>
//           <TextInput
//             placeholder="Enter 4-digit code"
//             style={styles.input}
//             keyboardType="numeric"
//             value={pickupInputCode}
//             onChangeText={setPickupInputCode}
//             maxLength={6}
//           />
//           <View style={styles.buttonRow}>
//             <TouchableOpacity
//               style={[styles.actionButton, { backgroundColor: '#ccc' }]}
//               onPress={() => {
//                 setModalVisible(false);
//                 setPickupInputCode('');
//                 setSelectedOrder(null);
//               }}
//             >
//               <Text>Cancel</Text>
//             </TouchableOpacity>
//             <TouchableOpacity
//               style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
//               onPress={handlePickupConfirm}
//             >
//               <Text style={styles.buttonText}>Confirm Pickup</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: { padding: 20, marginTop: 50 },
//   heading: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
//   card: {
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     padding: 16,
//     marginVertical: 10,
//     shadowColor: '#000',
//     shadowOpacity: 0.1,
//     shadowOffset: { width: 0, height: 2 },
//     shadowRadius: 6,
//     elevation: 3
//   },
//   row: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 6
//   },
//   orderId: {
//     fontSize: 16,
//     fontWeight: '600',
//     marginLeft: 8
//   },
//   status: {
//     fontSize: 14,
//     marginLeft: 8,
//     color: '#555'
//   },
//   buttonRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: 10
//   },
//   actionButton: {
//     flex: 1,
//     marginHorizontal: 5,
//     paddingVertical: 10,
//     borderRadius: 6,
//     alignItems: 'center'
//   },
//   buttonText: {
//     color: 'white',
//     fontWeight: 'bold'
//   },
//   modalContent: {
//     backgroundColor: 'white',
//     padding: 20,
//     borderRadius: 10
//   },
//   modalTitle: {
//     fontWeight: 'bold',
//     fontSize: 16,
//     marginBottom: 10
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#888',
//     borderRadius: 5,
//     padding: 10,
//     marginBottom: 15
//   }
// });

// export default OrdersScreen;
