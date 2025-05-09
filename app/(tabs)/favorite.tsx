import { StyleSheet, Text, View, Image, TouchableOpacity, FlatList } from 'react-native'
import React from 'react'
import color from '../../constants/color'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen'
import { BellIcon, CameraIcon, MagnifyingGlassIcon } from 'react-native-heroicons/outline'
import { Avatar } from 'react-native-elements'
import FavoriteCard from '../../components/Favorite/favoriteCard'
import { useRouter } from 'expo-router'
const favorite = () => {
	const router = useRouter(); // Initialize the router
	return (
		<FlatList
			data={[]}
			renderItem={() => null}
			style={{ backgroundColor: '#000000', }}
			ListHeaderComponent={
				<View style={{
					paddingTop: hp(5.6),
					flex: 1,
				}}>
	
						<View style={styles.headerContainer}>
							<TouchableOpacity onPress={() => router.push('/profile')}>
								<Avatar
									rounded
									size={hp(6)}
									source={require('../../assets/images/profile.png')}
								/>
							</TouchableOpacity>
							<Image
								source={require('../../assets/images/logomain.png')}
								style={styles.avatarImage}
							/>
							<TouchableOpacity onPress={() => alert('Navigate to See More!')}>
								<BellIcon size={hp(4)} color="gray" />
							</TouchableOpacity>
						</View>
					{/* card */}
					<FavoriteCard />
				</View>
			}
		/>

	)
}

export default favorite

const styles = StyleSheet.create({
	headerwrapper: {
		marginHorizontal: wp(4),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: hp(1),
	},
	headerContainer: {
        marginHorizontal: wp(4),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: hp(0.5),
        borderRadius: hp(50), // rounded-full equivalent
    },
    avatarImage: {
        height: hp(9),
        width: hp(9),
        resizeMode: 'cover',
    },
})