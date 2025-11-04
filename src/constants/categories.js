export const CATEGORIES = [
  { id: 'food', name: 'Alimentación', icon: '🍔', color: '#FF6B6B' },
  { id: 'transport', name: 'Transporte', icon: '🚗', color: '#4ECDC4' },
  { id: 'entertainment', name: 'Entretenimiento', icon: '🎮', color: '#FFE66D' },
  { id: 'shopping', name: 'Compras', icon: '🛍️', color: '#95E1D3' },
  { id: 'health', name: 'Salud', icon: '🏥', color: '#F38181' },
  { id: 'bills', name: 'Facturas', icon: '📄', color: '#AA96DA' },
  { id: 'education', name: 'Educación', icon: '📚', color: '#FCBAD3' },
  { id: 'others', name: 'Otros', icon: '💰', color: '#A8D8EA' }
];

// Iconos disponibles para elegir
export const AVAILABLE_ICONS = [
  '🍔', '🚗', '🎮', '🛍️', '🏥', '📄', '📚', '💰',
  '✈️', '🏠', '💼', '🎬', '🎵', '⚽', '📱', '💻',
  '🎨', '🍕', '☕', '🎓', '🏋️', '🎯', '📷', '🎁'
];

export const getCategoryById = (id, customCategories = []) => {
  // Primero buscar en categorías personalizadas
  const customCat = customCategories.find(cat => cat.id === id);
  if (customCat) return customCat;
  
  // Luego en categorías por defecto
  const defaultCat = CATEGORIES.find(cat => cat.id === id);
  return defaultCat || CATEGORIES[CATEGORIES.length - 1];
};

export const getAllCategories = (customCategories = []) => {
  return [...CATEGORIES, ...customCategories];
};