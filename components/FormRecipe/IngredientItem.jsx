// components/CreateRecipe/IngredientItem.jsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native'; // Import Platform
import { TrashIcon } from 'react-native-heroicons/solid';

export default function IngredientItem({ ingredient, onRemove }) {
    return (
        <View style={styles.container}>
            <Text style={styles.text} numberOfLines={2} ellipsizeMode="tail"> {/* Optional: Add text constraints */}
               {ingredient.name} ({ingredient.qty})
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
        justifyContent: 'space-between',
        alignItems: 'center',
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
    text: {
        fontSize: 16,
        color: '#333',
        flex: 1,
        marginRight: 10,
    },
    removeButton: { 
        padding: 5, 
    },
});