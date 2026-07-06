import express from 'express';
import { supabase } from '../../config/supabase.js';

const router = express.Router();

// =============================================
// Middleware de Autenticação
// =============================================
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = Buffer.from(token, 'base64').toString().split(':');
    const userId = decoded[0];

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Não autenticado' });
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Permissão negada' });
    next();
  };
};

// =============================================
// ROTAS DE LOGÍSTICA / ENTREGA
// =============================================

// Coordenadas fixas da fábrica (Belo Horizonte - Centro)
const FACTORY_COORDS = { lng: -43.9345, lat: -19.9167 };

// Bairros de BH com coordenadas
const BAIRROS = [
  { name: 'Centro', lat: -19.9167, lng: -43.9345, zone: 'verde' },
  { name: 'Savassi', lat: -19.9300, lng: -43.9370, zone: 'verde' },
  { name: 'Funcionários', lat: -19.9250, lng: -43.9300, zone: 'verde' },
  { name: 'Lourdes', lat: -19.9200, lng: -43.9450, zone: 'verde' },
  { name: 'Santo Agostinho', lat: -19.9280, lng: -43.9500, zone: 'verde' },
  { name: 'Barro Preto', lat: -19.9350, lng: -43.9550, zone: 'verde' },
  { name: 'Pampulha', lat: -19.8550, lng: -43.9700, zone: 'azul' },
  { name: 'Nova Suíça', lat: -19.9400, lng: -43.9700, zone: 'azul' },
  { name: 'Gutierrez', lat: -19.9450, lng: -43.9600, zone: 'azul' },
  { name: 'Sion', lat: -19.9500, lng: -43.9350, zone: 'azul' },
  { name: 'Cidade Jardim', lat: -19.9550, lng: -43.9400, zone: 'azul' },
  { name: 'Betânia', lat: -19.9750, lng: -43.9750, zone: 'roxa' },
  { name: 'Barreiro', lat: -19.9850, lng: -44.0000, zone: 'roxa' },
  { name: 'Venda Nova', lat: -19.8200, lng: -43.9500, zone: 'roxa' },
  { name: 'Norte', lat: -19.8600, lng: -43.9300, zone: 'roxa' },
];

// Gerador pseudo-aleatório determinístico (seed-based)
function seededRandom(seed) {
  let s = seed;
  return function () {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

function simulateRoute(from, to, numPoints = 10, seed = 1) {
  const rng = seededRandom(seed);
  const points = [];
  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    const jitterLat = (rng() - 0.5) * 0.004;
    const jitterLng = (rng() - 0.5) * 0.004;
    points.push([from.lng + (to.lng - from.lng) * t + jitterLng, from.lat + (to.lat - from.lat) * t + jitterLat]);
  }
  return points;
}

// GET /routes — rotas simuladas para o mapa
router.get('/routes', authenticate, async (req, res) => {
  try {
    const { business_id } = req.user;

    // 1) Buscar deliveries ativas (em_rota / pendente)
    const { data: activeDeliveries } = await supabase
      .from('deliveries')
      .select('*, orders!inner(id, status, total, clients!inner(name, phone))')
      .eq('orders.business_id', business_id)
      .in('status', ['em_rota', 'pendente'])
      .order('created_at', { ascending: false });

    // 2) Buscar orders já entregues (a validação atualiza orders.status, não deliveries.status)
    //    Usando fetch direto pois o !inner pode falhar com Supabase JS
    const entregueRes = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/orders?select=id,status,total,clients:client_id(name,phone)&status=eq.entregue&business_id=eq.${business_id}&order=created_at.desc`,
      { headers: { apikey: process.env.SUPABASE_KEY } }
    );
    const entregueOrders = entregueRes.ok ? await entregueRes.json() : [];

    const { data: motoboys } = await supabase
      .from('motoboys')
      .select('*')
      .eq('business_id', business_id);

    // Mesclar: deliveries ativas + entregues
    const allDeliveries = [
      ...(activeDeliveries || []).map(d => ({ ...d, _status: d.status })),
      ...(entregueOrders || []).map(o => ({
        _status: 'entregue',
        status: 'entregue',
        order_id: o.id,
        orders: o,
      })),
    ];

    // Embaralhar entregas entre motoboys a cada ciclo (rotacionar)
    const now = Date.now();
    const ciclo = Math.floor(now / 5000); // rotaciona a cada 5 segundos
    const motos = [...(motoboys || [])];
    if (ciclo % 2 === 0) motos.reverse();

    // Separar entregues das ativas — entregues não ganham motoboy nem rota variável
    const activeRoutes = (activeDeliveries || []).map((del, idx) => {
      const motoboyIdx = idx % (motos.length || 1);
      const motoboy = motos[motoboyIdx];
      const indexOffset = (idx + ciclo) % BAIRROS.length;
      const bairro = BAIRROS[indexOffset];
      const destCoords = { lng: bairro.lng + (Math.random() - 0.5) * 0.01, lat: bairro.lat + (Math.random() - 0.5) * 0.01 };
      const path = simulateRoute(FACTORY_COORDS, destCoords, 10, idx + ciclo * 10);
      return {
        id: del.order_id || del.id,
        order_id: del.order_id,
        status: del.status === 'em_rota' || del.status === 'em_transito' ? 'em_rota' : 'pending',
        client_name: del.orders?.clients?.name || 'Cliente',
        client_phone: del.orders?.clients?.phone || '',
        total: del.orders?.total || 0,
        bairro: bairro.name,
        zone: bairro.zone,
        origin: FACTORY_COORDS,
        destination: destCoords,
        path,
        distance_km: Math.round((Math.random() * 12 + 2) * 10) / 10,
        estimated_time: `${Math.floor(Math.random() * 40 + 15)} min`,
        motoboy_name: motoboy?.name || null,
        motoboy_id: motoboy?.id || null,
      };
    });

    // Rotas concluídas (status fixo, sem simulação de rota variável)
    const doneRoutes = (entregueOrders || []).map((o, idx) => {
      const bairro = BAIRROS[idx % BAIRROS.length];
      return {
        id: o.id,
        order_id: o.id,
        status: 'entregue',
        client_name: o.clients?.name || 'Cliente',
        client_phone: o.clients?.phone || '',
        total: o.total || 0,
        bairro: bairro.name,
        zone: bairro.zone,
        origin: FACTORY_COORDS,
        destination: { lng: bairro.lng, lat: bairro.lat },
        path: [],
        distance_km: 0,
        estimated_time: '—',
        motoboy_name: null,
        motoboy_id: null,
      };
    });

    const routes = [...doneRoutes, ...activeRoutes];

    const motoboyPositions = (motoboys || []).map(m => ({
      id: m.id, name: m.name, phone: m.phone,
      lat: FACTORY_COORDS.lat + (Math.random() - 0.5) * 0.06,
      lng: FACTORY_COORDS.lng + (Math.random() - 0.5) * 0.06,
      status: Math.random() > 0.3 ? 'em_rota' : 'disponivel',
    }));

    res.json({
      factoryCoords: FACTORY_COORDS,
      routes,
      motoboys: motoboyPositions,
      zones: [
        { label: 'verde', radius: 3, color: '#10b981' },
        { label: 'azul', radius: 8, color: '#3b82f6' },
        { label: 'roxa', radius: 15, color: '#8b5cf6' },
      ],
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Listar entregas pendentes
router.get('/deliveries', authenticate, async (req, res) => {
  try {
    const { business_id } = req.user;
    const { status, motoboy_id, page = 1, limit = 50 } = req.query;

    let query = supabase
      .from('orders')
      .select('*, clients(name, phone)')
      .eq('business_id', business_id)
      .in('status', ['saindo_entrega', 'em_transito', 'entregue', 'cancelado'])
      .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);
    if (motoboy_id) query = query.eq('motoboy_id', motoboy_id);

    const from = (page - 1) * limit;
    const to = page * limit - 1;
    query = query.range(from, to);

    const { data, error } = await query;
    if (error) throw error;

    res.json({ deliveries: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Atualizar status de entrega
router.patch('/deliveries/:id/status', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, motoboy_id, notes } = req.body;

    const updateData = { status };
    if (motoboy_id) updateData.motoboy_id = motoboy_id;
    if (notes) updateData.notes = notes;

    if (status === 'saindo_entrega' && motoboy_id) {
      updateData.motoboy_id = motoboy_id;
      updateData.delivery_started_at = new Date().toISOString();
    }

    if (status === 'em_transito') {
      updateData.delivery_started_at = new Date().toISOString();
    }

    if (status === 'entregue') {
      updateData.delivered_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ order: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Atribuir motoboy a entrega
router.patch('/deliveries/:id/assign', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { motoboy_id } = req.body;

    const { data, error } = await supabase
      .from('orders')
      .update({ motoboy_id, status: 'saindo_entrega', delivery_started_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ order: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Listar motoboys
router.get('/motoboys', authenticate, async (req, res) => {
  try {
    const { business_id } = req.user;

    const { data, error } = await supabase
      .from('motoboys')
      .select('*')
      .eq('business_id', business_id)
      .order('name');

    if (error) throw error;

    // Enriquecer com entregas ativas
    const enriched = await Promise.all((data || []).map(async (motoboy) => {
      const { data: activeDeliveries } = await supabase
        .from('orders')
        .select('id')
        .eq('business_id', business_id)
        .eq('motoboy_id', motoboy.id)
        .in('status', ['saindo_entrega', 'em_transito']);

      const { data: todayDeliveries } = await supabase
        .from('orders')
        .select('id')
        .eq('business_id', business_id)
        .eq('motoboy_id', motoboy.id)
        .gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString());

      return {
        ...motoboy,
        entregas_ativas: activeDeliveries?.length || 0,
        entregas_hoje: todayDeliveries?.length || 0
      };
    }));

    res.json({ motoboys: enriched });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Criar motoboy
router.post('/motoboys', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { business_id } = req.user;
    const { name, phone, email, cpf, cnh } = req.body;

    const { data, error } = await supabase
      .from('motoboys')
      .insert({ business_id, name, phone, email, cpf, cnh })
      .select()
      .single();

    if (error) throw error;

    res.json({ motoboy: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Atualizar motoboy
router.patch('/motoboys/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, email, cpf, cnh, active } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (email !== undefined) updateData.email = email;
    if (cpf !== undefined) updateData.cpf = cpf;
    if (cnh !== undefined) updateData.cnh = cnh;
    if (active !== undefined) updateData.active = active;

    const { data, error } = await supabase
      .from('motoboys')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ motoboy: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Excluir motoboy
router.delete('/motoboys/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('motoboys')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ message: 'Motoboy removido com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Zonas de entrega
router.get('/delivery-zones', authenticate, async (req, res) => {
  try {
    const { business_id } = req.user;

    const { data, error } = await supabase
      .from('delivery_zones')
      .select('*')
      .eq('business_id', business_id)
      .order('min_distance');

    if (error) throw error;

    res.json({ zones: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Criar / atualizar zona de entrega
router.post('/delivery-zones', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { business_id } = req.user;
    const { name, min_distance, max_distance, price, estimated_time } = req.body;

    const { data, error } = await supabase
      .from('delivery_zones')
      .insert({ business_id, name, min_distance, max_distance, price, estimated_time })
      .select()
      .single();

    if (error) throw error;

    res.json({ zone: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/delivery-zones/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, min_distance, max_distance, price, estimated_time, active } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (min_distance !== undefined) updateData.min_distance = min_distance;
    if (max_distance !== undefined) updateData.max_distance = max_distance;
    if (price !== undefined) updateData.price = price;
    if (estimated_time !== undefined) updateData.estimated_time = estimated_time;
    if (active !== undefined) updateData.active = active;

    const { data, error } = await supabase
      .from('delivery_zones')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ zone: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Excluir zona de entrega
router.delete('/delivery-zones/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('delivery_zones')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ message: 'Zona de entrega removida com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =============================================
// Algoritmo do Vizinho Mais Próximo (rota otimizada)
// =============================================
function nearestNeighborRoute(origin, destinations) {
  if (!destinations || destinations.length === 0) return [];
  if (destinations.length === 1) return [destinations[0]];

  const remaining = [...destinations];
  const route = [];
  let current = { lat: origin.lat, lng: origin.lng };

  function haversineKm(a, b) {
    const R = 6371;
    const dLat = ((b.lat - a.lat) * Math.PI) / 180;
    const dLng = ((b.lng - a.lng) * Math.PI) / 180;
    const sLat = Math.sin(dLat / 2);
    const sLng = Math.sin(dLng / 2);
    const h = sLat * sLat + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * sLng * sLng;
    return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  }

  while (remaining.length > 0) {
    let nearestIdx = 0;
    let nearestDist = Infinity;
    remaining.forEach((dest, idx) => {
      const d = haversineKm(current, { lat: dest.lat, lng: dest.lng });
      if (d < nearestDist) {
        nearestDist = d;
        nearestIdx = idx;
      }
    });
    route.push(remaining[nearestIdx]);
    current = { lat: remaining[nearestIdx].lat, lng: remaining[nearestIdx].lng };
    remaining.splice(nearestIdx, 1);
  }

  return route;
}

// GET /api/erp/logistics/active — pedidos em entrega ativa
router.get('/active', authenticate, async (req, res) => {
  try {
    const { business_id } = req.user;

    const { data: orders, error } = await supabase
      .from('orders')
      .select('*, clients(name, phone)')
      .eq('business_id', business_id)
      .in('status', ['saindo_entrega', 'em_transito'])
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Buscar motoboys para enriquecer
    const { data: motoboysData } = await supabase
      .from('motoboys')
      .select('id, name, phone')
      .eq('business_id', business_id);

    const motoboyMap = {};
    (motoboysData || []).forEach(m => { motoboyMap[m.id] = m; });

    const enriched = (orders || []).map(o => ({
      ...o,
      motoboy: o.motoboy_id ? (motoboyMap[o.motoboy_id] || null) : null,
    }));

    res.json({ deliveries: enriched || [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/erp/logistics/motoboys/locations — posições atuais dos motoboys
router.get('/motoboys/locations', authenticate, async (req, res) => {
  try {
    const { business_id } = req.user;

    const { data, error } = await supabase
      .from('motoboys')
      .select('id, name, phone')
      .eq('business_id', business_id);

    if (error) throw error;

    // Simular posições (em produção viriam de GPS real)
    const positions = (data || []).map(m => ({
      id: m.id,
      name: m.name,
      phone: m.phone,
      lat: FACTORY_COORDS.lat + (Math.random() - 0.5) * 0.06,
      lng: FACTORY_COORDS.lng + (Math.random() - 0.5) * 0.06,
      status: Math.random() > 0.3 ? 'em_rota' : 'disponivel',
      last_update: new Date().toISOString(),
    }));

    res.json({ motoboys: positions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/erp/logistics/delivery/assign — atribuir entrega ao motoboy (rota otimizada)
router.post('/delivery/assign', authenticate, authorize('admin', 'producao'), async (req, res) => {
  try {
    const { business_id } = req.user;
    const { order_ids, motoboy_id } = req.body;

    if (!order_ids || !order_ids.length || !motoboy_id) {
      return res.status(400).json({ error: 'order_ids e motoboy_id são obrigatórios' });
    }

    // Buscar coordenadas dos pedidos para rotear
    const { data: orders } = await supabase
      .from('orders')
      .select('id, clients(address)')
      .eq('business_id', business_id)
      .in('id', order_ids);

    const { data: motoboy } = await supabase
      .from('motoboys')
      .select('name')
      .eq('id', motoboy_id)
      .single();

    if (!motoboy) return res.status(404).json({ error: 'Motoboy não encontrado' });

    const origin = { lat: FACTORY_COORDS.lat, lng: FACTORY_COORDS.lng };

    const destinations = (orders || [])
      .filter(o => o.clients?.latitude)
      .map(o => ({
        order_id: o.id,
        lat: o.clients.latitude,
        lng: o.clients.longitude,
      }));

    // Rota otimizada
    const optimizedRoute = nearestNeighborRoute(origin, destinations);

    // Atualizar status dos pedidos
    const updatePromises = order_ids.map(orderId =>
      supabase
        .from('orders')
        .update({
          motoboy_id,
          status: 'saindo_entrega',
          delivery_started_at: new Date().toISOString(),
        })
        .eq('id', orderId)
        .eq('business_id', business_id)
    );

    await Promise.all(updatePromises);

    res.json({
      success: true,
      message: `${order_ids.length} entrega(s) atribuída(s) ao motoboy`,
      motoboy_id,
      order_ids,
      optimized_route: optimizedRoute,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/erp/logistics/delivery/:id/location — motoboy atualiza posição (simulado)
router.patch('/delivery/:id/location', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { latitude, longitude } = req.body;

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({ error: 'latitude e longitude são obrigatórios' });
    }

    // Em produção, atualizaria no banco. Aqui apenas confirmamos.
    res.json({ motoboy_id: id, latitude, longitude, message: 'Posição atualizada' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/erp/logistics/delivery/:id/validate — validar entrega com código
router.post('/delivery/:id/validate', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { code } = req.body;

    if (!code || code.length !== 4) {
      return res.status(400).json({ error: 'Código de 4 dígitos é obrigatório' });
    }

    // Buscar pedido com cliente
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, status, business_id, client_id, clients(phone)')
      .eq('id', id)
      .single();

    if (orderError || !order) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    if (order.status === 'entregue') {
      return res.status(400).json({ error: 'Entrega já foi validada anteriormente' });
    }

    // Código de entrega = últimos 4 dígitos do telefone (apenas números)
    const phone = order.clients?.phone || '';
    const digits = phone.replace(/\D/g, '');
    const expectedCode = digits.slice(-4).padStart(4, '0');

    if (code !== expectedCode) {
      return res.status(400).json({ error: 'Código de entrega inválido' });
    }

    // Atualizar status para entregue
    const { data: updated, error: updateError } = await supabase
      .from('orders')
      .update({ status: 'entregue' })
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    res.json({
      success: true,
      message: 'Entrega validada com sucesso',
      order: updated,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/erp/logistics/motoboy/:id/earnings — ganhos do motoboy (simulado com base no valor dos pedidos)
router.get('/motoboy/:id/earnings', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { business_id } = req.user;
    const now = new Date();

    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const { data: todayOrders } = await supabase
      .from('orders')
      .select('total')
      .eq('business_id', business_id)
      .eq('motoboy_id', id)
      .eq('status', 'entregue')
      .gte('created_at', todayStart);

    const { data: weekOrders } = await supabase
      .from('orders')
      .select('total')
      .eq('business_id', business_id)
      .eq('motoboy_id', id)
      .eq('status', 'entregue')
      .gte('created_at', weekStart.toISOString());

    const { data: monthOrders } = await supabase
      .from('orders')
      .select('total')
      .eq('business_id', business_id)
      .eq('motoboy_id', id)
      .eq('status', 'entregue')
      .gte('created_at', monthStart);

    const sum = (arr) => (arr || []).reduce((s, o) => s + Number(o.total || 0) * 0.1, 0); // 10% do valor

    res.json({
      today: sum(todayOrders),
      week: sum(weekOrders),
      month: sum(monthOrders),
      deliveries_today: todayOrders?.length || 0,
      deliveries_week: weekOrders?.length || 0,
      deliveries_month: monthOrders?.length || 0,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Estatísticas por zona
router.get('/zones/stats', authenticate, async (req, res) => {
  try {
    const { business_id } = req.user;

    // Buscar entregas ativas para contar por zona simulada
    const { data: orders } = await supabase
      .from('orders')
      .select('id, total, status')
      .eq('business_id', business_id)
      .in('status', ['saindo_entrega', 'em_transito', 'entregue']);

    if (!orders) return res.json({ zones: [] });

    // Simular distribuição por zonas
    const total = orders.length;
    const verdeCount = Math.ceil(total * 0.4);
    const azulCount = Math.ceil(total * 0.35);
    const roxaCount = total - verdeCount - azulCount;

    const zones = [
      {
        label: 'verde',
        radius: 3,
        color: '#10b981',
        pedidos: verdeCount,
        entregadores: 2,
        faturamento: orders.slice(0, verdeCount).reduce((s, o) => s + Number(o.total || 0), 0),
        tempo_medio: '18 min',
      },
      {
        label: 'azul',
        radius: 8,
        color: '#3b82f6',
        pedidos: azulCount,
        entregadores: 2,
        faturamento: orders.slice(verdeCount, verdeCount + azulCount).reduce((s, o) => s + Number(o.total || 0), 0),
        tempo_medio: '28 min',
      },
      {
        label: 'roxa',
        radius: 15,
        color: '#8b5cf6',
        pedidos: roxaCount,
        entregadores: 1,
        faturamento: orders.slice(verdeCount + azulCount).reduce((s, o) => s + Number(o.total || 0), 0),
        tempo_medio: '42 min',
      },
    ];

    res.json({ factoryCoords: FACTORY_COORDS, zones });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rastrear entrega em tempo real
router.get('/deliveries/:id/track', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: order, error } = await supabase
      .from('orders')
      .select('*, clients(name, phone)')
      .eq('id', id)
      .single();

    if (error) throw error;

    res.json({ order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Relatório de entregas
router.get('/reports/deliveries', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { business_id } = req.user;
    const { start_date, end_date, motoboy_id } = req.query;

    let query = supabase
      .from('orders')
      .select('*, motoboys(name)')
      .eq('business_id', business_id)
      .in('status', ['entregue', 'cancelado']);

    if (start_date) query = query.gte('created_at', start_date);
    if (end_date) query = query.lte('created_at', end_date);
    if (motoboy_id) query = query.eq('motoboy_id', motoboy_id);

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;

    const entregues = data?.filter(o => o.status === 'entregue').length || 0;
    const cancelados = data?.filter(o => o.status === 'cancelado').length || 0;
    const totalEntregas = data?.length || 0;
    const taxaSucesso = totalEntregas > 0 ? ((entregues / totalEntregas) * 100).toFixed(1) : 0;

    // Tempo médio de entrega (minutos)
    const tempos = (data || [])
      .filter(o => o.status === 'entregue' && o.delivery_started_at && o.delivered_at)
      .map(o => {
        const start = new Date(o.delivery_started_at);
        const end = new Date(o.delivered_at);
        return (end - start) / 60000;
      });

    const tempoMedio = tempos.length > 0
      ? (tempos.reduce((s, t) => s + t, 0) / tempos.length).toFixed(1)
      : 0;

    res.json({
      total_entregas: totalEntregas,
      entregues,
      cancelados,
      taxa_sucesso: Number(taxaSucesso),
      tempo_medio_minutos: Number(tempoMedio),
      deliveries: data
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
