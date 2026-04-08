import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Mail, Lock, User, Store, ArrowRight, Loader2 } from 'lucide-react';
import '../index.css';

const Auth = ({ onConfigured }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [businessType, setBusinessType] = useState('Electronics');
  const [errorMsg, setErrorMsg] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        // Success handled by parent session listener
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name, business_type: businessType }
          }
        });
        if (error) throw error;
        
        // Setup initial store logic if needed
        if (data.user) {
          const { error: storeError } = await supabase.from('stores').insert({
            tenant_id: data.user.id,
            store_name: `${name}'s ${businessType} Store`,
            business_type: businessType
          });
          if (storeError) console.error("Initial store creation failed", storeError);
        }
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="brand-logo">
            <Store size={32} />
            <span>RetailHub AI</span>
          </div>
          <h1>The future of retail is autonomous.</h1>
          <p>Deploy multi-tenant inventory agents, predictive analytics, and seamless stock management with one unified platform.</p>
          
          <div className="feature-badges">
            <div className="f-badge">✨ Real-time Sync</div>
            <div className="f-badge">🤖 AI Agent</div>
            <div className="f-badge">📈 Prediction</div>
          </div>
        </div>
      </div>
      
      <div className="auth-form-section">
        <div className="auth-card">
          <div className="auth-header">
            <h2>{isLogin ? 'Sign In' : 'Join the Revolution'}</h2>
            <p>{isLogin ? 'Welcome back! Your store data is waiting.' : 'Get started with our state-of-the-art retail engine.'}</p>
          </div>

          <form onSubmit={handleAuth} className="auth-form">
            {errorMsg && <div className="auth-error">{errorMsg}</div>}

            {!isLogin && (
              <>
                <div className="input-group">
                  <User size={18} className="input-icon" />
                  <input
                    type="text"
                    placeholder="Full Name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="input-group">
                  <Store size={18} className="input-icon" />
                  <select 
                    value={businessType} 
                    onChange={(e) => setBusinessType(e.target.value)}
                    className="auth-select"
                  >
                    <option value="Electronics">Electronics & Tech</option>
                    <option value="Grocery">Grocery & Market</option>
                    <option value="Apparel">Fashion & Apparel</option>
                    <option value="Pharmacy">Pharmacy</option>
                  </select>
                </div>
              </>
            )}

            <div className="input-group">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                placeholder="Work Email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="input-group">
              <Lock size={18} className="input-icon" />
              <input
                type="password"
                placeholder="Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? <Loader2 className="spinner" size={20} /> : (
                <>
                  {isLogin ? 'Continue to Dashboard' : 'Create Organization'}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              {isLogin ? "Need an account? " : "Already an expert? "}
              <button 
                type="button" 
                className="link-button" 
                onClick={() => { setIsLogin(!isLogin); setErrorMsg(''); }}
              >
                {isLogin ? 'Start free trial' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
