import { MapContainer, Marker, Popup, SVGOverlay, TileLayer, useMap, useMapEvents } from "react-leaflet";
import 'leaflet/dist/leaflet.css';
import L, { LatLngTuple } from "leaflet";
import { View, Text, TouchableOpacity } from "react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import React from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import eventEmitter from "../eventEmitter";
import { LocationHandlerProps, Status, UFOSighting } from "../types/types";

const position: LatLngTuple = [51.505, -0.09];

const LocationHandler = ({ addMarker }: LocationHandlerProps) => {
  const map = useMapEvents({
    dragend: () => {
      console.log(map.getCenter());
    },
    click: (e) => {
      addMarker(e.latlng.lat, e.latlng.lng);
    }
  });

  return null;
}

export default function Map() {

  const [sightings, setSightings] = useState<UFOSighting[]>();

  async function loadData() {
    try {
      const response = await fetch("https://sampleapis.assimilate.be/ufo/sightings");
      const apiSightings: UFOSighting[] = await response.json();

      const existingSightingsJSON = await AsyncStorage.getItem('ufoReports');
      let localSightings: UFOSighting[] = [];

      if (existingSightingsJSON) {
        localSightings = JSON.parse(existingSightingsJSON);
      }

      const combinedSightings = [...apiSightings, ...localSightings];

      console.log("Combined sightings:", combinedSightings);

      setSightings(combinedSightings);

    } catch (error) {
      console.error("Error loading data:", error);
    }
  }


  const router = useRouter();

  useEffect(() => {
    loadData();
  }, []);

  const iconX = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/similonap/public_icons/refs/heads/main/location-pin.png',
    iconSize: [48, 48],
    popupAnchor: [-3, 0],
  });

  const addUFOSighting = async (lat: number, lng: number) => {
    try {
      // Get existing sightings from AsyncStorage
      const existingSightingsJSON = await AsyncStorage.getItem('ufoReports');
      const existingSightings = existingSightingsJSON ? JSON.parse(existingSightingsJSON) : [];

      // Generate a unique ID
      const maxExistingId = existingSightings.length > 0
        ? Math.max(...existingSightings.map((s: UFOSighting) => s.id))
        : 10;

      const newId = maxExistingId + 1;

      const newSighting: UFOSighting = {
        id: newId,
        witnessName: "Anonymous",
        location: { latitude: lat, longitude: lng },
        description: "A mysterious sighting",
        picture: "",
        status: Status.Unconfirmed,
        dateTime: new Date(),
        witnessContact: "Unknown",
      };

      // Add the new sighting to the list
      const updatedSightings = [...existingSightings, newSighting];

      // Save the updated list back to AsyncStorage
      await AsyncStorage.setItem('ufoReports', JSON.stringify(updatedSightings));

      setSightings((prevSightings) => prevSightings ? [...prevSightings, newSighting] : [newSighting]);

      eventEmitter.emit('newSighting');

      console.log("Sighting added successfully:", newSighting);
    } catch (error) {
      console.error("Error adding UFO sighting:", error);
    }
  };





  return (
    <MapContainer
      center={{ lat: 51.505, lng: -0.09 }}
      zoom={13}
      scrollWheelZoom={false}
      style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
      attributionControl={false}
    >

      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationHandler addMarker={(lat, lng) => addUFOSighting(lat, lng)} />
      {sightings && sightings.map((sighting, index) => (
        <Marker key={index} position={[sighting.location.latitude, sighting.location.longitude]} icon={iconX}>
          <Popup >
            <View style={{ backgroundColor: 'white', padding: 10, width: 250 }}>
              <Text>Sighting identifcation number: {sighting.id}</Text>
              <Text>Sighting location latitude: {sighting.location.latitude}</Text>
              <Text>Sighting location longitude: {sighting.location.longitude}</Text>
              <TouchableOpacity onPress={() => router.push(`/details/${sighting.id}`)}>
                <Text style={{ color: 'blue', textDecorationLine: 'underline' }}>Link naar detailpagina</Text>
              </TouchableOpacity>
            </View>
          </Popup>
        </Marker>
      ))}

    </MapContainer>
  );
}