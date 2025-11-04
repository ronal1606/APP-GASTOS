import { LinearGradient } from 'expo-linear-gradient';
import { signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth, db } from '../config/firebase';

export default function ProfileScreen({ navigation }) {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [currency, setCurrency] = useState('COP');
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [showNameModal, setShowNameModal] = useState(false);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists() && userDoc.data().displayName) {
        setDisplayName(userDoc.data().displayName);
      } else {
        setDisplayName(user.email?.split('@')[0] || 'Usuario');
      }
      
      const settingsDoc = await getDoc(doc(db, 'users', user.uid, 'settings', 'preferences'));
      if (settingsDoc.exists()) {
        const data = settingsDoc.data();
        setNotificationsEnabled(data.notificationsEnabled ?? true);
        setCurrency(data.currency || 'COP');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      
      await setDoc(doc(db, 'users', user.uid, 'settings', 'preferences'), {
        notificationsEnabled,
        currency,
      }, { merge: true });
      
      Alert.alert('¡Éxito!', 'Configuración guardada');
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar la configuración');
    }
  };

  const saveDisplayName = async () => {
    if (!editName.trim()) {
      Alert.alert('Error', 'El nombre no puede estar vacío');
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) return;
      
      await setDoc(doc(db, 'users', user.uid), {
        displayName: editName.trim(),
        email: user.email,
      }, { merge: true });
      
      setDisplayName(editName.trim());
      setShowNameModal(false);
      setEditName('');
      Alert.alert('¡Éxito!', 'Nombre actualizado correctamente');
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el nombre');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas salir?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Salir', 
          onPress: async () => {
            try {
              await signOut(auth);
            } catch (error) {
              Alert.alert('Error', 'No se pudo cerrar sesión');
            }
          }
        }
      ]
    );
  };

  const menuItems = [
    {
      id: 'settings',
      icon: '⚙️',
      title: 'Configuración',
      subtitle: 'Ajustes de la aplicación',
      onPress: () => setShowCurrencyModal(true),
    },
    {
      id: 'about',
      icon: 'ℹ️',
      title: 'Acerca de',
      subtitle: 'Información de la app',
      onPress: () => Alert.alert(
        'Expense Tracker',
        'Versión 1.0.0\n\nUna aplicación para gestionar tus gastos de manera inteligente y eficiente.\n\nDesarrollado con ❤️ usando React Native y Expo.',
        [{ text: 'OK' }]
      ),
    },
    {
      id: 'privacy',
      icon: '🔒',
      title: 'Privacidad',
      subtitle: 'Política de privacidad',
      onPress: () => Alert.alert(
        'Política de Privacidad',
        'Tus datos están seguros con nosotros. Toda la información se almacena de forma cifrada y solo tú tienes acceso a tus gastos personales.',
        [{ text: 'OK' }]
      ),
    },
    {
      id: 'help',
      icon: '❓',
      title: 'Ayuda',
      subtitle: 'Preguntas frecuentes',
      onPress: () => Alert.alert(
        'Ayuda',
        '¿Cómo usar la app?\n\n• Agrega gastos desde la pestaña "Agregar"\n• Revisa tu presupuesto en "Inicio"\n• Visualiza estadísticas en "Estadísticas"\n• Edita o elimina gastos desde "Historial"',
        [{ text: 'OK' }]
      ),
    },
    {
      id: 'logout',
      icon: '🚪',
      title: 'Cerrar Sesión',
      subtitle: 'Salir de tu cuenta',
      onPress: handleLogout,
      danger: true,
    },
  ];

  const currencies = [
    { code: 'COP', name: 'Peso Colombiano', symbol: '$' },
    { code: 'USD', name: 'Dólar Estadounidense', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'MXN', name: 'Peso Mexicano', symbol: '$' },
  ];

  return (
    <LinearGradient
      colors={['#1a0033', '#0a0015', '#000000']}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.profileHeader}>
            <LinearGradient
              colors={['#8B5CF6', '#6366F1']}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>
                {auth.currentUser?.email?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </LinearGradient>
            <View style={styles.profileInfo}>
              <TouchableOpacity onPress={() => {
                setEditName(displayName);
                setShowNameModal(true);
              }}>
                <View style={styles.nameContainer}>
                  <Text style={styles.profileName}>
                    {displayName || auth.currentUser?.email?.split('@')[0] || 'Usuario'}
                  </Text>
                  <Text style={styles.editIcon}>✏️</Text>
                </View>
              </TouchableOpacity>
              <Text style={styles.profileEmail}>
                {auth.currentUser?.email || ''}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.menuContainer}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <LinearGradient
                colors={item.danger 
                  ? ['rgba(239, 68, 68, 0.2)', 'rgba(220, 38, 38, 0.1)']
                  : ['rgba(139, 92, 246, 0.2)', 'rgba(99, 102, 241, 0.1)']
                }
                style={styles.menuItemGradient}
              >
                <View style={styles.menuItemLeft}>
                  <Text style={styles.menuItemIcon}>{item.icon}</Text>
                  <View style={styles.menuItemText}>
                    <Text style={[
                      styles.menuItemTitle,
                      item.danger && styles.menuItemTitleDanger
                    ]}>
                      {item.title}
                    </Text>
                    <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
                  </View>
                </View>
                <Text style={styles.menuItemArrow}>›</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Expense Tracker v1.0.0</Text>
          <Text style={styles.footerSubtext}>© 2024 Todos los derechos reservados</Text>
        </View>
      </ScrollView>

      {/* Modal de Configuración */}
      <Modal
        visible={showCurrencyModal}
        transparent
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <LinearGradient
              colors={['rgba(139, 92, 246, 0.3)', 'rgba(99, 102, 241, 0.1)']}
              style={styles.modalGradient}
            >
              <Text style={styles.modalTitle}>Configuración</Text>

              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Notificaciones</Text>
                  <Text style={styles.settingDescription}>
                    Recibe alertas sobre tu presupuesto
                  </Text>
                </View>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  trackColor={{ false: '#767577', true: '#8B5CF6' }}
                  thumbColor={notificationsEnabled ? '#fff' : '#f4f3f4'}
                />
              </View>

              <Text style={styles.label}>Moneda</Text>
              <View style={styles.currencyList}>
                {currencies.map((curr) => (
                  <TouchableOpacity
                    key={curr.code}
                    style={[
                      styles.currencyItem,
                      currency === curr.code && styles.currencyItemActive
                    ]}
                    onPress={() => setCurrency(curr.code)}
                  >
                    <Text style={styles.currencySymbol}>{curr.symbol}</Text>
                    <View style={styles.currencyInfo}>
                      <Text style={[
                        styles.currencyCode,
                        currency === curr.code && styles.currencyCodeActive
                      ]}>
                        {curr.code}
                      </Text>
                      <Text style={[
                        styles.currencyName,
                        currency === curr.code && styles.currencyNameActive
                      ]}>
                        {curr.name}
                      </Text>
                    </View>
                    {currency === curr.code && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={styles.modalButton}
                  onPress={() => setShowCurrencyModal(false)}
                >
                  <Text style={styles.modalButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.modalButton}
                  onPress={() => {
                    saveSettings();
                    setShowCurrencyModal(false);
                  }}
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

      {/* Modal de Editar Nombre */}
      <Modal
        visible={showNameModal}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <LinearGradient
              colors={['rgba(139, 92, 246, 0.3)', 'rgba(99, 102, 241, 0.1)']}
              style={styles.modalGradient}
            >
              <Text style={styles.modalTitle}>Editar Nombre</Text>
              <TextInput
                style={styles.modalInput}
                value={editName}
                onChangeText={setEditName}
                placeholder="Ingresa tu nombre"
                placeholderTextColor="#666"
                maxLength={30}
                autoFocus
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={styles.modalButton}
                  onPress={() => {
                    setShowNameModal(false);
                    setEditName('');
                  }}
                >
                  <Text style={styles.modalButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.modalButton}
                  onPress={saveDisplayName}
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
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileInfo: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  editIcon: {
    fontSize: 16,
    opacity: 0.7,
  },
  profileEmail: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  menuContainer: {
    padding: 20,
  },
  menuItem: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  menuItemGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    borderRadius: 16,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemIcon: {
    fontSize: 28,
    marginRight: 16,
  },
  menuItemText: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  menuItemTitleDanger: {
    color: '#EF4444',
  },
  menuItemSubtitle: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  menuItemArrow: {
    fontSize: 24,
    color: '#8B5CF6',
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
    padding: 30,
    marginBottom: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#444',
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
    marginBottom: 24,
    textAlign: 'center',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 24,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  label: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 12,
    marginTop: 12,
  },
  currencyList: {
    marginBottom: 24,
  },
  currencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  currencyItemActive: {
    borderColor: '#8B5CF6',
    borderWidth: 2,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B5CF6',
    marginRight: 12,
    width: 30,
  },
  currencyInfo: {
    flex: 1,
  },
  currencyCode: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  currencyCodeActive: {
    color: '#8B5CF6',
  },
  currencyName: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  currencyNameActive: {
    color: '#B8B5FF',
  },
  checkmark: {
    fontSize: 20,
    color: '#8B5CF6',
    fontWeight: 'bold',
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

