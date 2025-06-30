import { Stack, useLocalSearchParams } from "expo-router";
import Ionicons from '@expo/vector-icons/Ionicons';
import { AuthProvider } from '../context/authContext';
import EvilIcons from '@expo/vector-icons/EvilIcons';
export default function RootLayout() {
    return (
        <AuthProvider>
            <Stack
                screenOptions={{
                    headerStyle: {
                        backgroundColor: '#000', // nền header màu đen
                    },
                    headerTintColor: '#FFF', // màu chữ, icon là trắng
                    headerTitleStyle: {
                        fontWeight: 'bold', // tuỳ bạn thêm
                    },
                }}>
                {/* Nếu bạn có layout (tabs) thì cấu hình ở đây */}
                <Stack.Screen
                    name="(tabs)"
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="auth"
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="recipe-detail/[id]"
                    options={{
                        headerTitle: 'Chi tiết công thức',
                        headerRight: () => (
                            <Ionicons name="bookmark-outline" size={24} color="#FFF" onPress={() => alert('Navigate to See More!')} />
                        )
                    }}
                />
                <Stack.Screen
                    name="create-recipe/index"
                    options={{
                        headerTitle: 'Tạo công thức mới',
                    }}
                />
                <Stack.Screen
                    name="category/category"
                    options={({ route }) => {
                        const { name_category } = route.params || {};
                        return {
                            headerTitle: name_category ? `Các công thức ${name_category}` : 'Các công thức',
                            // headerRight: () => (
                            //     <EvilIcons name="search" size={28} color="#FFF" />
                            // )
                        };
                    }}
                />
                <Stack.Screen
                    name="recommend/index"
                    options={{
                        headerTitle: 'Gợi ý cho bạn',
                    }}
                />
                <Stack.Screen
                    name="recently/index"
                    options={{
                        headerTitle: 'Mới đăng gần đây',
                    }}
                />
                <Stack.Screen
                    name="recipe-user/index"
                    options={{
                        headerTitle: 'công thức của tôi',
                    }}
                />
                <Stack.Screen
                    name="update-recipe/[id]"
                    options={{
                        headerTitle: 'cập nhật công thức',
                    }}
                />
                <Stack.Screen
                    name="change-profile/index"
                    options={{
                        headerTitle: 'Chỉnh sửa hồ sơ cá nhân',
                    }}
                />
            </Stack>
        </AuthProvider>

    )
}
