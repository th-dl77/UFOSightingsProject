import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from "react-native";
import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "expo-router";

export default function Index() {
    const router = useRouter();
    return (
        <View>
            <TouchableOpacity
                onPress={() => router.push("./(tabs)/map")}
            >
                <Text>Map</Text>
            </TouchableOpacity>
            <TouchableOpacity
                onPress={() => router.push("./(tabs)/list")}
            >
                <Text>List</Text>
            </TouchableOpacity>
            <TouchableOpacity
                onPress={() => router.push("./(tabs)/report")}
            >
                <Text>Report</Text>
            </TouchableOpacity>
        </View>
    )
}