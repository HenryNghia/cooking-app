import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Tabs } from 'expo-router'
import { HeartIcon, HomeIcon, UserCircleIcon } from 'react-native-heroicons/outline'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen'
import CreateButton from '../../components/Createbutton'
import { SearchProvider } from '../../context/SearchContext';
const _layout = () => {
    return (
        <SearchProvider>
            <View style={styles.container}>
                <Tabs
                    screenOptions={{
                        tabBarActiveTintColor: '#FF6B6B', // Màu khi tab active
                        tabBarInactiveTintColor: '#4E4E4E', // Màu khi tab inactive
                        tabBarStyle: {
                            backgroundColor: '#000000', // Màu nền đen
                            borderTopWidth: 0,
                            height: hp(8),
                            paddingBottom: hp(1),
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: -1 },
                            shadowOpacity: 0.1,
                            shadowRadius: 4,
                            elevation: 5,
                        },
                        tabBarLabelStyle: {
                            fontSize: hp(1.5),
                            fontWeight: '500',
                            marginBottom: hp(0.5),
                        },
                        tabBarItemStyle: {
                            paddingTop: hp(1),
                        },
                    }}
                >
                    <Tabs.Screen
                        name="search"
                        options={{
                            title: "search",
                            headerShown: false,
                            tabBarIcon: ({ focused, color, size }) => (
                                <UserCircleIcon size={hp(2.7)} color={color} />),
                        }}
                    />

                    <Tabs.Screen
                        name="profile"
                        options={{
                            title: "Profile",
                            headerShown: false,
                            tabBarIcon: ({ focused, color, size }) => (
                                <UserCircleIcon size={hp(2.7)} color={color} />),
                        }}
                    />

                    <Tabs.Screen
                        name="favorite"
                        options={{
                            title: "Favorite",
                            headerShown: false,
                            tabBarIcon: ({ focused, color, size }) => (
                                <HeartIcon size={hp(2.7)} color={color} />),
                        }}
                    />
                    <Tabs.Screen
                        name="auth"
                        options={{
                            title: "auth",
                            headerShown: false,
                            tabBarIcon: ({ focused, color, size }) => (
                                <UserCircleIcon size={hp(2.7)} color={color} />),
                        }}
                    />
                    <Tabs.Screen
                        name="home"
                        options={{
                            title: "Home",
                            headerShown: false,
                            tabBarIcon: ({ focused, color, size }) => (
                                <HomeIcon size={hp(2.7)} color={color} />),
                        }}
                    />
                </Tabs>
                <CreateButton onPress={undefined} />
            </View>
        </SearchProvider>
    )
}

export default _layout

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative',
    }
})