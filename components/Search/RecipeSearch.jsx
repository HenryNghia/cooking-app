import React, { useEffect, useState } from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Image,
    Alert,
    ActivityIndicator
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { router } from 'expo-router';

export default function RecipeSearch({ recipes, searchKeyword, message }) {

    const [internalRecipes, setInternalRecipes] = useState([]);

    useEffect(() => {
        setInternalRecipes(recipes);
    }, [recipes]);

    const renderStars = (rating) => {
        const stars = [];
        const roundedRating = Math.round(rating * 2) / 2;
        const fullRoundedStars = Math.floor(roundedRating);
        const hasHalfStar = roundedRating % 1 !== 0;

        for (let i = 0; i < fullRoundedStars; i++) {
            stars.push(<Icon key={`full-${i}`} name="star" size={16} color="#FFA500" style={styles.star} />);
        }
        if (hasHalfStar) {
            stars.push(<Icon key="half" name="star-half-full" size={16} color="#FFA500" style={styles.star} />);
        }
        const remainingStars = 5 - stars.length;
        for (let i = 0; i < remainingStars; i++) {
            stars.push(<Icon key={`empty-${i}`} name="star-o" size={16} color="#FFA500" style={styles.star} />);
        }
        return stars;
    };

    return (
        <View style={styles.recipeSearchContainer}>
            <View style={styles.rowContainer}>
                {internalRecipes && internalRecipes.length > 0 ? (
                    internalRecipes.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            onPress={() => router.push({
                                pathname: '/recipe-detail/[id]',
                                params: { id: item.id },
                            })}
                            style={styles.cardWrapper}
                        >
                            <View style={styles.cardContentContainer}>
                                <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
                                <View style={styles.textContainer}>
                                    <Text style={styles.title} numberOfLines={1}>
                                        {item.title}
                                    </Text>
                                    <View style={styles.ratingContainer}>
                                        {renderStars(item.rating)}
                                    </View>
                                    <Text style={styles.chef} numberOfLines={1}>
                                        {item.name}
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))
                ) : (
                    message && (
                        <View style={styles.messageContainer}>
                            <Text style={styles.messageText}>
                                {message}
                            </Text>
                        </View>
                    )
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    recipeSearchContainer: {
        backgroundColor: '#000',
        paddingBottom: hp(2),
        paddingHorizontal: wp(3),
    },
    messageContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
        width: '100%',
        height: hp(20),
    },
    messageText: {
        color: '#FFF',
        textAlign: 'center',
        fontSize: hp(2),
    },
    rowContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    cardWrapper: {
        width: '48%',
        marginVertical: hp(1),
        borderRadius: 15,
        backgroundColor: '#1E1E1E',
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
    cardContentContainer: {
        borderRadius: 15,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: hp('15%'),
    },
    textContainer: {
        padding: 10,
    },
    title: {
        color: '#FFF',
        fontSize: hp(1.9),
        fontWeight: 'bold',
        marginBottom: 5,
        textTransform: 'capitalize',
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    star: {
        marginRight: 2,
    },
    chef: {
        color: '#B0B0B0',
        fontSize: hp(1.6),
        fontStyle: 'italic',
    },
});