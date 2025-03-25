import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { useLocalSearchParams } from 'expo-router'

const Detail = () => {
    const {id } = useLocalSearchParams()
  return (
    <View>
      <Text>Detail : {id}</Text>
    </View>
  )
}

export default Detail

const styles = StyleSheet.create({})