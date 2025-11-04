import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { addDoc, collection, doc, getDoc, setDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth, db } from '../config/firebase';
import { AVAILABLE_ICONS, getAllCategories } from '../constants/categories';

export default function AddExpenseScreen({ navigation }) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('food');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [customCategories, setCustomCategories] = useState([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showDeleteCategoryModal, setShowDeleteCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('✈️');
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  useEffect(() => {
    loadCustomCategories();
  }, []);

  const loadCustomCategories = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      
      const categoriesDoc = await getDoc(doc(db, 'users', user.uid, 'settings', 'categories'));
      if (categoriesDoc.exists() && categoriesDoc.data().custom) {
        setCustomCategories(categoriesDoc.data().custom);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const saveCustomCategory = async () => {
    if (!newCategoryName.trim()) {
      Alert.alert('Error', 'Ingresa un nombre para la categoría');
      return;
    }

    try {
      const user = auth.currentUser;
      const newCategory = {
        id: `custom_${Date.now()}`,
        name: newCategoryName.trim(),
        icon: selectedIcon,
        color: '#' + Math.floor(Math.random()*16777215).toString(16),
      };

      const updatedCategories = [...customCategories, newCategory];
      
      await setDoc(doc(db, 'users', user.uid, 'settings', 'categories'), {
        custom: updatedCategories
      });

      setCustomCategories(updatedCategories);
      setCategory(newCategory.id);
      setShowCategoryModal(false);
      setNewCategoryName('');
      setSelectedIcon('✈️');
      
      Alert.alert('¡Éxito!', 'Categoría creada correctamente');
    } catch (error) {
      Alert.alert('Error', 'No se pudo crear la categoría');
    }
  };

  const handleDeleteCategory = (categoryId) => {
    const category = customCategories.find(c => c.id === categoryId);
    if (!category) return;
    
    setCategoryToDelete(category);
    setShowDeleteCategoryModal(true);
  };

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return;

    try {
      const user = auth.currentUser;
      const updatedCategories = customCategories.filter(c => c.id !== categoryToDelete.id);
      
      await setDoc(doc(db, 'users', user.uid, 'settings', 'categories'), {
        custom: updatedCategories
      });

      setCustomCategories(updatedCategories);
      if (category === categoryToDelete.id) {
        setCategory('food'); // Reset to default category
      }
      setShowDeleteCategoryModal(false);
      setCategoryToDelete(null);
      
      Alert.alert('¡Éxito!', 'Categoría eliminada correctamente');
    } catch (error) {
      Alert.alert('Error', 'No se pudo eliminar la categoría');
    }
  };

  const handleAddExpense = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Por favor ingresa un monto válido');
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) return;

      await addDoc(collection(db, 'users', user.uid, 'expenses'), {
        amount: parseFloat(amount),
        category: category,
        note: note,
        date: date.toISOString(),
        createdAt: new Date().toISOString(),
      });

      Alert.alert('¡Éxito!', 'Gasto registrado correctamente', [
        { text: 'OK', onPress: () => {
          setAmount('');
          setNote('');
          setCategory('food');
          setDate(new Date());
          navigation.navigate('Inicio');
        }}
      ]);
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el gasto');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    if (!value) return '';
    const number = parseFloat(value.replace(/[^0-9]/g, ''));
    return new Intl.NumberFormat('es-CO').format(number);
  };

  const handleAmountChange = (text) => {
    const numericValue = text.replace(/[^0-9]/g, '');
    setAmount(numericValue);
  };

  const allCategories = getAllCategories(customCategories);

  return (
    <LinearGradient
      colors={['#1a0033', '#0a0015', '#000000']}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.title}>Agregar Gasto</Text>

          <LinearGradient
            colors={['rgba(139, 92, 246, 0.2)', 'rgba(99, 102, 241, 0.1)']}
            style={styles.amountContainer}
          >
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={styles.amountInput}
              value={formatCurrency(amount)}
              onChangeText={handleAmountChange}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="#666"
            />
          </LinearGradient>

          <Text style={styles.label}>Categoría</Text>
          <View style={styles.categoriesGrid}>
            {allCategories.map((cat) => {
              const isCustom = cat.id.startsWith('custom_');
              return (
                <View key={cat.id} style={styles.categoryWrapper}>
                  <TouchableOpacity
                    style={styles.categoryButton}
                    onPress={() => setCategory(cat.id)}
                    onLongPress={isCustom ? () => handleDeleteCategory(cat.id) : undefined}
                  >
                    <LinearGradient
                      colors={category === cat.id 
                        ? ['rgba(139, 92, 246, 0.4)', 'rgba(99, 102, 241, 0.2)']
                        : ['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)']
                      }
                      style={[
                        styles.categoryGradient,
                        category === cat.id && styles.categoryActive
                      ]}
                    >
                      <Text style={styles.categoryIcon}>{cat.icon}</Text>
                      <Text style={[
                        styles.categoryName,
                        category === cat.id && styles.categoryNameActive
                      ]} numberOfLines={1}>
                        {cat.name}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  {isCustom && (
                    <TouchableOpacity
                      style={styles.deleteCategoryButton}
                      onPress={() => handleDeleteCategory(cat.id)}
                    >
                      <Text style={styles.deleteCategoryIcon}>✕</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
            
            {/* Botón para agregar categoría */}
            <TouchableOpacity
              style={styles.newCategoryButton}
              onPress={() => setShowCategoryModal(true)}
            >
              <LinearGradient
                colors={['rgba(139, 92, 246, 0.3)', 'rgba(99, 102, 241, 0.1)']}
                style={styles.newCategoryGradient}
              >
                <Text style={styles.newCategoryIcon}>➕</Text>
                <Text style={styles.newCategoryName}>Nueva</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Fecha</Text>
          <TouchableOpacity 
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)']}
              style={styles.dateGradient}
            >
              <Text style={styles.dateText}>
                📅 {date.toLocaleDateString('es-CO', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) {
                  setDate(selectedDate);
                }
              }}
              maximumDate={new Date()}
            />
          )}

          <Text style={styles.label}>Nota (Opcional)</Text>
          <TextInput
            style={styles.noteInput}
            value={note}
            onChangeText={setNote}
            placeholder="Ej: Almuerzo con amigos"
            placeholderTextColor="#666"
            multiline
            maxLength={100}
          />

          <TouchableOpacity 
            style={styles.saveButton}
            onPress={handleAddExpense}
            disabled={loading}
          >
            <LinearGradient
              colors={['#8B5CF6', '#6366F1']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.saveButtonGradient}
            >
              <Text style={styles.saveButtonText}>
                {loading ? 'Guardando...' : '💾 Guardar Gasto'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal para crear categoría */}
      <Modal
        visible={showCategoryModal}
        transparent
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <LinearGradient
              colors={['rgba(139, 92, 246, 0.3)', 'rgba(99, 102, 241, 0.1)']}
              style={styles.modalGradient}
            >
              <Text style={styles.modalTitle}>Nueva Categoría</Text>
              
              <Text style={styles.label}>Nombre</Text>
              <TextInput
                style={styles.modalInput}
                value={newCategoryName}
                onChangeText={setNewCategoryName}
                placeholder="Ej: Viajes, Mascotas..."
                placeholderTextColor="#666"
                maxLength={15}
              />

              <Text style={styles.label}>Selecciona un icono</Text>
              <ScrollView style={styles.iconsScrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.iconsGrid}>
                  {AVAILABLE_ICONS.map((icon, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.iconButton,
                        selectedIcon === icon && styles.iconButtonActive
                      ]}
                      onPress={() => setSelectedIcon(icon)}
                    >
                      <Text style={styles.iconText}>{icon}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={styles.modalButton}
                  onPress={() => {
                    setShowCategoryModal(false);
                    setNewCategoryName('');
                    setSelectedIcon('✈️');
                  }}
                >
                  <Text style={styles.modalButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.modalButton}
                  onPress={saveCustomCategory}
                >
                  <LinearGradient
                    colors={['#8B5CF6', '#6366F1']}
                    style={styles.modalButtonGradient}
                  >
                    <Text style={styles.modalButtonTextPrimary}>Crear</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </View>
      </Modal>

      {/* Modal de Confirmar Eliminación */}
      <Modal
        visible={showDeleteCategoryModal}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <LinearGradient
              colors={['rgba(239, 68, 68, 0.3)', 'rgba(220, 38, 38, 0.1)']}
              style={styles.modalGradient}
            >
              <Text style={styles.modalTitle}>Eliminar Categoría</Text>
              <Text style={styles.deleteModalText}>
                ¿Estás seguro que deseas eliminar la categoría "{categoryToDelete?.name}"?
              </Text>
              <Text style={styles.deleteModalWarning}>
                Esta acción no se puede deshacer. Los gastos que usen esta categoría seguirán existiendo.
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={styles.modalButton}
                  onPress={() => {
                    setShowDeleteCategoryModal(false);
                    setCategoryToDelete(null);
                  }}
                >
                  <Text style={styles.modalButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.modalButton}
                  onPress={confirmDeleteCategory}
                >
                  <LinearGradient
                    colors={['#EF4444', '#DC2626']}
                    style={styles.modalButtonGradient}
                  >
                    <Text style={styles.modalButtonTextPrimary}>Eliminar</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 30,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  currencySymbol: {
    fontSize: 40,
    color: '#8B5CF6',
    marginRight: 10,
  },
  amountInput: {
    flex: 1,
    fontSize: 40,
    color: '#fff',
    fontWeight: 'bold',
  },
  label: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 12,
    marginTop: 10,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
    justifyContent: 'flex-start',
  },
  categoryWrapper: {
    position: 'relative',
    width: '30%',
    minWidth: 80,
    maxWidth: 95,
    marginBottom: 10,
  },
  categoryButton: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  newCategoryButton: {
    width: '30%',
    minWidth: 80,
    maxWidth: 95,
    height: 80,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 10,
  },
  newCategoryGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: 16,
    borderStyle: 'dashed',
  },
  newCategoryIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  newCategoryName: {
    fontSize: 9,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  categoryGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: 16,
  },
  categoryActive: {
    borderColor: '#8B5CF6',
    borderWidth: 2,
  },
  categoryIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 9,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  categoryNameActive: {
    color: '#8B5CF6',
    fontWeight: 'bold',
  },
  deleteCategoryButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderWidth: 1,
    borderColor: '#1a0033',
  },
  deleteCategoryIcon: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  dateButton: {
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
  },
  dateGradient: {
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: 16,
  },
  dateText: {
    color: '#fff',
    fontSize: 15,
    textTransform: 'capitalize',
  },
  noteInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: '#fff',
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    marginBottom: 30,
  },
  saveButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 20,
  },
  saveButtonGradient: {
    padding: 18,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    maxHeight: '80%',
    backgroundColor: '#1a0033',
  },
  modalGradient: {
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.5)',
    backgroundColor: '#1a0033',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    color: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    marginBottom: 20,
  },
  iconsScrollView: {
    maxHeight: 200,
    marginBottom: 20,
  },
  iconsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  iconButton: {
    width: 50,
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  iconButtonActive: {
    borderColor: '#8B5CF6',
    borderWidth: 2,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
  },
  iconText: {
    fontSize: 28,
  },
  deleteModalText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
  },
  deleteModalWarning: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalButtonGradient: {
    padding: 14,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    padding: 14,
  },
  modalButtonTextPrimary: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});