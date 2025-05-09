import { View, Text } from 'react-native'
import React from 'react'
import { StyleSheet, Text, View, TouchableOpacity, FlatList, Image } from 'react-native'
import React from 'react'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen'
import { router, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons'


export default function favoriteCard() {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.heading}>Gợi ý</Text>
                <TouchableOpacity>
                    <Text style={styles.seeMore}>See More &gt;</Text>
                </TouchableOpacity>
            </View>
            {/* card recipes */}
            <View style={styles.listContent}>
                {recipes.slice(0, 4).map((item, index) => {
                    return (
                        <TouchableOpacity
                            onPress={handleRegister}
                            key={index}
                            style={styles.container_card}>
                            <Image source={{ uri: 'https://cdn.tgdd.vn/Files/2020/08/28/1284763/7-cong-thuc-lam-ga-ran-gion-rum-ngon-hon-ca-ngoai-hang-de-ban-tro-tai-202202231023431295.jpg' }} style={styles.image} />
                            <TouchableOpacity
                            >
                                <Ionicons name="bookmarks-outline" size={24} color="white" style={{
                                    position: 'absolute',
                                    top: 10,
                                    right: 10,
                                }} />
                            </TouchableOpacity>

                            <View style={styles.contentContainer}>
                                <Text style={styles.title}>{item.title}</Text>
                                <View style={styles.group}>
                                    <Text style={styles.chef}>{item.user_name}</Text>
                                    <Text style={styles.link}>Xem</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    )
                })}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    // test css
    container: {

        padding: 10,
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',

    },
    heading: { fontSize: 16, fontWeight: 'bold' },
    seeMore: { color: '#888' },

    listContent: {
        gap: 12,
        marginTop: 15,
        display: 'flex',
        flexWrap: 'wrap',
        flexDirection: 'row'
    },
    container_card: {
        backgroundColor: '#f9f9f9',
        borderRadius: 12,
        margin: 6,
        width: '45%', // 2 cột
        height: 235,
        overflow: 'hidden',
        height: 'auto',
        position: 'relative'
    },

    image: {
        width: '100%',
        height: 130,
        overflow: 'hidden'
    },
    contentContainer: {
        marginTop: 0,
        marginRight: 10,
        marginLeft: 10,
        height: 100,
    },
    title:
    {
        width: '100%',
        height: 60,
        color: 'black',
        fontSize: 17,
        fontFamily: 'sans-serif',
        textTransform: 'capitalize',
        marginTop: 10,
    },
    group: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },

    chef: {
        paddingHorizontal: 8,
        color: '#555',
        fontSize: 16,
    },

    link: {
        paddingHorizontal: 8,
        paddingBottom: 8,
        color: 'red',
        fontSize: 16
    }
}) 