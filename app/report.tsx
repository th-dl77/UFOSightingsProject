import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, StyleSheet, Alert } from "react-native";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import AsyncStorage from '@react-native-async-storage/async-storage';

type Status = "pending" | "verified" | "rejected";

export interface UFOSighting {
    id: number;
    witnessName: string;
    location: Location;
    description: string;
    picture: string | null;
    status: Status;
    witnessContact: string;
}

export default function Report() {
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

    async function pickImage() {
        //open image picker
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
        // request camera permissions
        const { status } = await ImagePicker.requestCameraPermissionsAsync();

        if (status !== "granted") {
            //todo: give error that indicates no permission
            return;
        }

        // launch camera
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
        //request current location from user
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                //todo: give error that indicates no permission
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
        } catch (err: any) {
            //todo: give error
        }
    }

    async function submitReport() {
        // todo: implement actual saving to asyncstorage
    }

    return (
        <View>
            <ScrollView>
                <Text>Report UFO Sighting</Text>

                {formData.picture ? (
                    <View>
                        <Image
                            source={{ uri: formData.picture }}
                        />
                        <TouchableOpacity
                            onPress={() => setFormData({ ...formData, picture: null })}
                        >
                            <Text>Change Image</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View>
                        <TouchableOpacity onPress={takePhoto}>
                            <Ionicons name="camera" size={30} color="#007AFF" />
                            <Text>Take Photo</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={pickImage}>
                            <Ionicons name="images" size={30} color="#007AFF" />
                            <Text>Choose from Gallery</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <Text>Description:</Text>
                <TextInput
                    placeholder="Description of new sighting"
                    value={formData.description}
                    onChangeText={(text) => setFormData({ ...formData, description: text })}
                />

                <View>
                    <Text>Location:</Text>
                    <TouchableOpacity onPress={getCurrentLocation}>
                        <Ionicons name="location" size={20} color="#fff" />
                        <Text>Use Current Location</Text>
                    </TouchableOpacity>
                </View>

                <View>
                    <View>
                        <Text>Latitude:</Text>
                        <TextInput
                            placeholder="Location Latitude"
                            keyboardType="numeric"
                            value={formData.location.latitude}
                            onChangeText={(text) =>
                                setFormData({
                                    ...formData,
                                    location: { ...formData.location, latitude: text },
                                })
                            }
                        />
                    </View>
                    <View>
                        <Text>Longitude:</Text>
                        <TextInput
                            placeholder="Location Longitude"
                            keyboardType="numeric"
                            value={formData.location.longitude}
                            onChangeText={(text) =>
                                setFormData({
                                    ...formData,
                                    location: { ...formData.location, longitude: text },
                                })
                            }
                        />
                    </View>
                </View>

                <Text>Your Name:</Text>
                <TextInput
                    placeholder="Enter your name"
                    value={formData.witnessName}
                    onChangeText={(text) => setFormData({ ...formData, witnessName: text })}
                />

                <Text>Contact Information:</Text>
                <TextInput
                    placeholder="Enter your email"
                    value={formData.witnessContact}
                    onChangeText={(text) => setFormData({ ...formData, witnessContact: text })}
                />

                <TouchableOpacity
                    onPress={submitReport}
                >
                    <Text>
                        Submit Report
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}