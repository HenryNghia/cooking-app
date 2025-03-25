import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Tabs } from 'expo-router'
import { HeartIcon, HomeIcon, UserCircleIcon } from 'react-native-heroicons/outline'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen'
const _layout = () => {
    return (
        <Tabs>
            <Tabs.Screen
                name="index"
                options={{
                    title: "Home",
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <HomeIcon size={hp(2.7)} color={'black'} />),
                }}
            />
            <Tabs.Screen
                name="favorite"
                options={{
                    title: "Favorite",
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <HeartIcon size={hp(2.7)} color={'red'} />),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: "Profile",
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <UserCircleIcon size={hp(2.7)} color={'black'} />),
                }}
            />
        </Tabs>
    )
}

export default _layout

const styles = StyleSheet.create({})