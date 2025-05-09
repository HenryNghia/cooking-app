// components/CreateRecipe/CookingStepItem.jsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native'; // Import Platform
import { TrashIcon } from 'react-native-heroicons/solid';

export default function CookingStepItem({ step, index, onRemove }) {
    return (
        <View style={styles.container}>
            <View style={styles.stepNumberCircle}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
            </View>
            <Text style={styles.stepText}>
                {step.description}
            </Text>
            <TouchableOpacity onPress={onRemove} style={styles.removeButton}> {/* Wrap icon in button */}
                <TrashIcon size={20} color="red" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 15,
        marginBottom: 10,
        // Shadows iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
         // Elevation Android
         elevation: 2,
    },
    stepNumberCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#FF7043', 
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
        flexShrink: 0,
         marginTop: Platform.OS === 'android' ? 3 : 0, // Add small top margin on Android to align text baselines
    },
    stepNumberText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
    stepText: {
        fontSize: 16,
        color: '#333',
        flex: 1,
        marginRight: 10,
        flexWrap: 'wrap', 
    },
    removeButton: { 
        padding: 5, 
         flexShrink: 0, // Prevent button from being compressed
    },
});