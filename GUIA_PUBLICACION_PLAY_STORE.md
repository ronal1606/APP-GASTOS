# 📱 Guía Completa para Publicar en Google Play Store

Esta guía te llevará paso a paso para publicar tu aplicación Expense Tracker en Google Play Store.

---

## 📋 Requisitos Previos

### 1. Cuenta de Desarrollador de Google Play
- **Costo**: $25 USD (pago único de por vida)
- **Registro**: Ve a [Google Play Console](https://play.google.com/console/signup)
- **Proceso**: Completa el formulario y realiza el pago

### 2. Preparar tu Aplicación

#### Configuración en `app.config.js`
Asegúrate de tener configurado:
```javascript
android: {
  package: "com.tudominio.expensetracker", // Cambia esto por tu dominio
  versionCode: 1,
}
```

#### Instalar EAS CLI (Expo Application Services)
```bash
npm install -g eas-cli
```

#### Iniciar sesión en Expo
```bash
eas login
```

---

## 🚀 Paso 1: Configurar el Proyecto para Producción

### 1.1 Crear cuenta en Expo (si no tienes)
```bash
npx expo register
# O si ya tienes cuenta:
npx expo login
```

### 1.2 Configurar EAS Build
```bash
eas build:configure
```

Esto creará un archivo `eas.json`. Revísalo y ajusta según tus necesidades.

---

## 🏗️ Paso 2: Generar el APK/AAB

### 2.1 Build para Android
```bash
eas build --platform android
```

**Opciones disponibles:**
- `--profile production` - Para producción
- `--profile preview` - Para pruebas internas

### 2.2 Durante el Build
- Expo te pedirá confirmar algunos detalles
- El proceso puede tardar 15-30 minutos
- Recibirás un enlace para descargar el archivo cuando termine

### 2.3 Descargar el Build
- Ve al enlace proporcionado
- Descarga el archivo `.aab` (Android App Bundle) - **RECOMENDADO**
- O el `.apk` si prefieres

---

## 📝 Paso 3: Preparar Contenido para la Tienda

### 3.1 Assets Necesarios

#### Icono de la App
- **Tamaño**: 512x512 px (PNG, sin transparencia)
- **Ubicación**: Ya tienes en `assets/images/icon.png`

#### Imágenes de Pantalla (Screenshots)
- **Mínimo**: 2 imágenes
- **Recomendado**: 4-8 imágenes
- **Tamaños**:
  - Teléfono: 320px - 3840px (ancho o alto)
  - Tablet: 320px - 3840px
- **Formato**: PNG o JPEG
- **Aspecto**: 16:9 o 9:16

**Cómo tomar screenshots:**
1. Ejecuta la app en un emulador o dispositivo
2. Toma capturas de las pantallas principales
3. Edítalas si es necesario (puedes usar herramientas online)

#### Imagen de Banner (Opcional pero recomendado)
- **Tamaño**: 1024x500 px
- **Formato**: PNG o JPEG

#### Video Promocional (Opcional)
- **Duración**: 30 segundos - 2 minutos
- **Formato**: YouTube (sube a YouTube y proporciona el enlace)

### 3.2 Textos Necesarios

#### Título de la App
- **Máximo**: 50 caracteres
- **Ejemplo**: "Expense Tracker - Control de Gastos"

#### Descripción Corta
- **Máximo**: 80 caracteres
- **Ejemplo**: "Gestiona tus gastos de manera inteligente"

#### Descripción Completa
- **Máximo**: 4000 caracteres
- **Incluye**:
  - Qué hace la app
  - Características principales
  - Beneficios
  - Cómo usar

**Ejemplo de descripción:**
```
Expense Tracker es una aplicación moderna para gestionar tus finanzas personales.

CARACTERÍSTICAS:
• Registro rápido de gastos con categorías personalizables
• Sistema de presupuesto mensual
• Estadísticas detalladas con gráficos
• Historial completo de gastos
• Interfaz intuitiva y moderna
• Sincronización en la nube

BENEFICIOS:
- Control total de tus gastos
- Visualiza dónde gastas más dinero
- Alcanza tus metas financieras
- Toma decisiones informadas

¡Comienza a controlar tus finanzas hoy mismo!
```

---

## 🎯 Paso 4: Crear la Aplicación en Play Console

### 4.1 Crear Nueva App
1. Ve a [Google Play Console](https://play.google.com/console)
2. Click en "Crear aplicación"
3. Completa:
   - **Nombre de la app**: Expense Tracker
   - **Idioma predeterminado**: Español
   - **Tipo de app**: App
   - **Gratis o de pago**: Gratis
   - **Declaración de cumplimiento**: Acepta los términos

### 4.2 Configurar Información de la Tienda

#### Pestaña "Principal"
- **Título**: Expense Tracker
- **Descripción corta**: Gestiona tus gastos de manera inteligente
- **Descripción completa**: (Usa el texto preparado arriba)
- **Icono**: Sube tu icono de 512x512
- **Screenshots**: Sube tus capturas de pantalla
- **Categoría**: Finanzas
- **Clasificación de contenido**: PEGI 3 (o equivalente)

#### Pestaña "Gráficos"
- **Banner de funciones destacadas**: 1024x500 (opcional)
- **Video**: Enlace de YouTube (opcional)

#### Pestaña "Catálogo"
- **Precio**: Gratis
- **Países**: Selecciona donde estará disponible

---

## 🔒 Paso 5: Configurar Privacidad y Seguridad

### 5.1 Política de Privacidad
**REQUERIDO** - Debes tener una política de privacidad. Puedes:

1. **Crear una página web simple** (puedes usar GitHub Pages gratis):
   - Crea un archivo HTML con tu política
   - Sube a GitHub Pages
   - Obtén la URL: `https://tu-usuario.github.io/privacy-policy`

2. **Usar un generador**:
   - [Privacy Policy Generator](https://www.privacypolicygenerator.info/)
   - [FreePrivacyPolicy](https://www.freeprivacypolicy.com/)

**Contenido mínimo:**
- Qué datos recopilas (email, gastos)
- Cómo los usas (sincronización)
- Cómo los almacenas (Firebase)
- Derechos del usuario
- Contacto

### 5.2 Declaración de Permisos
En Play Console, declara:
- **Internet**: Para sincronizar con Firebase
- **Estado de red**: Para verificar conexión

### 5.3 Formulario de Datos de Seguridad
- Completa el cuestionario sobre datos sensibles
- Para tu app: Solo datos de gastos personales (no sensibles)

---

## 📦 Paso 6: Subir el Build

### 6.1 Crear Versión de Producción
1. En Play Console, ve a "Producción" → "Crear nueva versión"
2. Sube el archivo `.aab` que descargaste
3. Completa las "Notas de la versión":
   ```
   Versión 1.0.0
   - Primera versión de Expense Tracker
   - Registro y gestión de gastos
   - Sistema de presupuesto
   - Estadísticas y gráficos
   - Categorías personalizables
   ```

### 6.2 Revisar Contenido
- Verifica que toda la información esté completa
- Revisa las capturas de pantalla
- Confirma que la política de privacidad esté vinculada

---

## ✅ Paso 7: Enviar para Revisión

### 7.1 Verificaciones Finales
Antes de enviar, verifica:
- ✅ Build subido correctamente
- ✅ Toda la información de la tienda completa
- ✅ Política de privacidad vinculada
- ✅ Icono y screenshots subidos
- ✅ Descripción completa y clara
- ✅ Categoría seleccionada
- ✅ Precio configurado

### 7.2 Enviar para Revisión
1. Click en "Enviar para revisión"
2. Espera la confirmación
3. **Tiempo de revisión**: 1-3 días (típicamente 24-48 horas)

---

## 📊 Paso 8: Seguimiento y Publicación

### 8.1 Durante la Revisión
- Revisa tu email regularmente
- Google puede pedirte cambios o aclaraciones
- Responde lo antes posible

### 8.2 Si la App es Aprobada
- Recibirás una notificación
- La app estará disponible en 1-2 horas
- Comparte el enlace con tus amigos

### 8.3 Si Hay Problemas
- Google te indicará qué corregir
- Haz los cambios necesarios
- Reenvía para revisión

---

## 🔄 Paso 9: Actualizaciones Futuras

### 9.1 Actualizar la Versión
1. Incrementa `versionCode` en `app.config.js`:
   ```javascript
   android: {
     versionCode: 2, // Incrementa este número
   }
   ```

2. Genera nuevo build:
   ```bash
   eas build --platform android --profile production
   ```

3. Sube a Play Console:
   - Ve a "Producción" → "Crear nueva versión"
   - Sube el nuevo `.aab`
   - Agrega notas de la versión

---

## 💡 Consejos Adicionales

### Mejores Prácticas
- **Actualiza regularmente**: Mantén la app actualizada
- **Responde comentarios**: Interactúa con los usuarios
- **Monitorea métricas**: Revisa estadísticas en Play Console
- **Prueba beta**: Usa "Prueba interna" antes de producción

### Optimización
- **ASO (App Store Optimization)**:
  - Usa palabras clave en el título y descripción
  - Mantén descripciones claras
  - Actualiza screenshots regularmente

### Promoción
- Comparte en redes sociales
- Crea un video promocional
- Pide a amigos que prueben y comenten
- Considera publicidad (opcional)

---

## 📞 Soporte y Recursos

### Recursos Oficiales
- [Documentación de Google Play Console](https://support.google.com/googleplay/android-developer)
- [Guía de Expo para Play Store](https://docs.expo.dev/submit/android/)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)

### Problemas Comunes

**Error en el build:**
- Verifica que `app.config.js` esté correcto
- Revisa los logs de EAS Build
- Asegúrate de tener todas las dependencias instaladas

**App rechazada:**
- Lee el motivo del rechazo
- Corrige los problemas indicados
- Vuelve a enviar

---

## ✅ Checklist Final

Antes de enviar, verifica:

- [ ] Cuenta de desarrollador creada y pagada
- [ ] Build generado y descargado
- [ ] Icono de 512x512 preparado
- [ ] Mínimo 2 screenshots tomados
- [ ] Descripción completa escrita
- [ ] Política de privacidad creada y publicada
- [ ] Información de la tienda completa
- [ ] Build subido a Play Console
- [ ] Todo revisado y verificado
- [ ] Enviado para revisión

---

**¡Éxito con tu publicación! 🎉**

Si tienes dudas durante el proceso, consulta la documentación oficial o busca en foros de la comunidad de Expo/React Native.

