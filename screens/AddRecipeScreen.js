import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Picker, Alert } from 'react-native';

export default function AddRecipeScreen({ navigation }) {
  const [dish, setDish] = useState('');
  const [desc, setDesc] = useState('');
  const [price, setPrice] = useState('');
  const [course, setCourse] = useState('Starters');

  const handleAdd = () => {
    if (!dish || !desc || !price) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    Alert.alert('Success', `${dish} has been added to the ${course} menu!`);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add a New Recipe</Text>

      <TextInput style={styles.input} placeholder="Dish Name" value={dish} onChangeText={setDish} />
      <TextInput style={styles.input} placeholder="Description" value={desc} onChangeText={setDesc} />
      <TextInput style={styles.input} placeholder="Price" keyboardType="numeric" value={price} onChangeText={setPrice} />

      <Text style={styles.label}>Select Course</Text>
      <Picker selectedValue={course} onValueChange={setCourse} style={styles.picker}>
        <Picker.Item label="Starters" value="Starters" />
        <Picker.Item label="Mains" value="Mains" />
        <Picker.Item label="Desserts" value="Desserts" />
      </Picker>

      <Button title="Add Recipe" color="#606C38" onPress={handleAdd} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 10, padding: 10, width: '90%', marginVertical: 10 },
  picker: { height: 50, width: '90%', marginBottom: 20 },
  label: { marginTop: 10, fontWeight: 'bold' },
});
