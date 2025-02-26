import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from "react-native";
import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "expo-router";
import { useLocalSearchParams } from "expo-router";
import { Path } from "leaflet";
import { UFOSighting } from "..";
import { format } from 'date-fns';

export default function Details() {

    const { id } = useLocalSearchParams();


      const [sighting, setSighting] = useState<UFOSighting>();
    
      async function loadData() {
        const response = await fetch(`https://sampleapis.assimilate.be/ufo/sightings/${id}`);
        const sighting : UFOSighting = await response.json();
        console.log(sighting);
    
        setSighting(sighting);
      }
    
      useEffect(() => {
        loadData();
      }, []);




    return (
      <View style={styles.container}>
      <Text style={styles.idText}>{sighting?.id}</Text>
      <Image source={{ uri: sighting?.picture }} style={styles.image} />
            <Text
              style={[
                styles.statusText,
                { color: sighting?.status === 'confirmed' ? 'green' : 'red' }
              ]}
            >
              {sighting?.status}
            </Text>
            <Text style={styles.dateText}>
              {format(new Date((sighting as any).dateTime), 'dd MMM yyyy, hh:mm a')}
            </Text>
      <Text style={styles.description} numberOfLines={2}>
        {sighting?.description}
      </Text>
      <Text style={styles.witnessName}>{sighting?.witnessName}</Text>
      <Text style={styles.witnessContact}>{sighting?.witnessContact}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
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
    marginBottom: 8,
  },
  witnessName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
  },
  witnessContact: {
    fontSize: 14,
    color: '#555',
  },
});