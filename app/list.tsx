import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from "react-native";
import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "expo-router";
import { Path } from "leaflet";
import { navigate } from "expo-router/build/global-state/routing";
import { format } from 'date-fns';
import { UFOSighting } from ".";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function List() {

  const [sightings, setSightings] = useState<UFOSighting[]>();

  async function loadData() {
    try {
      const response = await fetch("https://sampleapis.assimilate.be/ufo/sightings");
      const sightings: UFOSighting[] = await response.json();

      const localStorageData = await AsyncStorage.getItem('ufoReports');
      let localSightings: UFOSighting[] = [];

      if (localStorageData) {
        localSightings = JSON.parse(localStorageData);
      }

      const combinedSightings = [...sightings, ...localSightings];

      console.log("Combined sightings:", combinedSightings);
      setSightings(combinedSightings);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const router = useRouter();

  return (
    <View style={styles.container}>
      <FlatList
        data={sightings}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.itemContainer}
            onPress={() => router.push(`/details/${item.id}`)}
          >
            <Text style={styles.idText}>{item.id}</Text>
            <Image source={{ uri: item.picture }} style={styles.image} />
            <Text
              style={[
                styles.statusText,
                { color: item.status === 'confirmed' ? 'green' : 'red' }
              ]}
            >
              {item.status}
            </Text>
            <Text style={styles.dateText}>
              {format(new Date(item.dateTime), 'dd MMM yyyy, hh:mm a')}
            </Text>
            <Text style={styles.description} numberOfLines={2}>
              {item.description}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  itemContainer: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  idText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  image: {
    width: 400,
    height: 400,
    borderRadius: 8,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#444',
    textAlign: 'center',
  },
});