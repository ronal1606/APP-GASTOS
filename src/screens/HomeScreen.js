import { LinearGradient } from 'expo-linear-gradient';
import { collection, doc, getDoc, limit, onSnapshot, orderBy, query, setDoc, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { auth, db } from '../config/firebase';
import { getCategoryById } from '../constants/categories';

export default function HomeScreen({ navigation }) {
  const [expenses, setExpenses] = useState([]);
  const [totalMonth, setTotalMonth] = useState(0);
  const [totalToday, setTotalToday] = useState(0);
  const [budget, setBudget] = useState(0);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [newBudget, setNewBudget] = useState('');
  const [displayName, setDisplayName] = useState('');

  useEffect(() => {
    loadBudget();
    loadExpenses();
    loadDisplayName();
    
    // Recargar cuando se regrese de la pantalla de perfil
    const unsubscribe = navigation.addListener('focus', () => {
      loadDisplayName();
    });
    
    return unsubscribe;
  }, [navigation]);

  const loadDisplayName = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists() && userDoc.data().displayName) {
        setDisplayName(userDoc.data().displayName);
      } else {
        setDisplayName(user.email?.split('@')[0] || 'Usuario');
      }
    } catch (error) {
      console.error('Error loading display name:', error);
      setDisplayName(auth.currentUser?.email?.split('@')[0] || 'Usuario');
    }
  };

  const loadBudget = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      
      const budgetDocRef = doc(db, 'users', user.uid);
      const budgetDoc = await getDoc(budgetDocRef);
      
      if (budgetDoc.exists() && budgetDoc.data().budget) {
        setBudget(budgetDoc.data().budget);
      }
    } catch (error) {
      console.error('Error loading budget:', error);
      if (error.code === 'unavailable') {
        Alert.alert('Error de conexión', 'No se pudo conectar al servidor. Verifica tu conexión a internet.');
      }
    }
  };

  const loadExpenses = () => {
    const user = auth.currentUser;
    if (!user) return;

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const expensesRef = collection(db, 'users', user.uid, 'expenses');
    const q = query(
      expensesRef,
      where('date', '>=', startOfMonth.toISOString()),
      orderBy('date', 'desc'),
      limit(5)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const expensesData = [];
      let monthTotal = 0;
      let dayTotal = 0;

      snapshot.forEach((docSnap) => {
        const data = { id: docSnap.id, ...docSnap.data() };
        expensesData.push(data);
        monthTotal += data.amount;

        const expenseDate = new Date(data.date);
        if (expenseDate >= startOfDay) {
          dayTotal += data.amount;
        }
      });

      setExpenses(expensesData);
      setTotalMonth(monthTotal);
      setTotalToday(dayTotal);
    });

    return unsubscribe;
  };

  const saveBudget = async () => {
    if (!newBudget || parseFloat(newBudget) <= 0) {
      Alert.alert('Error', 'Ingresa un presupuesto válido');
      return;
    }

    try {
      const user = auth.currentUser;
      const userDocRef = doc(db, 'users', user.uid);
      
      await setDoc(userDocRef, {
        budget: parseFloat(newBudget),
        email: user.email,
      }, { merge: true });
      
      setBudget(parseFloat(newBudget));
      setShowBudgetModal(false);
      setNewBudget('');
      Alert.alert('¡Éxito!', 'Presupuesto actualizado');
    } catch (error) {
      console.error('Error saving budget:', error);
      Alert.alert('Error', 'No se pudo actualizar el presupuesto');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const percentage = Math.min((totalMonth / budget) * 100, 100);
  const circumference = 2 * Math.PI * 70;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <LinearGradient
      colors={['#1a0033', '#0a0015', '#000000']}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hola! 👋</Text>
            <Text style={styles.email}>
              {displayName || auth.currentUser?.email?.split('@')[0] || 'Usuario'}
            </Text>
          </View>
          <TouchableOpacity 
            onPress={() => navigation.navigate('Perfil')} 
            style={styles.logoutButton}
          >
            <LinearGradient
              colors={['rgba(139, 92, 246, 0.2)', 'rgba(99, 102, 241, 0.2)']}
              style={styles.logoutGradient}
            >
              <Text style={styles.logoutText}>👤</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.circleContainer}>
          <Svg width="200" height="200">
            <Circle
              cx="100"
              cy="100"
              r="70"
              stroke="rgba(139, 92, 246, 0.2)"
              strokeWidth="12"
              fill="none"
            />
            <Circle
              cx="100"
              cy="100"
              r="70"
              stroke="#8B5CF6"
              strokeWidth="12"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform="rotate(-90 100 100)"
            />
          </Svg>
          <View style={styles.circleContent}>
            <Text style={styles.circleAmount}>{formatCurrency(totalMonth)}</Text>
            <Text style={styles.circleLabel}>Gastado este mes</Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <TouchableOpacity 
            onPress={() => setShowBudgetModal(true)}
            style={{ flex: 1 }}
          >
            <LinearGradient
              colors={['rgba(139, 92, 246, 0.3)', 'rgba(99, 102, 241, 0.1)']}
              style={styles.statCard}
            >
              <Text style={styles.statLabel}>Presupuesto ✏️</Text>
              <Text style={styles.statAmount}>{formatCurrency(budget)}</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <LinearGradient
            colors={['rgba(236, 72, 153, 0.3)', 'rgba(168, 85, 247, 0.1)']}
            style={styles.statCard}
          >
            <Text style={styles.statLabel}>Disponible</Text>
            <Text style={styles.statAmount}>{formatCurrency(budget - totalMonth)}</Text>
          </LinearGradient>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Gastos Recientes</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Historial')}>
              <Text style={styles.seeAll}>Ver todo</Text>
            </TouchableOpacity>
          </View>
          
          {expenses.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>💸</Text>
              <Text style={styles.emptyMessage}>No hay gastos este mes</Text>
            </View>
          ) : (
            expenses.map((expense) => {
              const category = getCategoryById(expense.category);
              return (
                <View key={expense.id} style={styles.expenseItem}>
                  <LinearGradient
                    colors={['rgba(139, 92, 246, 0.2)', 'rgba(99, 102, 241, 0.1)']}
                    style={styles.expenseIcon}
                  >
                    <Text style={styles.iconText}>{category.icon}</Text>
                  </LinearGradient>
                  <View style={styles.expenseDetails}>
                    <Text style={styles.expenseCategory}>{category.name}</Text>
                    <Text style={styles.expenseDate}>
                      {new Date(expense.date).toLocaleDateString('es-CO', {
                        day: 'numeric',
                        month: 'short'
                      })}
                    </Text>
                  </View>
                  <Text style={styles.expenseAmount}>
                    -{formatCurrency(expense.amount)}
                  </Text>
                </View>
              );
            })
          )}
        </View>

        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.navigate('Agregar')}
        >
          <LinearGradient
            colors={['#8B5CF6', '#6366F1']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.addButtonGradient}
          >
            <Text style={styles.addButtonText}>+ Agregar Gasto</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={showBudgetModal}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <LinearGradient
              colors={['rgba(139, 92, 246, 0.3)', 'rgba(99, 102, 241, 0.1)']}
              style={styles.modalGradient}
            >
              <Text style={styles.modalTitle}>Establecer Presupuesto</Text>
              <TextInput
                style={styles.modalInput}
                value={newBudget}
                onChangeText={setNewBudget}
                placeholder="Ej: 500000"
                placeholderTextColor="#666"
                keyboardType="numeric"
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={styles.modalButton}
                  onPress={() => {
                    setShowBudgetModal(false);
                    setNewBudget('');
                  }}
                >
                  <Text style={styles.modalButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.modalButton}
                  onPress={saveBudget}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  greeting: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  email: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
  logoutButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  logoutGradient: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 20,
  },
  circleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 30,
    position: 'relative',
  },
  circleContent: {
    position: 'absolute',
    alignItems: 'center',
  },
  circleAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  circleLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 30,
  },
  statCard: {
    flex: 1,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  statLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  statAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  seeAll: {
    fontSize: 14,
    color: '#8B5CF6',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 12,
  },
  emptyMessage: {
    fontSize: 16,
    color: '#666',
  },
  expenseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.1)',
  },
  expenseIcon: {
    width: 48,
    height: 48,
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
  expenseDate: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#EC4899',
  },
  addButton: {
    margin: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  addButtonGradient: {
    padding: 18,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    borderRadius: 20,
    overflow: 'hidden',
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