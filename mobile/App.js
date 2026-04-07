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
  RefreshControl
} from "react-native";
import Dashboard from "./Dashboard";

export default function App() {
  const [activeTab, setActiveTab] = useState("chat");
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([
    { sender: "bot", text: "Welcome to RetailBot! 🛍️\nHow can I assist you today?" }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const scrollViewRef = useRef();

  const handleVoiceInput = () => {
    setIsListening(true);
    setTimeout(() => {
      setMessage("top products");
      setIsListening(false);
    }, 1500);
  };

  const fetchHistory = () => {
    setRefreshing(true);
    fetch("http://10.142.13.107:5000/history/user1")
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          const formatted = data.flatMap(msg => [
            { sender: "user", text: msg.message },
            { sender: "bot", text: msg.response },
          ]);
          setChat(formatted);
        }
        setRefreshing(false);
      })
      .catch(err => {
        console.error("Could not fetch history", err);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = { sender: "user", text: message };
    setChat((prev) => [...prev, userMessage]);
    const currentMessage = message;
    setMessage("");
    setIsTyping(true);

    try {
      // Configured explicitly with the resolved laptop local IP Address!
      const res = await fetch("http://10.142.13.107:5000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: currentMessage }),
      });

      const data = await res.json();
      const botMessage = { sender: "bot", text: data.reply };
      setChat((prev) => [...prev, botMessage]);
    } catch (err) {
      setChat((prev) => [...prev, { sender: "bot", text: "Network Error: Could not reach backend server at 10.142.13.107:5000." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <View style={[styles.container, {paddingTop: Platform.OS === 'ios' ? 40 : 0}]}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>🏪 RetailHub</Text>
          <View style={styles.onlineStatus}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Online</Text>
          </View>
        </View>
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === "chat" && styles.activeTab]} 
            onPress={() => setActiveTab("chat")}
          >
            <Text style={[styles.tabText, activeTab === "chat" && styles.activeTabText]}>💬 Chatbot</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === "dashboard" && styles.activeTab]} 
            onPress={() => setActiveTab("dashboard")}
          >
            <Text style={[styles.tabText, activeTab === "dashboard" && styles.activeTabText]}>📊 Insights</Text>
          </TouchableOpacity>
        </View>
      </View>

      {activeTab === "dashboard" ? (
        <Dashboard />
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
          <Text style={styles.chipText}>📦 Products</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.chip} onPress={() => setMessage("Which items are low in stock?")}>
          <Text style={styles.chipText}>📉 Low Stock</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.chip} onPress={() => setMessage("What should I restock?")}>
          <Text style={styles.chipText}>⭐ Restock Suggest</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.chip} onPress={() => setMessage("Give me business summary")}>
          <Text style={styles.chipText}>📊 Summary</Text>
        </TouchableOpacity>
      </ScrollView>

        <View style={styles.inputArea}>
          <TouchableOpacity 
            style={[styles.iconButton, isListening && {backgroundColor: '#ef4444'}]} 
            onPress={handleVoiceInput}
          >
            <Text style={{fontSize: 20}}>🎤</Text>
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
            <Text style={styles.sendIcon}>➤</Text>
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
