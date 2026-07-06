import express from 'express';
import bcrypt from 'bcrypt';
import { supabase } from '../../config/supabase.js';
import { signToken } from '../../middleware/jwtAuth.js';

const router = express.Router();

// Registro de cliente
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, phone, business_id } = req.body;
    if (!email || !password || !business_id) {
      return res.status(400).json({ error: 'Campos obrigatórios: email, password, business_id' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const { data: client, error } = await supabase
      .from('clients')
      .insert({ email, password: hashed, name, phone, business_id })
      .single();
    if (error) throw error;
    const token = signToken({ userId: client.id, role: 'client' });
    res.json({ client, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login de cliente
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }
    const { data: client, error } = await supabase
      .from('clients')
      .select('*')
      .eq('email', email)
      .single();
    if (error) throw error;
    const match = await bcrypt.compare(password, client.password);
    if (!match) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    const token = signToken({ userId: client.id, role: 'client' });
    res.json({ client, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
