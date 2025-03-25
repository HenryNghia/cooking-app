import { ScrollView, Text, View, Image, TextInput, TouchableOpacity } from "react-native";
import "../global.css"
import { StatusBar } from "expo-status-bar";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen'
import { BellIcon, CameraIcon, MagnifyingGlassIcon } from 'react-native-heroicons/outline'
import Category from '../../components/categories'
import Recipes from '../../components/recipes';

export default function Home() {


	return (
		<View className="flex-1 bg-white">
			<StatusBar style="dark" />
			<ScrollView
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ paddingBottom: 50 }}
				className="space-y-6 pt-14"
			>
				{/* avatar and bell icon */}
				<View className="mx-4 flex-row justify-between items-center mb-2 rounded-full">
					<Image source={require('../../assets/Images/logo2.png')} style={{ height: hp(8), width: hp(8) }} className="rounded-full object-cover"/>
					<BellIcon size={hp(4)} color="gray"></BellIcon>
				</View>

				{/* greetings nad puchline */}
				<View className="mx-4 space-y-2 mb-2">
					<View>
						<Text className="font-semibold text-neutral-600" style={{ fontSize: hp(3.8) }}>Make your own food,</Text>
						<Text className="font-semibold text-neutral-600" style={{ fontSize: hp(3.8) }}>
							stay at <Text className="text-amber-400">Home</Text>
						</Text>
					</View>
				</View>

				{/* seacrh bar */}
				<View className="mx-4 flex-row items-center rounded-full bg-black/5 p-[6px] mt-4">
					<TextInput
						placeholder="search any recipe"
						placeholderTextColor={'gray'}
						style={{ fontSize: hp(1.8) }}
						className="flex-1 text-base mb-1 pl-3 tracking-wider">
					</TextInput>
					<View className="bg-transparent rounded-full p-3">
						<TouchableOpacity >
							<MagnifyingGlassIcon size={hp(2.5)} strokeWidth={3} color={'gray'} />
						</TouchableOpacity>
					</View>
					<View className="bg-transparent rounded-full p-3">
						<TouchableOpacity>
							<CameraIcon size={hp(2.5)} strokeWidth={3} color={'gray'} />
						</TouchableOpacity>
					</View>
				</View>

				{/*categories */}
				<View className="mt-6">
					 <Category />
				</View>

				{/* recipes */}
				<View>
					<Recipes />
				</View>
			</ScrollView>
		</View>
	);
}
