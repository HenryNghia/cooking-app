import React from 'react';
// Import Icon từ thư viện
import Icon from 'react-native-vector-icons/FontAwesome';
import {
    StyleSheet,
    Text, 
    View,
    TouchableOpacity, 
    Image
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { router } from 'expo-router';

export default function RecipeSearch({ recipes, searchKeyword, message }) {

    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const decimalPart = rating % 1;
        for (let i = 1; i <= fullStars; i++) {
          
            stars.push(<Icon key={`full-${i}`} name="star" size={16} color="#FFA500" style={styles.star} />);
        }
        if (decimalPart > 0) {
            if (decimalPart <= 0.2) {
                stars.push(<Icon key="empty-after" name="star-o" size={16} color="#FFA500" style={styles.star} />);
            } else if (decimalPart <= 0.7) {
                stars.push(<Icon key="half" name="star-half-full" size={16} color="#FFA500" style={styles.star} />);
            } else {
                stars.push(<Icon key="almost-full" name="star" size={16} color="#FFA500" style={styles.star} />);
            }
        }
        const totalStarsInArray = stars.length;
        for (let i = totalStarsInArray; i < 5; i++) {
            stars.push(<Icon key={`empty-${i}`} name="star-o" size={16} color="#FFA500" style={styles.star} />);
        }
        return stars;
    };


    const handleFavorite = (itemId) => {
        console.log("Favorite pressed for item:", itemId);
    };

    return (
        <View style={styles.recipeSearchContainer}>
            <View style={styles.rowContainer}>
                {recipes && recipes.length > 0 ? (
                    recipes.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            onPress={() => router.push({
                                pathname: '/recipe-detail/[id]',
                                params: { id: item.id },
                            })}
                            style={styles.cardWrapper} 
                        >
                            <View style={styles.cardContentContainer}>
                                <TouchableOpacity
                                    style={styles.heartIcon}
                                    onPress={() => handleFavorite(item.id)}
                                >
                                    <Icon name={'heart-o'} size={22} color="#FFA500" />
                                </TouchableOpacity>
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
    },

     messageContainer: {
        flex: 1, 
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
        width: '100%', 
     },
    messageText: {
        color: '#FFF',
        textAlign: 'center',
        fontSize: hp(1.8),
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
        elevation: 4, // Shadow cho Android
        shadowColor: '#000', // Shadow cho iOS
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
        fontSize: hp(1.8),
        fontWeight: 'bold',
        marginBottom: 5,
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
        color: '#BBB',
        fontSize: hp(1.6),
        fontStyle: 'italic',
    },
    heartIcon: {
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 2, 
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 6,
        borderRadius: 20,
        justifyContent: 'center', 
        alignItems: 'center', 
    },
});