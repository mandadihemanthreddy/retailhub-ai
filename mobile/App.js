import React, { useState, useRef, useEffect } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  RefreshControl,
  ActivityIndicator
} from "react-native";
import { supabase } from "./supabaseClient";
import Auth from "./components/Auth";
import Dashboard from "./Dashboard";
import Inventory from "./Inventory";

// 🚀 DYNAMIC IP CONFIGURATION
// Verified Local IP: 10.124.18.203
const BACKEND_URL = Platform.OS === 'android' ? "http://10.124.18.203:5000" : "http://10.124.18.203:5000";
// For Android Emulator (if local IP fails): Use http://10.0.2.2:5000



export default function App() {
  const [session, setSession] = useState(null);
  const [activeTab, setActiveTab] = useState("chat");
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const scrollViewRef = useRef();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  const handleSignOut = () => supabase.auth.signOut();

  const fetchHistory = async () => {
    if (!session) return;
    setRefreshing(true);
    try {
      console.log(`Attempting to fetch history from: ${BACKEND_URL}/history/${session.user.id}`);
      const res = await fetch(`${BACKEND_URL}/history/${session.user.id}`, {

        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      const data = await res.json();
      if (data && data.length > 0) {
        const formatted = data.flatMap(msg => [
          { sender: "user", text: msg.message },
          { sender: "bot", text: msg.response },
        ]);
        setChat(formatted);
      }
    } catch (err) {
      console.error("Could not fetch history", err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const fetchWelcome = async () => {
      if (!session) return;
      try {
        const res = await fetch(`${BACKEND_URL}/welcome`, {
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        });
        const data = await res.json();
        setChat([{ sender: "bot", text: data.greeting }]);
      } catch (e) {
        setChat([{ sender: "bot", text: "Retail AI Operations System Online." }]);
      }
    };

    if (session) {
      fetchWelcome();
      fetchHistory();
    }
  }, [session]);

  const sendMessage = async () => {
    if (!message.trim() || !session) return;

    const userMessage = { sender: "user", text: message };
    setChat((prev) => [...prev, userMessage]);
    const currentMessage = message;
    setMessage("");
    setIsTyping(true);

    try {
      const res = await fetch(`${BACKEND_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ message: currentMessage }),
      });

      const data = await res.json();
      const botMessage = { sender: "bot", text: data.reply };
      setChat((prev) => [...prev, botMessage]);
    } catch (err) {
      setChat((prev) => [...prev, { sender: "bot", text: "Network Error: Could not reach backend server. Check your connection!" }]);
    } finally {
      setIsTyping(false);
    }
  };
  const handleVoiceInput = () => {
    if (isListening) {
      setIsListening(false);
    } else {
      setIsListening(true);
      const queries = [
        "What are my top 3 profit items?",
        "Show me items with stock below 50",
        "Generate a business health summary",
        "Which products have high sales but low stock?",
        "Predict sales for the next week"
      ];
      
      setTimeout(() => {
        setIsListening(false);
        const randomQuery = queries[Math.floor(Math.random() * queries.length)];
        setMessage(randomQuery);
      }, 2500);
    }
  };


  if (!session) return <Auth />;

  return (
    <View style={[styles.container, {paddingTop: Platform.OS === 'ios' ? 40 : 0}]}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={{flexDirection:'row', alignItems:'center', gap:10}}>
            <MaterialCommunityIcons name="store-outline" size={24} color="#3b82f6" />
            <Text style={styles.headerTitle}>RetailHub AI</Text>
          </View>
          <View style={{flexDirection:'row', alignItems:'center', gap:12}}>
            <View style={styles.onlineStatus}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Active</Text>
            </View>
            <TouchableOpacity onPress={handleSignOut} style={styles.logoutBtn}>
              <MaterialCommunityIcons name="logout" size={20} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === "inventory" && styles.activeTab]} 
            onPress={() => setActiveTab("inventory")}
          >
            <MaterialCommunityIcons name="package-variant-closed" size={20} color={activeTab === "inventory" ? "#3b82f6" : "#94a3b8"} />
            <Text style={[styles.tabText, activeTab === "inventory" && styles.activeTabText]}>Stock</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === "dashboard" && styles.activeTab]} 
            onPress={() => setActiveTab("dashboard")}
          >
             <Ionicons name="stats-chart" size={20} color={activeTab === "dashboard" ? "#3b82f6" : "#94a3b8"} />
            <Text style={[styles.tabText, activeTab === "dashboard" && styles.activeTabText]}>Analytics</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === "chat" && styles.activeTab]} 
            onPress={() => setActiveTab("chat")}
          >
            <MaterialCommunityIcons name="robot" size={20} color={activeTab === "chat" ? "#3b82f6" : "#94a3b8"} />
            <Text style={[styles.tabText, activeTab === "chat" && styles.activeTabText]}>Agent</Text>
          </TouchableOpacity>
        </View>

      </View>

      {activeTab === "inventory" ? (
        <Inventory session={session} />
      ) : activeTab === "dashboard" ? (
        <Dashboard session={session} />
      ) : (


        <>

      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          style={styles.chatArea}
        ref={scrollViewRef}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchHistory} tintColor="#3b82f6" />}
      >
        {chat.map((msg, index) => {
          const isUser = msg.sender === "user";
          return (
            <View key={index} style={[styles.messageRow, isUser ? styles.messageRowUser : styles.messageRowBot]}>
              <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleBot]}>
                <Text style={styles.messageText}>{msg.text}</Text>
              </View>
            </View>
          );
        })}
        {isTyping && (
          <View style={[styles.messageRow, styles.messageRowBot]}>
            <View style={[styles.bubble, styles.bubbleBot, { paddingVertical: 10 }]}>
              <Text style={[styles.messageText, { fontStyle: 'italic', opacity: 0.7 }]}>typing...</Text>
            </View>
          </View>
        )}
      </ScrollView>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll} contentContainerStyle={styles.chipContainer}>
        <TouchableOpacity style={styles.chip} onPress={() => setMessage("Show products")}>
          <View style={{flexDirection:'row', alignItems:'center', gap:4}}>
            <MaterialCommunityIcons name="cube-outline" size={14} color="#3b82f6" />
            <Text style={styles.chipText}>Products</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.chip} onPress={() => setMessage("Which items are low in stock?")}>
           <View style={{flexDirection:'row', alignItems:'center', gap:4}}>
            <Ionicons name="trending-down" size={14} color="#ef4444" />
            <Text style={styles.chipText}>Low Stock</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.chip} onPress={() => setMessage("What should I restock?")}>
           <View style={{flexDirection:'row', alignItems:'center', gap:4}}>
            <Ionicons name="sparkles" size={14} color="#fbbf24" />
            <Text style={styles.chipText}>Restock Suggest</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.chip} onPress={() => setMessage("Give me business summary")}>
           <View style={{flexDirection:'row', alignItems:'center', gap:4}}>
            <Ionicons name="analytics" size={14} color="#3b82f6" />
            <Text style={styles.chipText}>Summary</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>

        <View style={styles.inputArea}>
          <TouchableOpacity 
            style={[styles.iconButton, isListening && {backgroundColor: '#ef4444'}]} 
            onPress={handleVoiceInput}
          >
            <Ionicons name={isListening ? "mic" : "mic-outline"} size={22} color={isListening ? "white" : "#94a3b8"} />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            value={message}
            onChangeText={setMessage}
            placeholder="Type a message..."
            placeholderTextColor="#9ca3af"
            onSubmitEditing={sendMessage}
          />
          <TouchableOpacity 
            style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]} 
            onPress={sendMessage}
            disabled={!message.trim() || isTyping}
          >
            <Ionicons name="send" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
      </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#18181b',
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
    flexDirection: 'column',
    paddingTop: Platform.OS === 'android' ? 40 : 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#09090b',
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: '#27272a',
  },
  tabText: {
    color: '#94a3b8',
    fontWeight: 'bold',
  },
  activeTabText: {
    color: '#3b82f6',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f8fafc',
  },
  onlineStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22c55e',
  },
  statusText: {
    color: '#22c55e',
    fontSize: 12,
    fontWeight: '500',
  },
  logoutBtn: {
    padding: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 8,
  },
  chatArea: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  messageRow: {
    marginBottom: 16,
    flexDirection: 'row',
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  messageRowBot: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  bubbleUser: {
    backgroundColor: '#3b82f6',
    borderBottomRightRadius: 4,
  },
  bubbleBot: {
    backgroundColor: '#27272a',
    borderWidth: 1,
    borderColor: '#3f3f46',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    color: '#ffffff',
    lineHeight: 22,
  },
  chipScroll: {
    backgroundColor: '#09090b',
    borderTopWidth: 1,
    borderTopColor: '#27272a',
    maxHeight: 50,
  },
  chipContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  chip: {
    backgroundColor: '#18181b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#3f3f46',
    marginRight: 8,
  },
  chipText: {
    color: '#f8fafc',
    fontSize: 13,
  },
  inputArea: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#18181b',
    borderTopWidth: 1,
    borderTopColor: '#27272a',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#09090b',
    color: '#ffffff',
    height: 48,
    borderRadius: 24,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#3f3f46',
    marginRight: 12,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#27272a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  sendButtonDisabled: {
    backgroundColor: '#3f3f46',
    shadowOpacity: 0,
  },
  sendIcon: {
    color: 'white',
    fontSize: 18,
    fontWeight: '900',
  }
});
