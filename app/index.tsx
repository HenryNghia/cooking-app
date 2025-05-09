// app/index.tsx
import { Redirect } from 'expo-router';
import { useAuth } from '../context/authContext';
import { View, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';

export default function Index() {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Chờ 1 chút để AsyncStorage load token
    setTimeout(() => setLoading(false), 500);
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return <Redirect href={isAuthenticated ? '/(tabs)/home' : '/auth/login'} />;
}
