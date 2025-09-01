// import React from 'react';
// import { NavigationContainer } from '@react-navigation/native';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import OrdersScreen from './OrdersScreen';
// import MapScreen from './MapScreen';

// const Stack = createNativeStackNavigator();

// export default function App() {
//   return (
//     <NavigationContainer>
//       <Stack.Navigator initialRouteName="Orders">
//         <Stack.Screen name="Orders" component={OrdersScreen} />
//         <Stack.Screen name="MapScreen" component={MapScreen} />
//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// }

// import React from 'react';
// import { NavigationContainer } from '@react-navigation/native';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';

// import IncomingOrderScreen from './IncomingOrderScreen';
// import MapScreen from './MapScreen';
// import PickupScreen from './PickupScreen'; // ✅ You imported it correctly

// const Stack = createNativeStackNavigator();

// export default function App() {
//   return (
//     <NavigationContainer>
//       <Stack.Navigator initialRouteName="IncomingOrders">
//         <Stack.Screen
//           name="IncomingOrders"
//           component={IncomingOrderScreen}
//           options={{ headerShown: false }}
//         />
//         <Stack.Screen
//           name="MapScreen"
//           component={MapScreen}
//           options={{ title: 'Order Route' }}
//         />
//         <Stack.Screen
//           name="PickupScreen"
//           component={PickupScreen}
//           options={{ headerShown: false }} // you can show header if you want
//         />
//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// }

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import IncomingOrderScreen from './IncomingOrderScreen';
import PickupScreen from './PickupScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="IncomingOrders">
        <Stack.Screen
          name="IncomingOrders"
          component={IncomingOrderScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="PickupScreen"
          component={PickupScreen}
          options={{ title: 'Pickup Orders', headerShown: true }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
