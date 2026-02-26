import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'

import DemoScreen from '../screens/DemoScreen'
import ModelScreen from '../screens/ModelScreen'

const Tab = createBottomTabNavigator()

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true
      }}
    >
      <Tab.Screen
        name='Model'
        component={ModelScreen}
        options={{
          title: 'Model',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name='download-circle-outline'
              color={color}
              size={size}
            />
          )
        }}
      />
      <Tab.Screen
        name='Demo'
        component={DemoScreen}
        options={{
          title: 'Demo',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name='phone-log'
              color={color}
              size={size}
            />
          )
        }}
      />
    </Tab.Navigator>
  )
}
