import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from "react-native";
import React, { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { format } from "date-fns";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UFOSighting } from "./map";
import { reload } from "expo-router/build/global-state/routing";
import eventEmitter from "../eventEmitter";

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
      if (JSON.stringify(sightings) !== JSON.stringify(combinedSightings)) {
        setSightings(combinedSightings);
      }

    } catch (error) {
      console.error("Error loading data:", error);
    }
  }

  useEffect(() => {
    loadData();

    eventEmitter.on('newSighting', loadData);

    return () => {
      eventEmitter.off('newSighting', loadData); // Cleanup
    };
  }, []);

  const router = useRouter();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/")}
      >
        <Text style={styles.buttonText}>Back to Home</Text>
      </TouchableOpacity>
      <FlatList
        data={sightings}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.itemContainer}
            onPress={() => router.push(`/details/${item.id}`)}
          >
            <Image source={{ uri: item.picture }} style={styles.image} />
            <View style={styles.textContainer}>
              <Text style={styles.idText}>ID: {item.id}</Text>
              <Text
                style={[
                  styles.statusText,
                  { color: item.status === "confirmed" ? "green" : "red" },
                ]}
              >
                {item.status}
              </Text>
              <Text style={styles.dateText}>
                {format(new Date(item.dateTime), "dd MMM yyyy, hh:mm a")}
              </Text>
              <Text style={styles.description} numberOfLines={2}>
                {item.description}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  itemContainer: {
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    flexDirection: "row",
    alignItems: "center",
  },
  button: {
    marginTop: 20,
    marginBottom: 20,
    padding: 12,
    backgroundColor: "#0066cc",
    borderRadius: 8,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 16,
    resizeMode: "contain",
  },
  textContainer: {
    flex: 1,
  },
  idText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  dateText: {
    fontSize: 12,
    color: "#555",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#333",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
