import { View, Text, FlatList, TouchableOpacity, Image } from "react-native";
import React, { useState, useEffect } from "react";
import { UFOSighting } from ".";
import { usePathname, useRouter } from "expo-router";
import { Path } from "leaflet";
import { navigate } from "expo-router/build/global-state/routing";

export default function List() {

  const [sightings, setSightings] = useState<UFOSighting[]>();

  async function loadData() {
    const response = await fetch("https://sampleapis.assimilate.be/ufo/sightings")
    const sightings : UFOSighting[] = await response.json();
    console.log(sightings);

    setSightings(sightings);
  }

  type ItemProps = {title: string};

  const Item = ({title}: ItemProps) => (
    <View>
      <Text>{title}</Text>
    </View>
  );

  useEffect(() => {
    loadData();
  }, []);

  const router = useRouter();

    return (
        <View style={{flex: 1}}>
            <FlatList
                data={sightings}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => router.push(`/details/${item.id}`)}>
                        <Text>{item.id}</Text>
                        <Image source={{uri: item.picture}}
                            style={{width: 400, height: 400}} />
                        <Text>{item.status}</Text>
                      <Text>{item.dateTime.toString()}</Text>
                      <Text numberOfLines={2}>{item.description}</Text>
                    </TouchableOpacity>
                  )}
            />
        </View> 
    )

}