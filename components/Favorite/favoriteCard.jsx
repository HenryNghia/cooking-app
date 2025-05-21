import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import Entypo from '@expo/vector-icons/Entypo';
import { getCategoryByUser, deleteFavorite } from '../../services/favoriteService';



export default function FavoriteCard() {
    const [favorite, setFavorite] = useState([]);
    const [message, setMessage] = useState('');
    const router = useRouter();

    useEffect(() => {
        getFavorite();
    }, []);

    const getFavorite = async () => {
        const response = await getCategoryByUser();
        console.log(response.data);

        if (response.status === 200) {
            setFavorite(response.data);
            setMessage(response.message);
        } else if (response.status === 401) {
            setMessage(response.message);
        }
    };

    const handleDelete = async (id) => {
        try {
            const response = await deleteFavorite(id);
            if (response.status === 200) {
                setMessage(response.message);
                console.log('Đã xóa');
                getFavorite();
            } else if (response.status === 401) {
                setMessage(response.message);
                console.log('Chưa xóa');
            }
        } catch (error) {
            console.error('Lỗi khi xóa:', error);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.heading}>Danh sách yêu thích</Text>
                <TouchableOpacity>
                    <Ionicons name="filter" size={24} color="#FFF" />
                </TouchableOpacity>
            </View>

            <View style={{ height: 10 }} />
            <View style={styles.listContent}>
                {favorite.map((favorites) => (
                    <TouchableOpacity
                        key={favorites.id}
                        style={styles.container_card}
                        onPress={() => router.push({
                            pathname: '/recipe-detail/[id]',
                            params: {
                                id: favorites.id,
                            },
                        })}>
                        <Image
                            source={{
                                uri: favorites.image,
                            }}
                            style={styles.image}
                        />
                        <View style={styles.overlay}>
                            <View style={styles.contentContainer}>
                                <Text
                                    style={styles.title}
                                    numberOfLines={1}
                                    ellipsizeMode="tail">
                                    {favorites.title}
                                </Text>
                                <Text style={styles.chef}>{favorites.recipe_owner_name}</Text>
                            </View>
                            <TouchableOpacity
                                style={styles.trashButton}
                                onPress={() => handleDelete(favorites.recipe_id)}>
                                <Entypo name="trash" size={24} color="white" />
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 10,
        flex: 1,
        marginBottom: 60,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    heading: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FFF',
    },
    listContent: {
        gap: 12,
        marginTop: 20,
        flexWrap: 'wrap',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    container_card: {
        width: '95%',
        height: 160,
        borderRadius: 15,
        overflow: 'hidden',
        position: 'relative',
        elevation: 5,
        backgroundColor: '#2D2D2D',
    },
    image: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    overlay: {
        flex: 1,
        padding: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        gap: 10,
    },
    contentContainer: {
        flexDirection: 'column',
        flex: 1,
    },
    title: {
        color: '#FFF',
        fontSize: 18,
        textTransform: 'capitalize',
        textShadowColor: 'rgba(0,0,0,0.75)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    chef: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: 'bold',
        textTransform: 'capitalize',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
        maxWidth: wp('60%'),
        flexShrink: 1,
    },
    trashButton: {
        backgroundColor: 'rgba(255,0,0,0.6)',
        borderRadius: 20,
        padding: 8,
    },
});