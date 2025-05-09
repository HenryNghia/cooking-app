import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView } from 'react-native'
import React from 'react'
import color from '@/constants/color'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen'
import Profile from '../../components/Profile/profile'
const profile = () => {
    return (
        <ScrollView style={{
            flex: 1,
            backgroundColor: '#000000',
            paddingTop: hp(5.6),
        }}>
            <View className="mx-4 flex-row justify-between items-center mb-2 rounded-full" >
                <Text style={{
                    fontSize: 26,
                    fontFamily: 'outfit-bold',
                    textTransform: 'capitalize',
                    fontWeight: '900',
                    color: color.white
                }}>Hồ sơ</Text>
            </View>

            {/* profile */}
            <Profile />
        </ScrollView>
    )
}

export default profile

const styles = StyleSheet.create({})