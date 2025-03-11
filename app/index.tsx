import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import React, { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons"; // Import MaterialCommunityIcons
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UFOSighting } from "./(tabs)/map";

const { width } = Dimensions.get("window"); // Get screen width

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
            <View style={styles.imageButtonsContainer}>
                <TouchableOpacity style={styles.imageButton} onPress={() => router.push("./map")}>
                    <MaterialCommunityIcons name="map" size={50} color="#007AFF" />
                    <Text style={styles.imageButtonText}>Map</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.imageButton} onPress={() => router.push("./list")}>
                    <MaterialCommunityIcons name="clipboard-list" size={50} color="#007AFF" />
                    <Text style={styles.imageButtonText}>List</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.imageButton} onPress={() => router.push("./report")}>
                    <MaterialCommunityIcons name="new-box" size={50} color="#007AFF" />
                    <Text style={styles.imageButtonText}>Report</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        justifyContent: "center",
        flex: 1,
        backgroundColor: "#fff",
    },
    imageButtonsContainer: {
        flexDirection: "row", // Align buttons horizontally
        justifyContent: "space-between", // Distribute the buttons evenly
        marginBottom: 20,
        paddingHorizontal: 10, // Padding on the sides
    },
    imageButton: {
        alignItems: "center",
        backgroundColor: "#f0f0f0", // Light background color for buttons
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#ddd",
        flex: 0.3, // Make each button take up 30% of the width
        justifyContent: "center", // Vertically center the content
    },
    imageButtonText: {
        marginTop: 8,
        color: "#007AFF", // Set text color
        fontWeight: "600", // Make the text bold
        textAlign: "center",
    },
});
