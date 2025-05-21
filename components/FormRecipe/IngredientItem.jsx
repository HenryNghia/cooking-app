import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { TrashIcon } from 'react-native-heroicons/solid';
import PropTypes from 'prop-types';

const IngredientItem = ({ ingredient = { name: '', qty: '' }, onRemove }) => {
    // Safely handle undefined/null ingredient
    if (!ingredient) return null;

    return (
        <View style={styles.container} testID="ingredient-item">
            <Text
                style={styles.text}
                numberOfLines={2}
                ellipsizeMode="tail"
                testID="ingredient-text"
            >
                {ingredient.name || 'Unnamed ingredient'} {ingredient.qty ? ` (${ingredient.qty})` : ''}
            </Text>
            <TouchableOpacity
                onPress={onRemove}
                style={styles.removeButton}
                accessibilityLabel="Remove ingredient"
                testID="remove-ingredient-button"
            >
                <TrashIcon size={20} color="#FF3B30" />
            </TouchableOpacity>
        </View>
    );
};

IngredientItem.propTypes = {
    ingredient: PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string,
        qty: PropTypes.string,
    }).isRequired,
    onRemove: PropTypes.func.isRequired,
};

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
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    text: {
        fontSize: 16,
        color: '#333',
        flex: 1,
        marginRight: 10,
        lineHeight: 22, // Added for better text spacing
    },
    removeButton: {
        padding: 5,
        marginLeft: 8, // Added for better spacing
    },
});

export default IngredientItem;
