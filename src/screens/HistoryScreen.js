import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, deleteDoc, doc, getDoc, onSnapshot, orderBy, query, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert, FlatList, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth, db } from '../config/firebase';
import { getAllCategories, getCategoryById } from '../constants/categories';

export default function HistoryScreen() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingExpense, setEditingExpense] = useState(null);
  const [editAmount, setEditAmount] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editNote, setEditNote] = useState('');
  const [editDate, setEditDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customCategories, setCustomCategories] = useState([]);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    loadCustomCategories();

    const expensesRef = collection(db, 'users', user.uid, 'expenses');
    const q = query(expensesRef, orderBy('date', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const expensesData = [];
      snapshot.forEach((doc) => {
        expensesData.push({ id: doc.id, ...doc.data() });
      });
      setExpenses(expensesData);
      setLoading(false);
    });

    return () => unsubscribe();
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

  const handleDelete = (expenseId) => {
    Alert.alert(
      'Eliminar Gasto',
      '¿Estás seguro que deseas eliminar este gasto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const user = auth.currentUser;
              await deleteDoc(doc(db, 'users', user.uid, 'expenses', expenseId));
              Alert.alert('Éxito', 'Gasto eliminado correctamente');
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar el gasto');
            }
          }
        }
      ]
    );
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setEditAmount(expense.amount.toString());
    setEditCategory(expense.category);
    setEditNote(expense.note || '');
    setEditDate(new Date(expense.date));
  };

  const saveEdit = async () => {
    if (!editAmount || parseFloat(editAmount) <= 0) {
      Alert.alert('Error', 'Ingresa un monto válido');
      return;
    }

    try {
      const user = auth.currentUser;
      await updateDoc(doc(db, 'users', user.uid, 'expenses', editingExpense.id), {
        amount: parseFloat(editAmount),
        category: editCategory,
        note: editNote,
        date: editDate.toISOString(),
      });

      setEditingExpense(null);
      Alert.alert('¡Éxito!', 'Gasto actualizado correctamente');
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el gasto');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const groupByDate = (expenses) => {
    const grouped = {};
    expenses.forEach((expense) => {
      const date = new Date(expense.date);
      const dateKey = date.toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(expense);
    });
    return grouped;
  };

  const groupedExpenses = groupByDate(expenses);

  const renderExpense = ({ item }) => {
    const category = getCategoryById(item.category, customCategories);
    return (
      <TouchableOpacity
        style={styles.expenseItem}
        onLongPress={() => handleDelete(item.id)}
      >
        <LinearGradient
          colors={['rgba(139, 92, 246, 0.3)', 'rgba(99, 102, 241, 0.1)']}
          style={styles.expenseIcon}
        >
          <Text style={styles.iconText}>{category.icon}</Text>
        </LinearGradient>
        <View style={styles.expenseDetails}>
          <Text style={styles.expenseCategory}>{category.name}</Text>
          <Text style={styles.expenseNote}>
            {item.note || 'Sin nota'}
          </Text>
          <Text style={styles.expenseTime}>
            {new Date(item.date).toLocaleTimeString('es-CO', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        </View>
        <View style={styles.expenseRight}>
          <Text style={styles.expenseAmount}>
            -{formatCurrency(item.amount)}
          </Text>
          <View style={styles.actions}>
            <TouchableOpacity 
              onPress={() => handleEdit(item)}
              style={styles.actionButton}
            >
              <Text style={styles.actionText}>✏️</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => handleDelete(item.id)}
              style={styles.actionButton}
            >
              <Text style={styles.actionText}>🗑️</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <LinearGradient
        colors={['#1a0033', '#0a0015', '#000000']}
        style={styles.container}
      >
        <Text style={styles.loadingText}>Cargando historial...</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#1a0033', '#0a0015', '#000000']}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Historial</Text>
        <LinearGradient
          colors={['rgba(139, 92, 246, 0.3)', 'rgba(99, 102, 241, 0.2)']}
          style={styles.badge}
        >
          <Text style={styles.badgeText}>
            {expenses.length} {expenses.length === 1 ? 'gasto' : 'gastos'}
          </Text>
        </LinearGradient>
      </View>

      {expenses.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📝</Text>
          <Text style={styles.emptyText}>No hay gastos registrados</Text>
          <Text style={styles.emptySubText}>
            Comienza agregando tu primer gasto
          </Text>
        </View>
      ) : (
        <FlatList
          data={Object.keys(groupedExpenses)}
          keyExtractor={(item) => item}
          renderItem={({ item: dateKey }) => (
            <View style={styles.dateGroup}>
              <Text style={styles.dateHeader}>{dateKey}</Text>
              {groupedExpenses[dateKey].map((expense) => (
                <View key={expense.id}>
                  {renderExpense({ item: expense })}
                </View>
              ))}
              <LinearGradient
                colors={['rgba(139, 92, 246, 0.2)', 'rgba(99, 102, 241, 0.1)']}
                style={styles.dateTotalContainer}
              >
                <Text style={styles.dateTotalLabel}>Total del día:</Text>
                <Text style={styles.dateTotalAmount}>
                  {formatCurrency(
                    groupedExpenses[dateKey].reduce((sum, e) => sum + e.amount, 0)
                  )}
                </Text>
              </LinearGradient>
            </View>
          )}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Modal de edición */}
      <Modal
        visible={editingExpense !== null}
        transparent
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <LinearGradient
              colors={['rgba(139, 92, 246, 0.3)', 'rgba(99, 102, 241, 0.1)']}
              style={styles.modalGradient}
            >
              <Text style={styles.modalTitle}>Editar Gasto</Text>

              <Text style={styles.label}>Monto</Text>
              <TextInput
                style={styles.input}
                value={editAmount}
                onChangeText={setEditAmount}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#666"
              />

              <Text style={styles.label}>Categoría</Text>
              <ScrollView style={styles.categoriesScrollView} horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.categoriesGrid}>
                  {getAllCategories(customCategories).map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.categoryButton,
                        editCategory === cat.id && styles.categoryActive
                      ]}
                      onPress={() => setEditCategory(cat.id)}
                    >
                      <Text style={styles.categoryIcon}>{cat.icon}</Text>
                      <Text style={[
                        styles.categoryName,
                        editCategory === cat.id && styles.categoryNameActive
                      ]}>
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              <Text style={styles.label}>Fecha</Text>
              <TouchableOpacity 
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateText}>
                  📅 {editDate.toLocaleDateString('es-CO')}
                </Text>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={editDate}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) {
                      setEditDate(selectedDate);
                    }
                  }}
                  maximumDate={new Date()}
                />
              )}

              <Text style={styles.label}>Nota</Text>
              <TextInput
                style={styles.noteInput}
                value={editNote}
                onChangeText={setEditNote}
                placeholder="Nota opcional"
                placeholderTextColor="#666"
                multiline
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={styles.modalButton}
                  onPress={() => setEditingExpense(null)}
                >
                  <Text style={styles.modalButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.modalButton}
                  onPress={saveEdit}
                >
                  <LinearGradient
                    colors={['#8B5CF6', '#6366F1']}
                    style={styles.modalButtonGradient}
                  >
                    <Text style={styles.modalButtonTextPrimary}>Guardar</Text>
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
  header: {
    padding: 20,
    paddingTop: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  badgeText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  loadingText: {
    color: '#9CA3AF',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 100,
  },
  listContent: {
    padding: 20,
  },
  dateGroup: {
    marginBottom: 30,
  },
  dateHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B5CF6',
    marginBottom: 12,
    textTransform: 'capitalize',
  },
  expenseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  expenseIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 24,
  },
  expenseDetails: {
    flex: 1,
  },
  expenseCategory: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  expenseNote: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  expenseTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  expenseRight: {
    alignItems: 'flex-end',
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#EC4899',
    marginBottom: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  actionText: {
    fontSize: 18,
  },
  dateTotalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  dateTotalLabel: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  dateTotalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B5CF6',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#9CA3AF',
    marginBottom: 10,
  },
  emptySubText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
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
    maxHeight: '90%',
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
  label: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    color: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  categoriesScrollView: {
    marginBottom: 20,
  },
  categoriesGrid: {
    flexDirection: 'row',
    gap: 10,
    paddingRight: 10,
  },
  categoryButton: {
    minWidth: 80,
    height: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    paddingHorizontal: 12,
  },
  categoryActive: {
    borderColor: '#8B5CF6',
    borderWidth: 2,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 10,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  categoryNameActive: {
    color: '#8B5CF6',
    fontWeight: '600',
  },
  dateButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  dateText: {
    color: '#fff',
    fontSize: 15,
  },
  noteInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#fff',
    minHeight: 80,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    marginBottom: 20,
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