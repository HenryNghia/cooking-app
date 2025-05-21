import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { TrashIcon } from 'react-native-heroicons/solid';
import PropTypes from 'prop-types';

const CookingStepItem = ({ step = { id: '', description: '' }, index = 0, onRemove = () => {} }) => {
    return (
        <View style={styles.container}>
            <View style={styles.stepNumberCircle}>
                <Text style={styles.stepNumberText} testID="step-number">
                    {index + 1}
                </Text>
            </View>
            <Text 
                style={styles.stepText}
                numberOfLines={0}
                ellipsizeMode="tail"
                testID="step-description"
            >
                {step.description || 'No description provided.'}
            </Text>
            <TouchableOpacity 
                onPress={onRemove}
                style={styles.removeButton}
                accessibilityLabel="Remove step"
                testID="remove-step-button"
            >
                <TrashIcon size={20} color="#FF3B30" />
            </TouchableOpacity>
        </View>
    );
};

CookingStepItem.propTypes = {
    step: PropTypes.shape({
        id: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
    }).isRequired,
    index: PropTypes.number.isRequired,
    onRemove: PropTypes.func.isRequired,
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'flex-start',
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
    stepNumberCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#FF7043',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
        flexShrink: 0,
        marginTop: Platform.OS === 'android' ? 3 : 0,
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
        lineHeight: 22,
    },
    removeButton: {
        padding: 5,
        flexShrink: 0,
    },
});

export default CookingStepItem;
