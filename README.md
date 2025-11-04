# 💰 Expense Tracker

<div align="center">

![Expense Tracker](https://img.shields.io/badge/Expense%20Tracker-1.0.0-8B5CF6?style=for-the-badge&logo=react&logoColor=white)
![React Native](https://img.shields.io/badge/React%20Native-0.81.5-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Expo](https://img.shields.io/badge/Expo-54.0.20-000020?style=for-the-badge&logo=expo&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-12.4.0-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)

**Una aplicación moderna y elegante para gestionar tus gastos de manera inteligente**

[Características](#-características) • [Instalación](#-instalación) • [Uso](#-uso) • [Publicación](#-publicación) • [Tecnologías](#-tecnologías)

</div>

---

## 📱 Sobre la Aplicación

**Expense Tracker** es una aplicación móvil desarrollada con React Native y Expo que te permite llevar un control completo de tus finanzas personales. Con una interfaz moderna y oscura, podrás registrar gastos, establecer presupuestos, visualizar estadísticas detalladas y mucho más.

### ✨ Características Principales

- 🏠 **Dashboard Intuitivo**: Visualiza tu presupuesto y gastos del mes en un vistazo
- 💸 **Registro de Gastos**: Agrega gastos rápidamente con categorías personalizables
- 📊 **Estadísticas Detalladas**: Gráficos de pastel y barras para analizar tus gastos por período
- 📋 **Historial Completo**: Revisa, edita o elimina todos tus gastos registrados
- 🎯 **Sistema de Presupuesto**: Establece un presupuesto mensual y controla tu gasto
- 🏷️ **Categorías Personalizadas**: Crea tus propias categorías con iconos personalizados
- 👤 **Perfil y Configuración**: Personaliza la aplicación según tus preferencias
- 🔒 **Seguridad**: Autenticación segura con Firebase Authentication

---

## 🚀 Instalación

### Prerrequisitos

- Node.js (v16 o superior)
- npm o yarn
- Expo CLI
- Cuenta de Firebase (para backend)

### Pasos de Instalación

1. **Clona el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/expense-tracker.git
   cd expense-tracker
   ```

2. **Instala las dependencias**
   ```bash
   npm install
   ```

3. **Configura Firebase**
   
   Crea un archivo `.env` en la raíz del proyecto con tus credenciales de Firebase:
   ```env
   EXPO_PUBLIC_FIREBASE_API_KEY=tu_api_key
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_auth_domain
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=tu_project_id
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_storage_bucket
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_messaging_sender_id
   EXPO_PUBLIC_FIREBASE_APP_ID=tu_app_id
   ```

   > 💡 Puedes usar `.env.example` como plantilla

4. **Inicia la aplicación**
   ```bash
   npm start
   ```

5. **Ejecuta en tu dispositivo**
   - Escanea el código QR con Expo Go (iOS/Android)
   - O presiona `a` para Android emulator / `i` para iOS simulator

---

## 📖 Uso

### Primeros Pasos

1. **Registro/Login**: Crea una cuenta o inicia sesión con tu email
2. **Establece tu Presupuesto**: Toca el card de "Presupuesto" en la pantalla principal
3. **Agrega tu Primer Gasto**: Ve a la pestaña "Agregar" y completa el formulario
4. **Explora tus Estadísticas**: Navega a "Estadísticas" para ver análisis detallados

### Funcionalidades

- **Agregar Gastos**: Selecciona categoría, monto, fecha y agrega una nota opcional
- **Editar Gastos**: Desde "Historial", toca el ícono de editar en cualquier gasto
- **Eliminar Gastos**: Mantén presionado un gasto o usa el botón de eliminar
- **Crear Categorías**: En "Agregar", toca "Nueva" y personaliza tu categoría
- **Ver Estadísticas**: Cambia entre vista Semanal, Mensual o Anual en "Estadísticas"
- **Configuración**: Accede desde el ícono de perfil en la pantalla principal

---

## 🏗️ Arquitectura del Proyecto

```
expense-tracker/
├── src/
│   ├── components/          # Componentes reutilizables
│   ├── config/              # Configuración (Firebase, etc.)
│   ├── constants/           # Constantes y categorías
│   ├── navigation/          # Navegación de la app
│   └── screens/             # Pantallas principales
│       ├── HomeScreen.js
│       ├── AddExpenseScreen.js
│       ├── HistoryScreen.js
│       ├── StatisticsScreen.js
│       ├── LoginScreen.js
│       ├── RegisterScreen.js
│       └── ProfileScreen.js
├── assets/                  # Imágenes y recursos
├── app.json                 # Configuración de Expo
├── app.config.js            # Configuración dinámica
└── package.json             # Dependencias
```

---

## 🛠️ Tecnologías

- **[React Native](https://reactnative.dev/)** - Framework móvil
- **[Expo](https://expo.dev/)** - Herramientas y servicios
- **[Firebase](https://firebase.google.com/)** - Backend (Auth + Firestore)
- **[React Navigation](https://reactnavigation.org/)** - Navegación
- **[Expo Linear Gradient](https://docs.expo.dev/versions/latest/sdk/linear-gradient/)** - Gradientes
- **[React Native Chart Kit](https://github.com/indiespirit/react-native-chart-kit)** - Gráficos

---

## 📱 Publicación

### Preparación para Google Play Store

1. **Configura el Package Name**
   
   Edita `app.config.js`:
   ```javascript
   android: {
     package: "com.tudominio.expensetracker",
     versionCode: 1,
   }
   ```

2. **Genera el APK/AAB**
   ```bash
   eas build --platform android
   ```

3. **Crea una cuenta en Google Play Console**
   - Ve a [Google Play Console](https://play.google.com/console)
   - Crea una nueva aplicación
   - Completa la información requerida

4. **Sube tu Build**
   - Sube el archivo AAB generado
   - Completa la información de la tienda
   - Configura políticas de privacidad
   - Envía para revisión

### Requisitos para Publicación

- ✅ Icono de la aplicación (1024x1024)
- ✅ Imágenes de pantalla (al menos 2)
- ✅ Descripción de la aplicación
- ✅ Política de privacidad
- ✅ Términos de servicio (opcional pero recomendado)

---

## 🎨 Capturas de Pantalla

> 📸 *Agrega capturas de pantalla aquí para mostrar la aplicación*

---

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

---

## 👨‍💻 Autor

**Tu Nombre**

- GitHub: https://github.com/ronal1606
- Email: tu-email@ejemplo.com

---

## 🙏 Agradecimientos

- [Expo](https://expo.dev/) por las herramientas increíbles
- [Firebase](https://firebase.google.com/) por el backend robusto
- La comunidad de React Native por el apoyo continuo

---

<div align="center">

**Hecho con ❤️ usando React Native y Expo**

⭐ Si te gusta este proyecto, ¡dale una estrella!

</div>
