import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from "react-native";
import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "expo-router";
import { useLocalSearchParams } from "expo-router";
import { UFOSighting } from "../(tabs)/map";
import { format } from "date-fns";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Details() {
  const { id } = useLocalSearchParams();
  const [sighting, setSighting] = useState<UFOSighting | undefined>();

  async function loadData() {
    try {
      //check local storage
      const localData = await AsyncStorage.getItem("ufoReports");
      const localSightings: UFOSighting[] = localData ? JSON.parse(localData) : [];

      //find sighting in local storage
      const foundLocalSighting = localSightings.find((s) => s.id.toString() === id);

      if (foundLocalSighting) {
        setSighting(foundLocalSighting);
      } else {
        //fetch from API if not found in local storage
        const response = await fetch(`https://sampleapis.assimilate.be/ufo/sightings/${id}`);
        const apiSighting: UFOSighting = await response.json();
        setSighting(apiSighting);
      }
    } catch (error) {
      console.error("Error loading sighting data:", error);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const formattedDate = sighting?.dateTime
    ? format(new Date(sighting.dateTime), "dd MMM yyyy, hh:mm a")
    : "No Date Available";

  return (
    <View style={styles.container}>
      <Text style={styles.idText}>{sighting?.id}</Text>
      <Image source={{ uri: sighting?.picture }} style={styles.image} />
      <Text
        style={[
          styles.statusText,
          { color: sighting?.status === "confirmed" ? "green" : "red" },
        ]}
      >
        {sighting?.status}
      </Text>
      <Text style={styles.description} numberOfLines={2}>
        {sighting?.description}
      </Text>
      <Text style={styles.dateText}>{formattedDate}</Text>
      <Text style={[{ fontSize: 18, fontWeight: "bold" }]}>Location of sighting:</Text>
      <Text style={styles.description}>Longitude: {sighting?.location.longitude}</Text>
      <Text style={styles.description}>Latitude: {sighting?.location.latitude}</Text>
      <Text style={[{ fontSize: 18, fontWeight: "bold" }]}>Sighting witness:</Text>
      <Text style={styles.witnessName}>{sighting?.witnessName}</Text>
      <Text style={styles.witnessContact}>{sighting?.witnessContact}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  idText: {
    fontSize: 18,
    fontWeight: "bold",
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
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: "#444",
    textAlign: "center",
    marginBottom: 8,
  },
  witnessName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 4,
  },
  witnessContact: {
    fontSize: 14,
    color: "#555",
  },
});
