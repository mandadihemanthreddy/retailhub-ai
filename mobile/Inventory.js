import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  ActivityIndicator,
  Alert,
  Platform
} from 'react-native';
import { supabase } from './supabaseClient';

const BACKEND_URL = "http://10.124.18.203:5000";

export default function Inventory({ session }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [csvText, setCsvText] = useState("");

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/products`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) fetchProducts();
  }, [session]);

  const handleBulkImport = async () => {
    if (!csvText.trim()) return Alert.alert("Input Required", "Please paste CSV data first.");
    setIsImporting(true);
    try {
      const res = await fetch(`${BACKEND_URL}/upload`, {
        method: "POST",
        headers: { 
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ csvText })
      });
      if (res.ok) {
        Alert.alert("Success", "AI has successfully mapped and imported your data!");
        setCsvText("");
        fetchProducts();
      } else {
        Alert.alert("Error", "Failed to process data. Check format.");
      }
    } catch (err) {
      Alert.alert("Network Error", "Could not connect to AI engine.");
    } finally {
      setIsImporting(false);
    }
  };

  const deleteProduct = async (id) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (!error) fetchProducts();
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <View style={styles.center}><ActivityIndicator color="#3b82f6" size="large"/></View>;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{paddingBottom: 40}}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>📦 Catalog</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => Alert.alert("Feature", "Single product entry coming soon!")}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <TextInput 
        style={styles.searchInput}
        placeholder="Search inventory..."
        placeholderTextColor="#94a3b8"
        value={search}
        onChangeText={setSearch}
      />

      <View style={styles.importBox}>
        <Text style={styles.importTitle}>AI Bulk Ingestion</Text>
        <TextInput 
          style={styles.textArea}
          placeholder="Paste CSV rows here..."
          placeholderTextColor="#71717a"
          multiline
          value={csvText}
          onChangeText={setCsvText}
        />
        <TouchableOpacity 
          style={[styles.importBtn, isImporting && {opacity: 0.5}]} 
          onPress={handleBulkImport}
          disabled={isImporting}
        >
          {isImporting ? <ActivityIndicator color="white"/> : <Text style={styles.importBtnText}>Process with AI</Text>}
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Stock List ({filteredProducts.length})</Text>
      {filteredProducts.map((p, i) => (
        <View key={i} style={styles.row}>
          <View style={{flex: 1}}>
            <Text style={styles.pName}>{p.name}</Text>
            <Text style={styles.pPrice}>${p.price}</Text>
          </View>
          <View style={styles.rightCol}>
            <View style={[styles.badge, p.stock < 10 ? styles.lowBadge : styles.highBadge]}>
              <Text style={styles.badgeText}>{p.stock} units</Text>
            </View>
            <TouchableOpacity onPress={() => deleteProduct(p.id)} style={styles.delBtn}>
              <Text style={{color: '#ef4444', fontSize: 12}}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#09090b' },
  container: { flex: 1, backgroundColor: '#09090b', padding: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  addBtn: { backgroundColor: '#3b82f6', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  addBtnText: { color: 'white', fontWeight: 'bold' },
  searchInput: { backgroundColor: '#18181b', color: 'white', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#27272a', marginBottom: 20 },
  importBox: { backgroundColor: '#18181b', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#3b82f644', marginBottom: 24 },
  importTitle: { color: '#3b82f6', fontWeight: 'bold', marginBottom: 8 },
  textArea: { backgroundColor: '#09090b', color: 'white', borderHeight: 80, borderRadius: 8, padding: 10, textAlignVertical: 'top', color: '#e4e4e7', fontSize: 12, minHeight: 60, marginBottom: 12 },
  importBtn: { backgroundColor: '#3b82f6', padding: 12, borderRadius: 8, alignItems: 'center' },
  importBtnText: { color: 'white', fontWeight: 'bold' },
  sectionTitle: { color: '#94a3b8', fontSize: 14, fontWeight: '600', marginBottom: 12, textTransform: 'uppercase' },
  row: { flexDirection: 'row', backgroundColor: '#18181b', padding: 16, borderRadius: 12, marginBottom: 10, borderLeftWidth: 4, borderLeftColor: '#3b82f6' },
  pName: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  pPrice: { color: '#22c55e', fontSize: 14, marginTop: 4 },
  rightCol: { alignItems: 'flex-end', justifyContent: 'center' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  lowBadge: { backgroundColor: '#ef444422' },
  highBadge: { backgroundColor: '#22c55e22' },
  badgeText: { fontSize: 12, fontWeight: '600', color: 'white' },
  delBtn: { marginTop: 8 }
});
