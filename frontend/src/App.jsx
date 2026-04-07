import React, { useState, useRef, useEffect } from 'react';
import { Send, Store, Bot, User, Mic, LogOut, Package, BarChart3, MessageSquare } from 'lucide-react';
import ProductsDashboard from './components/ProductsDashboard';
import InventoryManager from './components/InventoryManager';
import { supabase } from './supabaseClient';
import Auth from './components/Auth';

function App() {
  const [session, setSession] = useState(null);
  const [activeTab, setActiveTab] = useState('inventory');
  
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([
    { sender: "bot", text: "Welcome to RetailBot! 🛍️\nAsk me about stock, sales insights, or for product recommendations." }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const chatEndRef = useRef(null);

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Your browser does not support Speech Recognition. Please try Google Chrome.");
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = (event) => {
      setMessage(event.results[0][0].transcript);
    };
    recognition.start();
  };

  useEffect(() => {
    // 🔥 Establish Authentic Session State
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return; // Don't fetch history if not logged in

    fetch(`http://localhost:5000/history/${session.user.id}`, {
      headers: { 'Authorization': `Bearer ${session.access_token}` },
    })
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          const formatted = data.flatMap(msg => [
            { sender: "user", text: msg.message },
            { sender: "bot", text: msg.response },
          ]);
          setChat([
            { sender: "bot", text: "Welcome to Retail Assistant! 🛍️\nHow can I help you manage your store today?" },
            ...formatted
          ]);
        }
      })
      .catch(err => console.error("Could not fetch history", err));
  }, [session]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat, isTyping]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = { sender: "user", text: message };
    setChat((prev) => [...prev, userMessage]);
    setMessage("");
    setIsTyping(true);

    try {
      const res = await fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ message: userMessage.text }),
      });

      const data = await res.json();
      
      const botMessage = { sender: "bot", text: data.reply || "I couldn't process that request." };
      setChat((prev) => [...prev, botMessage]);
    } catch (error) {
      setChat((prev) => [...prev, { sender: "bot", text: "Oops, the backend server isn't responding. Ensure it's running on port 5000." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  // 🚀 Render Gatekeeper
  if (!session) {
    return <Auth />;
  }

  return (
    <div className="main-layout">
      {/* 🚀 Main SaaS Sidebar Navigation */}
      <div className="sidebar-nav">
        <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Store size={26} color="#3b82f6" />
          <div>
            <h1 style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>RetailHub</h1>
            <p style={{ fontSize: '0.75rem', color: '#22c55e' }}>● Operating</p>
          </div>
        </div>
        
        <nav className="sidebar-links">
          <button 
            onClick={() => setActiveTab('inventory')}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '12px', border: 'none', background: activeTab === 'inventory' ? 'rgba(59,130,246,0.1)' : 'transparent', color: activeTab === 'inventory' ? '#3b82f6' : '#94a3b8', cursor: 'pointer', textAlign: 'left', fontWeight: '500', transition: 'all 0.2s' }}
          >
            <Package size={20} /> Inventory Manager
          </button>
          
          <button 
            onClick={() => setActiveTab('analytics')}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '12px', border: 'none', background: activeTab === 'analytics' ? 'rgba(59,130,246,0.1)' : 'transparent', color: activeTab === 'analytics' ? '#3b82f6' : '#94a3b8', cursor: 'pointer', textAlign: 'left', fontWeight: '500', transition: 'all 0.2s' }}
          >
            <BarChart3 size={20} /> Business Analytics
          </button>

          <button 
            onClick={() => setActiveTab('chat')}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '12px', border: 'none', background: activeTab === 'chat' ? 'rgba(59,130,246,0.1)' : 'transparent', color: activeTab === 'chat' ? '#3b82f6' : '#94a3b8', cursor: 'pointer', textAlign: 'left', fontWeight: '500', transition: 'all 0.2s' }}
          >
            <MessageSquare size={20} /> Autonomous Agent
          </button>
        </nav>

        <div style={{ padding: '24px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button 
            onClick={() => supabase.auth.signOut()}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '12px', borderRadius: '12px', border: 'none', background: 'rgba(239,68,68,0.1)', color: '#f87171', cursor: 'pointer', fontWeight: '500' }}
          >
            <LogOut size={18} /> Secure Logout
          </button>
        </div>
      </div>

      {/* 🚀 Dynamic Workspace Content Layout */}
      <div className="workspace-content" style={{ padding: activeTab === 'chat' ? (window.innerWidth < 768 ? '12px' : '24px') : '0' }}>
        {activeTab === 'inventory' && <InventoryManager session={session} />}
        {activeTab === 'analytics' && <div style={{padding: '40px', flex:1}}><ProductsDashboard session={session} /></div>}
        
        {activeTab === 'chat' && (
          <div className="app-container" style={{ margin: '0 auto', width: '100%', maxWidth: '1000px', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div className="header">
              <div className="header-title">
                <Bot size={24} color="#3b82f6" />
                Store Operations AI
              </div>
            </div>
            
            <div className="chat-box">
              {chat.map((msg, index) => {
                const isUser = msg.sender === "user";
                return (
                  <div key={index} className={`message-wrapper ${isUser ? 'user' : 'bot'}`}>
                    <div className="message-bubble" style={{display:'flex', gap:'8px', alignItems:'start'}}>
                      {!isUser && <Bot size={18} style={{marginTop:'2px', opacity:0.7, shrink: 0}}/>}
                      <div style={{whiteSpace: 'pre-wrap'}}>{msg.text}</div>
                      {isUser && <User size={18} style={{marginTop:'2px', opacity:0.7, shrink: 0}}/>}
                    </div>
                  </div>
                );
              })}
              {isTyping && (
                 <div className="message-wrapper bot">
                   <div className="typing-indicator" style={{display:'flex', gap:'4px', padding:'10px 16px', borderRadius:'16px'}}>
                     <span className="typing-dot"></span><span className="typing-dot"></span><span className="typing-dot"></span>
                   </div>
                 </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div style={{ display: 'flex', gap: '8px', padding: '0 24px 12px 24px', overflowX: 'auto', flexShrink: 0, marginTop: 'auto' }}>
              <button onClick={() => setMessage("Which items are low in stock?")} style={{background:'rgba(255,255,255,0.05)', color:'white', border:'1px solid rgba(255,255,255,0.1)', padding:'6px 12px', borderRadius:'16px', fontSize:'0.85rem', cursor:'pointer', whiteSpace: 'nowrap'}}>📉 Low Stock</button>
              <button onClick={() => setMessage("What should I restock?")} style={{background:'rgba(255,255,255,0.05)', color:'white', border:'1px solid rgba(255,255,255,0.1)', padding:'6px 12px', borderRadius:'16px', fontSize:'0.85rem', cursor:'pointer', whiteSpace: 'nowrap'}}>⭐ Restock Suggest</button>
              <button onClick={() => setMessage("Give me business summary")} style={{background:'rgba(255,255,255,0.05)', color:'white', border:'1px solid rgba(255,255,255,0.1)', padding:'6px 12px', borderRadius:'16px', fontSize:'0.85rem', cursor:'pointer', whiteSpace: 'nowrap'}}>📊 Summary</button>
            </div>

            <div className="input-area">
              <button onClick={handleVoiceInput} style={{background: 'none', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'}} title="Voice input">
                <Mic size={20} color={isListening ? "#ef4444" : "#94a3b8"} />
              </button>
              <div className="input-wrapper" style={{flex: 1}}>
                <textarea 
                  className="chat-input" 
                  placeholder="Give Agent a command..." 
                  value={message} 
                  onChange={(e) => setMessage(e.target.value)} 
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  style={{width: '100%', background: 'transparent', border: 'none', color: 'white', resize: 'none', outline: 'none', minHeight: '24px', maxHeight: '120px', overflowY: 'auto', paddingTop: '4px'}}
                  rows={1}
                />
              </div>
              <button className="send-button" onClick={sendMessage} disabled={!message.trim() || isTyping}>
                <Send size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
