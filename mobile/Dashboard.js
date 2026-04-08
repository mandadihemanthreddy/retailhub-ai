import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions, ActivityIndicator, TouchableOpacity, Platform, Alert } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { MaterialCommunityIcons } from "@expo/vector-icons";

const screenWidth = Dimensions.get("window").width;
const BACKEND_URL = "http://10.124.18.203:5000";

export default function Dashboard({ session }) {
  const [products, setProducts] = useState([]);
  const [sortBy, setSortBy] = useState('sales');

  useEffect(() => {
    if (!session) return;
    fetch(`${BACKEND_URL}/products`, {
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      }
    })
      .then(res => res.json())

      .then(data => setProducts(data))
      .catch(err => console.error(err));
  }, []);

  if (products.length === 0) {
    return <View style={styles.center}><ActivityIndicator color="#3b82f6" size="large"/></View>;
  }

  const sortedProducts = [...products].sort((a, b) => b[sortBy] - a[sortBy]).slice(0, 5);

  const data = {
    labels: sortedProducts.map(p => p.name.split(' ')[0]),
    datasets: [
      {
        data: sortedProducts.map(p => p[sortBy]),
      }
    ]
  };

  const chartConfig = {
    backgroundGradientFrom: "#18181b",
    backgroundGradientTo: "#18181b",
    color: (opacity = 1) => sortBy === 'sales' ? `rgba(59, 130, 246, ${Math.max(opacity, 0.4)})` : `rgba(34, 197, 94, ${Math.max(opacity, 0.4)})`,
    strokeWidth: 2, 
    barPercentage: 0.7,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
    propsForLabels: {
      fontSize: 10,
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{paddingBottom: 40}}>
      <View style={styles.toggleRow}>
        <TouchableOpacity style={[styles.toggleBtn, sortBy === 'sales' && styles.activeBtn]} onPress={() => setSortBy('sales')}>
          <Text style={styles.btnText}>Sales</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.toggleBtn, sortBy === 'stock' && styles.activeBtn]} onPress={() => setSortBy('stock')}>
          <Text style={styles.btnText}>Stock</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.toggleBtn, sortBy === 'price' && styles.activeBtn]} onPress={() => setSortBy('price')}>
          <Text style={styles.btnText}>Price</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Top {sortBy === 'sales' ? 'Selling' : 'Stocked'} Products</Text>
        <BarChart
          style={styles.chart}
          data={data}
          width={screenWidth - 48}
          height={220}
          yAxisLabel=""
          chartConfig={chartConfig}
          verticalLabelRotation={30}
          showValuesOnTopOfBars={true}
          fromZero={true}
        />
      </View>

      <View style={styles.headerRow}>
        <View style={{flexDirection:'row', alignItems:'center', gap:8}}>
          <MaterialCommunityIcons name="archive-outline" size={24} color="#3b82f6" />
          <Text style={styles.listTitle}>Inventory Details</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => Alert.alert("Feature", "Single product entry coming soon!")}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {sortedProducts.map((p, i) => (
        <View key={i} style={[styles.productRow, p.stock < 10 && styles.lowStockRow]}>
          <View style={{flex: 1}}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
              <Text style={styles.productName}>{p.name}</Text>
              {p.stock < 10 ? <MaterialCommunityIcons name="alert-circle-outline" size={16} color="#ef4444" /> : null}
            </View>
            <Text style={styles.productPrice}>${p.price}</Text>
          </View>
          <View style={styles.statsCol}>
            <Text style={styles.statsText}>Stock: {p.stock}</Text>
            <Text style={styles.statsText}>Sales: {p.sales}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#09090b' },
  container: { flex: 1, backgroundColor: '#09090b', padding: 16 },
  toggleRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  toggleBtn: { flex: 1, padding: 10, borderRadius: 8, backgroundColor: '#27272a', alignItems: 'center' },
  activeBtn: { backgroundColor: '#3b82f6' },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 13 },
  chartCard: { backgroundColor: '#18181b', borderRadius: 16, padding: 8, marginBottom: 24, borderWidth: 1, borderColor: '#27272a' },
  chartTitle: { color: 'white', fontSize: 16, fontWeight: 'bold', marginBottom: 12, marginLeft: 8 },
  chart: { borderRadius: 8 },
  listTitle: { color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 12, marginLeft: 4 },
  productRow: { flexDirection: 'row', backgroundColor: '#18181b', padding: 16, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#27272a' },
  lowStockRow: { borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)' },
  productName: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  productPrice: { color: '#22c55e', fontSize: 14, marginTop: 4 },
  statsCol: { alignItems: 'flex-end', justifyContent: 'center' },
  statsText: { color: '#a1a1aa', fontSize: 13, marginTop: 4 },
});
