import { Text, View, FlatList, StyleSheet } from "react-native";
import { useEffect, useState } from "react";

export default function Index() {
  const [sightings, setSightings] = useState<UFOSighting[]>();
  async function loadData() {
    const response = await fetch("https://sampleapis.assimilate.be/ufo/sightings")
    const sightings : UFOSighting[] = await response.json();
    console.log(sightings);

    setSightings(sightings);
  }

  useEffect(() => {
    loadData();
  }, []);

  const styles = StyleSheet.create({
    container: {flex: 1, flexDirection: "column"}
  });

  return (
    <View style={styles.container}>
    <FlatList
        data={sightings}
        renderItem={({item}) =>  <View style={{flexDirection: "row", alignItems: "center"}}>
        <Text style={{flex: 1}}>{item.id}</Text>
    </View>}
        keyExtractor={item => item.id.toString()}
    />
</View>
  );
}

export interface UFOSighting {
  id:             number;
  witnessName:    string;
  location:       Location;
  description:    string;
  picture:        string;
  status:         Status;
  dateTime:       Date;
  witnessContact: string;
}

export interface Location {
  latitude:  number;
  longitude: number;
}

export enum Status {
  Confirmed = "confirmed",
  Unconfirmed = "unconfirmed",
}
