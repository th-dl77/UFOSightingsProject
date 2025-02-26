import { View, Text, FlatList, TouchableOpacity, Image } from "react-native";
import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "expo-router";
import { useLocalSearchParams } from "expo-router";
import { Path } from "leaflet";
import { UFOSighting } from "..";

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
        <View style={{flex: 1}}>
            <Text>{sighting?.id}</Text>
            <Image source={{uri: sighting?.picture}}
                style={{width: 400, height: 400}} />
            <Text>{sighting?.status}</Text>
            <Text>{sighting?.dateTime.toString()}</Text>
            <Text numberOfLines={2}>{sighting?.description}</Text>
        </View> 
    )

}