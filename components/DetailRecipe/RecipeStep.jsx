import { View, Text, FlatList, StyleSheet } from 'react-native';
import color from '../../constants/color';

export default function RecipeStep({ recipe }) {
  if (!recipe) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hướng dẫn các bước</Text>

      <FlatList
        data={recipe.instructions}
        renderItem={({ item, index }) => (
          <View style={styles.stepContainer}>
            <Text style={styles.stepNumber}>Bước {index + 1} :</Text>
            <Text style={styles.stepText}>{item}</Text>
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  title: {
    fontSize: 20,
    fontFamily: 'outfit-bold',
    textTransform: 'capitalize',
    color: color.orange,
    marginBottom: 10,
  },
  stepContainer: {
    padding: 15,
    marginTop: 8,
    borderRadius: 15,
    flexDirection: 'column',
    borderWidth: 0.2, // Giữ lại borderWidth
    borderColor: color.white, // Thêm màu trắng cho border
    gap: 10,
  },
  stepNumber: {
    fontFamily: 'outfit',
    fontSize: 18,
    padding: 10,
    width: 90,
    backgroundColor: 'green',
    borderRadius: 12,
    textAlign: 'center',
    color: color.white, // Đổi màu chữ "Bước X :" thành trắng
  },
  stepText: {
    fontFamily: 'outfit',
    fontSize: 19,
    marginTop: 10,
    color: color.greytext,
  },
});