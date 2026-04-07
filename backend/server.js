import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const supabaseUrl = process.env.SUPABASE_URL; // Loaded from .env
const supabaseKey = process.env.SUPABASE_KEY; // Loaded from .env
const supabase = createClient(supabaseUrl, supabaseKey);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

// Simple Keyword-based chatbot
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    const lowerMessage = (message || '').toLowerCase();
    
    if (lowerMessage.includes('stock')) {
      // Mocked stock data, or replace with DB call
      const { data, error } = await supabase.from('products').select('*');
      if (error) console.error(error); // ignore DB errors when testing without real supabase credentials
      const stockInfo = data ? data.map(p => `${p.name}: ${p.stock} units`).join('\n') : 'Wireless Headphones: 150 units\nMechanical Keyboard: 85 units';
      return res.json({ reply: `Here is the current stock:\n${stockInfo}` });
    }
    
    if (lowerMessage.includes('sales')) {
      return res.json({ reply: 'Top sales insights:\nWe have sold 1200 units of Wireless Headphones and 850 units of Mechanical Keyboards this month!' });
    }
    
    if (lowerMessage.includes('recommend') || lowerMessage.includes('products')) {
      const { data, error } = await supabase.from('products').select('*').limit(3);
      if (error) console.error(error);
      const prds = data ? data.map(p => p.name).join(', ') : 'Wireless Headphones, Mechanical Keyboard, Gaming Mouse';
      return res.json({ reply: `Based on current trends, I highly recommend our top products: ${prds}. Would you like to check their stock?` });
    }
    
    return res.json({ reply: "I can help you with store inventory. Try asking me to 'show products', 'sales insights', or 'stock of items'." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
