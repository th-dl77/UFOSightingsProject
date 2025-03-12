import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, StyleSheet, Alert } from "react-native";
import React, { useState, useEffect } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import AsyncStorage from '@react-native-async-storage/async-storage';
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css";
import { UFOSighting } from "../types/types";

export default function Report() {
    //get lat and lng from the query parameters from url
    const { location } = useLocalSearchParams();
    //state for form data
    const [formData, setFormData] = useState({
        description: "",
        location: {
            latitude: "",
            longitude: "",
        },
        witnessName: "",
        witnessContact: "",
        picture: null as string | null,
    });

    const [sightingDate, setSightingDate] = useState<Date | null>(new Date());
    //state for the highest ID value
    const [highestId, setHighestId] = useState<number>(0);

    useEffect(() => {
        if (location) {
            try {
                const locationString = Array.isArray(location) ? location[0] : location;
                const parsedLocation = JSON.parse(locationString); // Parse the JSON string
                setFormData((prev) => ({
                    ...prev,
                    location: parsedLocation, // Set location as an object
                }));
            } catch (error) {
                console.error("Error parsing location:", error);
            }
        }

        const loadExistingReports = async () => {
            // Fetch reports from AsyncStorage (local storage)
            const existingReportsJSON = await AsyncStorage.getItem('ufoReports');
            const existingReports = existingReportsJSON ? JSON.parse(existingReportsJSON) : [];

            // Fetch reports from the API (simulate API fetch here)
            const apiReports = await fetchReportsFromAPI();

            // Combine local + API reports
            const combinedReports = [...existingReports, ...apiReports];

            // Find the highest ID value from the combined reports
            if (combinedReports.length > 0) {
                const maxId = Math.max(...combinedReports.map((report: UFOSighting) => report.id), 0);
                setHighestId(maxId);
            }
        };

        loadExistingReports();
    }, [location]);



    //simulate fetching reports from an API (replace with actual API call)
    const fetchReportsFromAPI = async () => {
        const response = await fetch("https://sampleapis.assimilate.be/ufo/sightings");
        const sightings: UFOSighting[] = await response.json();
        return sightings;
    };

    async function pickImage() {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setFormData({ ...formData, picture: result.assets[0].uri });
        }
    }

    async function takePhoto() {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();

        if (status !== "granted") {
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setFormData({ ...formData, picture: result.assets[0].uri });
        }
    }

    async function getCurrentLocation() {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                return;
            }

            const location = await Location.getCurrentPositionAsync({});
            setFormData({
                ...formData,
                location: {
                    latitude: location.coords.latitude.toString(),
                    longitude: location.coords.longitude.toString(),
                },
            });
        } catch (err) {
            //todo: handle error
        }
    }

    async function submitReport() {
        try {
            if (!formData.description) {
                throw new Error("Please provide a description");
            }

            if (!formData.location.latitude || !formData.location.longitude) {
                throw new Error("Please provide location information");
            }

            //generate a unique ID for the new report, starting from the highest ID + 1
            const newId = highestId + 1;

            const reportData = {
                id: newId,
                ...formData,
                dateTime: sightingDate,
                status: "unconfirmed",
            };

            //get existing reports from storage
            const existingReportsJSON = await AsyncStorage.getItem('ufoReports');
            const existingReports = existingReportsJSON ? JSON.parse(existingReportsJSON) : [];

            //add the new report to the list
            const updatedReports = [...existingReports, reportData];

            //save the updated list back to AsyncStorage
            await AsyncStorage.setItem('ufoReports', JSON.stringify(updatedReports));

            //update the highest ID state
            setHighestId(newId);

            //navigate to the report details page
            router.push(`/details/${newId}`);
        } catch (err) {
            //todo: handle error
            alert(err);
        }
    }

    const CustomDateInput = React.forwardRef<View, { value?: string; onClick?: () => void }>(
        ({ value, onClick }, ref) => (
            <TouchableOpacity onPress={onClick} style={styles.dateInput} ref={ref as any}>
                <Text style={styles.dateText}>{value || "Select a date"}</Text>
            </TouchableOpacity>
        )
    );

    const today = new Date();

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollContainer}>
                <Text style={styles.headerText}>Report UFO Sighting</Text>

                {formData.picture ? (
                    <View style={styles.imagePreviewContainer}>
                        <Image
                            source={{ uri: formData.picture }}
                            style={styles.previewImage}
                        />
                        <TouchableOpacity
                            style={styles.changeImageBtn}
                            onPress={() => setFormData({ ...formData, picture: null })}
                        >
                            <Text style={styles.changeImageText}>Change Image</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.imageButtonsContainer}>
                        <TouchableOpacity style={styles.imageButton} onPress={takePhoto}>
                            <Ionicons name="camera" size={30} color="#007AFF" />
                            <Text style={styles.imageButtonText}>Take Photo</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
                            <Ionicons name="images" size={30} color="#007AFF" />
                            <Text style={styles.imageButtonText}>Choose from Gallery</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <Text style={styles.labelText}>Description:</Text>
                <TextInput
                    style={styles.input}
                    multiline
                    numberOfLines={4}
                    placeholder="Description of new sighting"
                    value={formData.description}
                    onChangeText={(text) => setFormData({ ...formData, description: text })}
                />

                <View style={styles.datePickerContainer}>
                    <Text style={styles.labelText}>Date:</Text>
                    <View style={styles.datePickerWrapper}>
                        <DatePicker
                            wrapperClassName="datePickerContainer"
                            selected={sightingDate}
                            popperPlacement="bottom-start"
                            required
                            maxDate={today}
                            onChange={(date) => setSightingDate(date)}
                            dateFormat="MMMM d, yyyy"
                            customInput={<CustomDateInput />}
                        />
                    </View>
                </View>

                <View style={styles.locationContainer}>
                    <Text style={styles.labelText}>Location:</Text>
                </View>

                <View style={styles.coordsContainer}>
                    <View style={styles.coordField}>
                        <Text style={styles.coordLabel}>Latitude:</Text>
                        <TextInput
                            style={styles.coordInput}
                            placeholder="Location Latitude"
                            keyboardType="numeric"
                            value={formData.location.latitude}
                            onChangeText={(text) => {
                                const numericText = text.replace(/[^0-9.-]/g, "");
                                if (numericText.split(".").length <= 2) {
                                    setFormData({
                                        ...formData,
                                        location: { ...formData.location, latitude: numericText },
                                    });
                                }
                            }}
                        />
                    </View>
                    <View style={styles.coordField}>
                        <Text style={styles.coordLabel}>Longitude:</Text>
                        <TextInput
                            style={styles.coordInput}
                            placeholder="Location Longitude"
                            keyboardType="numeric"
                            value={formData.location.longitude}
                            onChangeText={(text) => {
                                const numericText = text.replace(/[^0-9.-]/g, "");
                                if (numericText.split(".").length <= 2) {
                                    setFormData({
                                        ...formData,
                                        location: { ...formData.location, longitude: numericText },
                                    });
                                }
                            }}
                        />
                    </View>
                </View>
                <View>
                    <TouchableOpacity style={styles.locationBtn} onPress={getCurrentLocation}>
                        <Ionicons name="location" size={20} color="#fff" />
                        <Text style={styles.locationBtnText}>Use Current Location</Text>
                    </TouchableOpacity>
                </View>
                <Text style={styles.labelText}>Your Name:</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter your name"
                    value={formData.witnessName}
                    onChangeText={(text) => setFormData({ ...formData, witnessName: text })}
                />

                <Text style={styles.labelText}>Contact Information:</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    value={formData.witnessContact}
                    onChangeText={(text) => setFormData({ ...formData, witnessContact: text })}
                />

                <TouchableOpacity
                    style={[styles.submitBtn, styles.submitBtnDisabled]}
                    onPress={submitReport}
                >
                    <Text style={styles.submitBtnText}>Submit Report</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    datePickerContainer: {
        marginBottom: 16,
        zIndex: 9999,
    },
    dateInput: {
        padding: 12,
        fontSize: 16,
        backgroundColor: "#fff", // Match other input fields
        textAlign: "left",
    },
    dateText: {
        fontSize: 16,
        color: "#333",
    },
    datePickerWrapper: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        padding: 10,
        backgroundColor: "#fff",
        justifyContent: "center",
    },
    scrollContainer: {
        flex: 1,
        padding: 16,
    },
    headerText: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center",
    },
    imagePreviewContainer: {
        alignItems: "center",
        marginBottom: 20,
    },
    previewImage: {
        width: 250,
        height: 250,
        borderRadius: 8,
        marginBottom: 8,
    },
    changeImageBtn: {
        backgroundColor: "#f0f0f0",
        padding: 8,
        borderRadius: 4,
    },
    changeImageText: {
        color: "#007AFF",
        fontWeight: "600",
    },
    imageButtonsContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginBottom: 20,
    },
    imageButton: {
        alignItems: "center",
        backgroundColor: "#f8f8f8",
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#ddd",
        flex: 0.45,
    },
    imageButtonText: {
        marginTop: 8,
        color: "#007AFF",
        fontWeight: "500",
        textAlign: "center",
    },
    labelText: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 8,
        color: "#333",
    },
    input: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        fontSize: 16,
    },
    locationContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    locationBtn: {
        flexDirection: "row",
        width: 200,
        marginBottom: 20,
        backgroundColor: "#007AFF",
        borderRadius: 8,
        padding: 8,
        alignItems: "center",
    },
    locationBtnText: {
        color: "#fff",
        marginLeft: 8,
        fontWeight: "600",
    },
    coordsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 16,
    },
    coordField: {
        flex: 1,
        marginRight: 8,
    },
    coordLabel: {
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 4,
        color: "#555",
    },
    coordInput: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        padding: 10,
        fontSize: 14,
    },
    submitBtn: {
        backgroundColor: "#4CAF50",
        padding: 16,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 8,
        marginBottom: 30,
    },
    submitBtnDisabled: {
        backgroundColor: "#A5D6A7",
    },
    submitBtnText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
});
