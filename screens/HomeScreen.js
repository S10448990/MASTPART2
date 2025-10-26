import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>paparoni’s</Text>
      <Text style={styles.subtitle}>TECHNOLOGY FOR YOUR TASTEBUDS</Text>

      <TextInput placeholder="Search for recipe’s" style={styles.search} />

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('AddRecipe')}>
        <Text style={styles.buttonText}>Add Recipe</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('EditRecipe')}>
        <Text style={styles.buttonText}>Edit Recipe</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('DeleteRecipe')}>
        <Text style={styles.buttonText}>Delete Recipe</Text>
      </TouchableOpacity>

      <Text style={styles.footer}>PAPARONI’S INC.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logo: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#AD8530',
  },
  subtitle: {
    color: '#6B6B6B',
    fontSize: 12,
    marginBottom: 20,
  },
  search: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 25,
    padding: 10,
    width: '90%',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#606C38',
    paddingVertical: 12,
    paddingHorizontal: 60,
    borderRadius: 25,
    marginVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 15,
    fontSize: 12,
    color: '#AD8530',
  },
});
