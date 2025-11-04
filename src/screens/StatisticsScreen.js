import { LinearGradient } from 'expo-linear-gradient';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { auth, db } from '../config/firebase';
import { getCategoryById } from '../constants/categories';

const screenWidth = Dimensions.get('window').width;

export default function StatisticsScreen() {
  const [categoryData, setCategoryData] = useState([]);
  const [chartData, setChartData] = useState({ labels: [], datasets: [{ data: [] }] });
  const [totalPeriod, setTotalPeriod] = useState(0);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month'); // 'week', 'month', 'year'

  useEffect(() => {
    loadStatistics();
  }, [period]);

  const loadStatistics = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const { startDate, labels } = getPeriodDates();

      const expensesRef = collection(db, 'users', user.uid, 'expenses');
      const q = query(
        expensesRef,
        where('date', '>=', startDate.toISOString())
      );

      const snapshot = await getDocs(q);
      const expenses = [];
      
      snapshot.forEach((doc) => {
        expenses.push({ id: doc.id, ...doc.data() });
      });

      // Gastos por categoría
      const categoryTotals = {};
      let total = 0;

      expenses.forEach((expense) => {
        total += expense.amount;
        if (categoryTotals[expense.category]) {
          categoryTotals[expense.category] += expense.amount;
        } else {
          categoryTotals[expense.category] = expense.amount;
        }
      });

      const pieData = Object.keys(categoryTotals).map((catId) => {
        const category = getCategoryById(catId);
        const brightColors = {
          'food': '#FF6B9D',
          'transport': '#00D9FF',
          'entertainment': '#FFE66D',
          'shopping': '#95E1D3',
          'health': '#F38181',
          'bills': '#C77DFF',
          'education': '#FCBAD3',
          'others': '#A8E6CF'
        };
        return {
          name: category.name,
          amount: categoryTotals[catId],
          color: brightColors[catId] || category.color,
          legendFontColor: '#E5E7EB',
          legendFontSize: 13,
        };
      }).sort((a, b) => b.amount - a.amount);

      // Gastos por período
      const periodData = {};
      labels.forEach(label => periodData[label] = 0);
      
      expenses.forEach((expense) => {
        const date = new Date(expense.date);
        const label = getDateLabel(date);
        if (periodData[label] !== undefined) {
          periodData[label] += expense.amount;
        }
      });

      const barData = {
        labels: labels,
        datasets: [{
          data: labels.map(l => {
            const value = periodData[l] / 1000;
            return value > 0 ? value : 0;
          }),
        }],
      };

      setCategoryData(pieData);
      setChartData(barData);
      setTotalPeriod(total);
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPeriodDates = () => {
    const now = new Date();
    let startDate = new Date();
    let labels = [];

    if (period === 'week') {
      // Última semana (7 días)
      startDate.setDate(now.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);
      
      // Generar etiquetas para cada día de la semana
      for (let i = 0; i < 7; i++) {
        const day = new Date(startDate);
        day.setDate(startDate.getDate() + i);
        labels.push(day.getDate().toString());
      }
    } else if (period === 'month') {
      // Mes actual
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      startDate.setHours(0, 0, 0, 0);
      
      // Agrupar en 4 semanas
      labels = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'];
    } else { // year
      // Año actual
      startDate = new Date(now.getFullYear(), 0, 1);
      labels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    }

    return { startDate, labels };
  };

  const getDateLabel = (date) => {
    if (period === 'week') {
      return date.getDate().toString();
    } else if (period === 'month') {
      // Determinar en qué semana del mes está
      const dayOfMonth = date.getDate();
      if (dayOfMonth <= 7) return 'Sem 1';
      if (dayOfMonth <= 14) return 'Sem 2';
      if (dayOfMonth <= 21) return 'Sem 3';
      return 'Sem 4';
    } else {
      const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      return monthNames[date.getMonth()];
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getPeriodLabel = () => {
    if (period === 'week') return 'Esta Semana';
    if (period === 'month') return 'Este Mes';
    return 'Este Año';
  };

  if (loading) {
    return (
      <LinearGradient
        colors={['#1a0033', '#0a0015', '#000000']}
        style={styles.container}
      >
        <Text style={styles.loadingText}>Cargando estadísticas...</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#1a0033', '#0a0015', '#000000']}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.title}>Estadísticas</Text>

          {/* Filtros de período */}
          <View style={styles.periodSelector}>
            <TouchableOpacity
              style={[styles.periodButton, period === 'week' && styles.periodButtonActive]}
              onPress={() => setPeriod('week')}
            >
              <Text style={[styles.periodText, period === 'week' && styles.periodTextActive]}>
                Semana
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.periodButton, period === 'month' && styles.periodButtonActive]}
              onPress={() => setPeriod('month')}
            >
              <Text style={[styles.periodText, period === 'month' && styles.periodTextActive]}>
                Mes
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.periodButton, period === 'year' && styles.periodButtonActive]}
              onPress={() => setPeriod('year')}
            >
              <Text style={[styles.periodText, period === 'year' && styles.periodTextActive]}>
                Año
              </Text>
            </TouchableOpacity>
          </View>

          <LinearGradient
            colors={['rgba(139, 92, 246, 0.3)', 'rgba(99, 102, 241, 0.1)']}
            style={styles.totalCard}
          >
            <Text style={styles.totalLabel}>Total Gastado - {getPeriodLabel()}</Text>
            <Text style={styles.totalAmount}>{formatCurrency(totalPeriod)}</Text>
          </LinearGradient>

          {categoryData.length > 0 ? (
            <>
              <Text style={styles.sectionTitle}>Gastos por Categoría</Text>
              <View style={styles.chartContainer}>
                <PieChart
                  data={categoryData}
                  width={screenWidth - 40}
                  height={220}
                  chartConfig={{
                    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  }}
                  accessor="amount"
                  backgroundColor="transparent"
                  paddingLeft="15"
                  absolute
                />
              </View>

              <View style={styles.categoryList}>
                {categoryData.map((item, index) => (
                  <LinearGradient
                    key={index}
                    colors={['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.04)']}
                    style={styles.categoryItem}
                  >
                    <View style={styles.categoryInfo}>
                      <View style={[styles.colorDot, { backgroundColor: item.color }]} />
                      <Text style={styles.categoryItemName}>{item.name}</Text>
                    </View>
                    <View style={styles.categoryStats}>
                      <Text style={styles.categoryAmount}>
                        {formatCurrency(item.amount)}
                      </Text>
                      <Text style={styles.categoryPercent}>
                        {((item.amount / totalPeriod) * 100).toFixed(1)}%
                      </Text>
                    </View>
                  </LinearGradient>
                ))}
              </View>

              {chartData.labels && chartData.labels.length > 0 && 
               chartData.datasets[0].data.some(val => val > 0) && (
                <>
                  <Text style={styles.sectionTitle}>Gastos por Período (Miles)</Text>
                  <View style={styles.chartContainer}>
                    <BarChart
                      data={chartData}
                      width={screenWidth - 40}
                      height={220}
                      chartConfig={{
                        backgroundColor: '#1a0033',
                        backgroundGradientFrom: '#1a0033',
                        backgroundGradientTo: '#1a0033',
                        decimalPlaces: 1,
                        color: (opacity = 1) => `rgba(139, 92, 246, ${opacity})`,
                        labelColor: (opacity = 1) => `rgba(229, 231, 235, ${opacity})`,
                        style: {
                          borderRadius: 16,
                        },
                        propsForLabels: {
                          fontSize: 12,
                        },
                        formatYLabel: (value) => {
                          const num = parseFloat(value);
                          if (num === 0) return '0';
                          if (num < 1) return num.toFixed(1);
                          return num.toFixed(0);
                        },
                      }}
                      style={styles.barChart}
                      showValuesOnTopOfBars
                      fromZero
                      withInnerLines={false}
                      yAxisLabel=""
                      yAxisSuffix="k"
                    />
                  </View>
                </>
              )}
            </>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📊</Text>
              <Text style={styles.emptyText}>No hay datos en este período</Text>
              <Text style={styles.emptySubText}>
                Agrega gastos para ver tus estadísticas
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
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
    marginBottom: 20,
  },
  loadingText: {
    color: '#9CA3AF',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 100,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 4,
    marginBottom: 20,
    gap: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#8B5CF6',
  },
  periodText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  periodTextActive: {
    color: '#fff',
  },
  totalCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.5)',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    color: '#E5E7EB',
    marginBottom: 8,
  },
  totalAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    marginTop: 10,
  },
  chartContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  barChart: {
    borderRadius: 16,
  },
  categoryList: {
    marginBottom: 20,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  colorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 12,
  },
  categoryItemName: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  categoryStats: {
    alignItems: 'flex-end',
  },
  categoryAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  categoryPercent: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    marginTop: 50,
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
});