import { Tabs } from 'expo-router';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React from 'react';

export default function RootLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Map',
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="map" color={color} size={size} />
        }}
      />
      <Tabs.Screen
        name="list"
        options={{
          title: 'List',
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="clipboard-list" color={color} size={size} />
        }}
      />
      <Tabs.Screen
        name="report"
        options={{
          title: 'Report sighting',
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="new-box" color={color} size={size} />
        }}
      />
    </Tabs>
  )
}
