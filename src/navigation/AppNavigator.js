import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';
import { auth } from '../config/firebase';

// Screens
import AddExpenseScreen from '../screens/AddExpenseScreen';
import HistoryScreen from '../screens/HistoryScreen';
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import ProfileScreen from '../screens/ProfileScreen';
import RegisterScreen from '../screens/RegisterScreen';
import StatisticsScreen from '../screens/StatisticsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Tabs para usuarios autenticados
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: { 
          backgroundColor: '#1a0033',
          borderTopWidth: 0,
          elevation: 0,
          paddingBottom: 5,
          height: 60,
        },
        tabBarActiveTintColor: '#8B5CF6',
        tabBarInactiveTintColor: '#666',
        headerShown: false,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen 
        name="Inicio" 
        component={HomeScreen}
        options={{ 
          tabBarIcon: () => {
            return <Text style={{ fontSize: 24 }}>🏠</Text>;
          }
        }}
      />
      <Tab.Screen 
        name="Agregar" 
        component={AddExpenseScreen}
        options={{ 
          tabBarIcon: () => {
            return <Text style={{ fontSize: 24 }}>➕</Text>;
          }
        }}
      />
      <Tab.Screen 
        name="Estadísticas" 
        component={StatisticsScreen}
        options={{ 
          tabBarIcon: () => {
            return <Text style={{ fontSize: 24 }}>📊</Text>;
          }
        }}
      />
      <Tab.Screen 
        name="Historial" 
        component={HistoryScreen}
        options={{ 
          tabBarIcon: () => {
            return <Text style={{ fontSize: 24 }}>📋</Text>;
          }
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // Firebase Auth persiste la sesión automáticamente en React Native
    // onAuthStateChanged detecta automáticamente si hay una sesión guardada
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      setInitializing(false);
    });

    // Timeout de seguridad - máximo 3 segundos de espera
    const timeout = setTimeout(() => {
      if (initializing) {
        setInitializing(false);
        setLoading(false);
      }
    }, 3000);

    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  if (loading) {
    return (
      <LinearGradient
        colors={['#1a0033', '#0a0015', '#000000']}
        style={styles.splashContainer}
      >
        <Text style={styles.splashIcon}>💰</Text>
        <Text style={styles.splashTitle}>Expense Tracker</Text>
        <ActivityIndicator size="large" color="#8B5CF6" style={styles.loader} />
      </LinearGradient>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen name="Perfil" component={ProfileScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  splashTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 40,
  },
  loader: {
    marginTop: 20,
  },
});