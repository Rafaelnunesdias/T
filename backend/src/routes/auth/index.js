import express from 'express';
import { supabase } from '../../config/supabase.js';

const router = express.Router();

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    if (user.password_hash !== password) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = Buffer.from(`${user.id}:${Date.now()}`).toString('base64');

    res.json({
      token,
      user: {
        id: user.id,
        name: user.email ? user.email.split('@')[0].replace(/[._]/g, ' ') : 'Usuário',
        email: user.email,
        role: user.role,
        business_id: user.business_id
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(401).json({ error: 'Token necessário' });

    const decoded = Buffer.from(token, 'base64').toString().split(':');
    const userId = decoded[0];

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Sessão inválida' });
    }

    const newToken = Buffer.from(`${user.id}:${Date.now()}`).toString('base64');

    res.json({
      token: newToken,
      user: {
        id: user.id,
        name: user.email ? user.email.split('@')[0].replace(/[._]/g, ' ') : 'Usuário',
        email: user.email,
        role: user.role,
        business_id: user.business_id
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.json({ message: 'Logout realizado' });
});

// Forgot password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    const { data: user, error } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({ message: 'Link de recuperação enviado (simulação)' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;