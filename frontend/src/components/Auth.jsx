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
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>{isLogin ? 'Welcome Back' : 'Create RetailHub Account'}</h2>
          <p>{isLogin ? 'Sign in to access your Retail Intelligence Dashboard' : 'Start tracking multi-store inventory and profits.'}</p>
        </div>

        <form onSubmit={handleAuth} className="auth-form">
          {errorMsg && <div className="auth-error">{errorMsg}</div>}

          {!isLogin && (
            <>
              <div className="input-group">
                <User size={18} className="input-icon" />
                <input
                  type="text"
                  placeholder="Your Full Name"
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
                  <option value="Other">Other Retail</option>
                </select>
              </div>
            </>
          )}

          <div className="input-group">
            <Mail size={18} className="input-icon" />
            <input
              type="email"
              placeholder="Email Address"
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
                {isLogin ? 'Sign In' : 'Complete Setup'}
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              type="button" 
              className="link-button" 
              onClick={() => { setIsLogin(!isLogin); setErrorMsg(''); }}
            >
              {isLogin ? 'Register now.' : 'Sign in here.'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
