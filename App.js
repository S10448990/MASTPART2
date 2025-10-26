// App.js
import React, { useState, useMemo, useCallback, createContext, useContext } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  ScrollView,
  Modal,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

/*
  Single-file Chef Christoffels / Paparoni's app.
  Features:
  - Home: search, recipe catalog buttons, list preview, recipe count
  - Add/Edit recipe (same screen, mode toggled by params)
  - Delete screen: delete individual items or clear all
  - Full validation & error handling
  - No hardcoded data persistence (starts empty)
*/

/* ---------- Context for Recipes (global state) ---------- */
const RecipesContext = createContext();

function useRecipes() {
  return useContext(RecipesContext);
}

/* ---------- App (navigation + provider) ---------- */
const Stack = createNativeStackNavigator();

export default function App() {
  const [recipes, setRecipes] = useState([]); // array of { id, name, description, price, course }
  // actions
  const addRecipe = (recipe) => {
    setRecipes((r) => [{ ...recipe, id: Date.now().toString() }, ...r]);
  };
  const updateRecipe = (id, updated) => {
    setRecipes((r) => r.map((it) => (it.id === id ? { ...it, ...updated } : it)));
  };
  const deleteRecipe = (id) => {
    setRecipes((r) => r.filter((it) => it.id !== id));
  };
  const clearRecipes = () => setRecipes([]);

  const value = useMemo(
    () => ({ recipes, addRecipe, updateRecipe, deleteRecipe, clearRecipes }),
    [recipes]
  );

  return (
    <RecipesContext.Provider value={value}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="AddEdit" component={AddEditRecipeScreen} />
          <Stack.Screen name="Delete" component={DeleteRecipeScreen} />
        </Stack.Navigator>
      </NavigationContainer>
      <StatusBar style="auto" />
    </RecipesContext.Provider>
  );
}

/* ---------- Home Screen ---------- */
function HomeScreen({ navigation }) {
  const { recipes } = useRecipes();
  const [search, setSearch] = useState('');
  const [detailRecipe, setDetailRecipe] = useState(null); // for modal
  const [showAll, setShowAll] = useState(false);

  const filtered = useMemo(() => {
    if (!search.trim()) return showAll ? recipes : recipes.slice(0, 6);
    const q = search.toLowerCase();
    return recipes.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.course.toLowerCase().includes(q)
    );
  }, [recipes, search, showAll]);

  const totalCount = recipes.length;

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.recipeCard}
      onPress={() => setDetailRecipe(item)}
      activeOpacity={0.8}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View>
          <Text style={styles.recipeName}>{item.name}</Text>
          <Text style={styles.recipeMeta}>
            {item.course} • R{Number(item.price).toFixed(2)}
          </Text>
        </View>
        <View>
          <TouchableOpacity
            style={styles.smallBtn}
            onPress={() => navigation.navigate('AddEdit', { mode: 'edit', recipe: item })}
          >
            <Text style={styles.smallBtnText}>Edit</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.header}>
          <Text style={styles.logo}>paparoni’s</Text>
          <View style={{ alignItems: 'flex-end' }}>
            <TouchableOpacity style={styles.hamburger}>
              <Text style={{ fontSize: 18, color: '#fff' }}>☰</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.hero}>
          <Text style={styles.subtitle}>TECHNOLOGY FOR YOUR TASTEBUDS</Text>

          <TextInput
            style={styles.searchInput}
            placeholder="Search for recipe's"
            placeholderTextColor="#666"
            value={search}
            onChangeText={setSearch}
          />

          <View style={{ width: '100%', alignItems: 'center', marginTop: 8 }}>
            <TouchableOpacity
              style={styles.bigButton}
              onPress={() => navigation.navigate('AddEdit', { mode: 'add' })}
            >
              <Text style={styles.bigButtonText}>Add Recipe</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.bigButton} onPress={() => navigation.navigate('AddEdit', { mode: 'add' })}>
              <Text style={styles.bigButtonText}>Edit Recipe</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.bigButton} onPress={() => navigation.navigate('Delete')}>
              <Text style={styles.bigButtonText}>Delete Recipe</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoText}>Total dishes prepared: </Text>
            <Text style={[styles.infoText, { fontWeight: '700' }]}>{totalCount}</Text>
          </View>

          <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
            <View style={styles.listHeader}>
              <Text style={styles.sectionTitle}>Recipe Catalog</Text>
              <TouchableOpacity onPress={() => setShowAll((s) => !s)}>
                <Text style={styles.link}>{showAll ? 'Show less' : 'Show all'}</Text>
              </TouchableOpacity>
            </View>

            {filtered.length === 0 ? (
              <Text style={{ color: '#666', marginTop: 8 }}>No recipes yet. Add one!</Text>
            ) : (
              <FlatList
                data={filtered}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                style={{ marginTop: 8 }}
              />
            )}
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>PAPARONI'S INC.</Text>
        </View>
      </ScrollView>

      {/* Detail Modal */}
      <Modal visible={!!detailRecipe} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{detailRecipe?.name}</Text>
            <Text style={styles.modalCourse}>
              {detailRecipe?.course} • R{detailRecipe ? Number(detailRecipe.price).toFixed(2) : '0.00'}
            </Text>
            <Text style={styles.modalDescription}>{detailRecipe?.description}</Text>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
              <TouchableOpacity
                style={[styles.smallBtn, { backgroundColor: '#c48f2c' }]}
                onPress={() => {
                  navigation.navigate('AddEdit', { mode: 'edit', recipe: detailRecipe });
                  setDetailRecipe(null);
                }}
              >
                <Text style={styles.smallBtnText}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.smallBtn, { backgroundColor: '#b83b3b' }]}
                onPress={() => {
                  Alert.alert(
                    'Delete Recipe',
                    `Delete "${detailRecipe.name}"?`,
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Delete',
                        style: 'destructive',
                        onPress: () => {
                          const { deleteRecipe } = requireSelfRecipes();
                          deleteRecipe(detailRecipe.id);
                          setDetailRecipe(null);
                        },
                      },
                    ],
                    { cancelable: true }
                  );
                }}
              >
                <Text style={styles.smallBtnText}>Delete</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.modalClose} onPress={() => setDetailRecipe(null)}>
              <Text style={{ color: '#fff' }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

/* ---------- Add/Edit Recipe Screen ---------- */
function AddEditRecipeScreen({ route, navigation }) {
  const { mode = 'add', recipe } = route.params || {};
  const isEdit = mode === 'edit';
  const { addRecipe, updateRecipe } = useRecipes();

  const [name, setName] = useState(isEdit && recipe ? recipe.name : '');
  const [description, setDescription] = useState(isEdit && recipe ? recipe.description : '');
  const [price, setPrice] = useState(isEdit && recipe ? String(recipe.price) : '');
  const [course, setCourse] = useState(isEdit && recipe ? recipe.course : 'Starters');
  const [saving, setSaving] = useState(false);

  // validation
  const validate = useCallback(() => {
    if (!name.trim()) {
      Alert.alert('Validation', 'Dish name is required.');
      return false;
    }
    if (!description.trim()) {
      Alert.alert('Validation', 'Description is required.');
      return false;
    }
    if (!price.trim()) {
      Alert.alert('Validation', 'Price is required.');
      return false;
    }
    const n = Number(price);
    if (isNaN(n) || n < 0) {
      Alert.alert('Validation', 'Price must be a valid non-negative number.');
      return false;
    }
    return true;
  }, [name, description, price]);

  const onSave = () => {
    if (!validate()) return;
    setSaving(true);
    const payload = {
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      course,
    };
    try {
      if (isEdit) {
        updateRecipe(recipe.id, payload);
        Alert.alert('Success', 'Recipe updated.');
      } else {
        addRecipe(payload);
        Alert.alert('Success', 'Recipe added.');
      }
      navigation.navigate('Home');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Something went wrong while saving.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.formWrap}>
          <View style={styles.headerSmall}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={{ color: '#fff', fontSize: 16 }}>← Back</Text>
            </TouchableOpacity>
            <Text style={{ color: '#fff', fontWeight: '700' }}>{isEdit ? 'Edit Recipe' : 'Add Recipe'}</Text>
            <View style={{ width: 50 }} />
          </View>

          <Text style={styles.label}>Dish Name</Text>
          <TextInput style={styles.input} placeholder="e.g. Chicken Alfredo" value={name} onChangeText={setName} />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, { height: 100 }]}
            placeholder="Describe the dish"
            value={description}
            onChangeText={setDescription}
            multiline
          />

          <Text style={styles.label}>Price (R)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 65.00"
            keyboardType="numeric"
            value={price}
            onChangeText={setPrice}
          />

          <Text style={styles.label}>Select Course</Text>
          <View style={styles.courseRow}>
            {['Starters', 'Mains', 'Desserts'].map((c) => (
              <TouchableOpacity
                key={c}
                style={[styles.courseBtn, course === c && styles.courseBtnActive]}
                onPress={() => setCourse(c)}
              >
                <Text style={[styles.courseText, course === c && styles.courseTextActive]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.saveBtn} onPress={onSave} disabled={saving}>
            <Text style={styles.saveBtnText}>{isEdit ? 'Update Recipe' : 'Add Recipe'}</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ---------- Delete Recipes Screen ---------- */
function DeleteRecipeScreen({ navigation }) {
  const { recipes, deleteRecipe, clearRecipes } = useRecipes();
  const [confirmClear, setConfirmClear] = useState(false);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.headerSmall}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: '#fff' }}>← Back</Text>
        </TouchableOpacity>
        <Text style={{ color: '#fff', fontWeight: '700' }}>Delete Recipes</Text>
        <View style={{ width: 50 }} />
      </View>

      <View style={{ padding: 16, flex: 1 }}>
        {recipes.length === 0 ? (
          <Text style={{ color: '#666' }}>No recipes to delete.</Text>
        ) : (
          <FlatList
            data={recipes}
            keyExtractor={(i) => i.id}
            renderItem={({ item }) => (
              <View style={styles.deleteRow}>
                <View>
                  <Text style={{ fontWeight: '600' }}>{item.name}</Text>
                  <Text style={{ color: '#666' }}>
                    {item.course} • R{Number(item.price).toFixed(2)}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity
                    style={[styles.smallBtn, { backgroundColor: '#c48f2c' }]}
                    onPress={() => navigation.navigate('AddEdit', { mode: 'edit', recipe: item })}
                  >
                    <Text style={styles.smallBtnText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.smallBtn, { backgroundColor: '#b83b3b' }]}
                    onPress={() =>
                      Alert.alert('Confirm delete', `Delete "${item.name}"?`, [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Delete', style: 'destructive', onPress: () => deleteRecipe(item.id) },
                      ])
                    }
                  >
                    <Text style={styles.smallBtnText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        )}

        <View style={{ marginTop: 16 }}>
          <TouchableOpacity
            style={[styles.clearBtn]}
            onPress={() =>
              Alert.alert('Clear all recipes', 'Are you sure you want to delete ALL recipes?', [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete All',
                  style: 'destructive',
                  onPress: () => clearRecipes(),
                },
              ])
            }
          >
            <Text style={styles.clearBtnText}>Clear All Recipes</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}


function requireSelfRecipes() {
 
  const ctx = React.useContext(RecipesContext);
  return ctx;
}

/* ---------- Styles ---------- */
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  header: {
    backgroundColor: '#c48f2c', // gold
    paddingTop: 18,
    paddingHorizontal: 18,
    paddingBottom: 18,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerSmall: {
    backgroundColor: '#c48f2c',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    color: '#fff',
    fontSize: 34,
    fontWeight: '800',
  },
  hamburger: {
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 8,
  },
  hero: {
    padding: 16,
    alignItems: 'center',
    flex: 1,
  },
  subtitle: {
    color: '#6b6b6b',
    marginTop: 10,
    marginBottom: 12,
    fontSize: 12,
    letterSpacing: 1,
  },
  searchInput: {
    width: '100%',
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    fontSize: 14,
    textAlign: 'left',
  },
  bigButton: {
    backgroundColor: '#606C38',
    width: '90%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 28,
    marginVertical: 10,
    elevation: 2,
  },
  bigButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  footer: {
    backgroundColor: '#c48f2c',
    paddingVertical: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  footerText: {
    color: '#6b3800',
    fontWeight: '700',
  },
  infoRow: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    color: '#333',
    fontSize: 14,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  link: { color: '#606C38', fontWeight: '700' },

  /* recipe list */
  recipeCard: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 10,
  },
  recipeName: { fontSize: 16, fontWeight: '700' },
  recipeMeta: { color: '#666', marginTop: 4 },

  smallBtn: {
    backgroundColor: '#4b8b3b',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  smallBtnText: { color: '#fff', fontWeight: '600' },

  /* Modal */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  modalTitle: { fontSize: 20, fontWeight: '800' },
  modalCourse: { color: '#666', marginTop: 6 },
  modalDescription: { marginTop: 12, color: '#333' },
  modalClose: {
    marginTop: 18,
    backgroundColor: '#606C38',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 8,
  },

  /* form */
  formWrap: { padding: 16, paddingBottom: 40 },
  label: { marginTop: 12, fontWeight: '600', color: '#333' },
  input: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  courseRow: { flexDirection: 'row', marginTop: 8 },
  courseBtn: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  courseBtnActive: { backgroundColor: '#606C38', borderColor: '#606C38' },
  courseText: { color: '#333' },
  courseTextActive: { color: '#fff', fontWeight: '700' },
  saveBtn: {
    marginTop: 20,
    backgroundColor: '#606C38',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveBtnText: { color: '#fff', fontWeight: '800' },

  /* delete */
  deleteRow: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clearBtn: {
    backgroundColor: '#b83b3b',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearBtnText: { color: '#fff', fontWeight: '700' },

  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
