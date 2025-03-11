import { MapContainer, Marker, Popup, SVGOverlay, TileLayer, useMap, useMapEvents } from "react-leaflet";
import 'leaflet/dist/leaflet.css';
import L, { LatLngTuple } from "leaflet";
import { View, Text, TouchableOpacity } from "react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import React from "react";

const position: LatLngTuple = [51.505, -0.09];

interface LocationHandlerProps {
  addMarker: (lat: number, lng: number) => void;
}
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
    const response = await fetch("https://sampleapis.assimilate.be/ufo/sightings")
    const sightings: UFOSighting[] = await response.json();
    console.log(sightings);

    setSightings(sightings);
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

  const addUFOSighting = (lat: number, lng: number) => {
    setSightings([
      ...(sightings ?? []),
      {
        id: (sightings?.length ?? 0) + 1,
        witnessName: "Anonymous",
        location: { latitude: lat, longitude: lng },
        description: "A mysterious sighting",
        picture: "",
        status: Status.Confirmed,
        dateTime: new Date(),
        witnessContact: "Unknown",
      }
    ]);
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

export interface UFOSighting {
  id: number;
  witnessName: string;
  location: Location;
  description: string;
  picture: string;
  status: Status;
  dateTime: Date;
  witnessContact: string;
}

export interface Location {
  latitude: number;
  longitude: number;
}

export enum Status {
  Confirmed = "confirmed",
  Unconfirmed = "unconfirmed",
}