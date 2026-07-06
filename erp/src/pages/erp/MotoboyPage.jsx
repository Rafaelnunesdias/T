import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import MapaRotas from '../../components/MapaRotas';
import './MotoboyPage.css';

export default function MotoboyPage() {
  const currentTheme = localStorage.getItem('theme') || 'dark';
  const [theme, setTheme] = useState(currentTheme);
  const [deliveries, setDeliveries] = useState([]);
  const [routesData, setRoutesData] = useState({ routes: [], motoboys: [], factoryCoords: null, zones: [] });
  const [loading, setLoading] = useState(true);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [validationOpen, setValidationOpen] = useState(null);
  const [otp, setOtp] = useState('');
  const [earnings, setEarnings] = useState({ today: 0, week: 0, month: 0, deliveries_today: 0 });
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState(null);
  const [motoboyInfo, setMotoboyInfo] = useState({ name: 'Motoboy', deliveriesToday: 0 });

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/erp/logistics/routes');
      const routeData = data.routes || [];

      // Transform routes into deliveries
      const deliveriesArr = routeData.map((r) => ({
        ...r,
        id: r.id || r.rota_id,
        status: r.status === 'entregue' ? 'entregue' : r.status === 'em_rota' || r.status === 'em_transito' ? 'em_rota' : 'pending',
      }));
      setRoutesData({ routes: routeData, motoboys: data.motoboys || [], factoryCoords: data.factoryCoords, zones: data.zones || [] });
      setDeliveries(deliveriesArr);

      // First motoboy info
      const rawMotoboys = data.motoboys || [];
      const mbName = rawMotoboys[0]?.name || 'Motoboy';
      const emRota = deliveriesArr.filter(d => d.status === 'em_rota').length;
      setMotoboyInfo({ name: mbName, deliveriesToday: emRota });

      // Pick first em_rota delivery
      const inRoute = deliveriesArr.find((d) => d.status === 'em_rota');
      if (inRoute) setSelectedDelivery(inRoute);

      // Calcular ganhos do dia com base nas entregas concluídas (10% do valor)
      const doneD = deliveriesArr.filter(d => d.status === 'entregue');
      const todayTotal = doneD.reduce((s, d) => s + Number(d.total || 0), 0);
      const todayCount = doneD.length;
      setEarnings({
        today: todayTotal * 0.1,
        week: todayTotal * 0.1,
        month: todayTotal * 0.1,
        deliveries_today: todayCount,
        deliveries_week: todayCount,
        deliveries_month: todayCount,
      });
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Sync theme with localStorage changes
  useEffect(() => {
    const handler = () => {
      const t = localStorage.getItem('theme') || 'dark';
      setTheme(t);
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const getDeliveriesCount = () => {
    const pending = deliveries.filter(d => d.status === 'pending').length;
    const inRoute = deliveries.filter(d => d.status === 'em_rota').length;
    const done = deliveries.filter(d => d.status === 'entregue').length;
    return { pending, inRoute, done };
  };

  const handleValidate = async (id) => {
    setValidating(true);
    try {
      const { data } = await api.post(`/erp/logistics/delivery/${id}/validate`, { code: otp });
      if (data.success) {
        fetchData();
        setValidationOpen(null);
        setOtp('');
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao validar entrega');
    } finally {
      setValidating(false);
    }
  };

  if (loading && deliveries.length === 0) {
    return (
      <div className="motoboy-page">
        <div className="motoboy-loading">
          <span className="loading-spinner" />
          <span>Carregando painel...</span>
        </div>
      </div>
    );
  }

  const counts = getDeliveriesCount();
  const inRouteDeliveries = deliveries.filter(d => d.status === 'em_rota' || d.status === 'saindo_entrega');
  const pendingDeliveries = deliveries.filter(d => d.status === 'pending');
  const doneDeliveries = deliveries.filter(d => d.status === 'entregue');
  const metaTotal = 21;
  const metaProgress = Math.min(Math.round((counts.done / metaTotal) * 100), 100);

  return (
    <div className="xf">
      <div className="xf-main">
        <div className="xf-top">
          <span className="xf-page-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 8, verticalAlign: 'middle' }}>
              <path d="M5 17h14M5 17l-2-6 2-6M5 17l2 6M19 17l2-6-2-6M19 17l-2 6"/>
              <circle cx="12" cy="10" r="2"/>
            </svg>
            Meu Painel
          </span>
          <div className="xf-top-right">
            <div className="xf-badge-live"><div className="xf-dot" />Disponível</div>
            <div className="xf-avatar">{motoboyInfo.name?.charAt(0)?.toUpperCase() || 'M'}{motoboyInfo.name?.split(' ')?.[1]?.charAt(0)?.toUpperCase() || 'V'}</div>
          </div>
        </div>

        <div className="xf-body">
          {error && (
            <div className="xf-error">
              <span>{error}</span>
              <button onClick={fetchData}>Tentar novamente</button>
            </div>
          )}

          {/* Perfil do motoboy */}
          <div className="xf-profile">
            <div className="xf-profile-avatar">🛵</div>
            <div className="xf-profile-info">
              <div className="xf-profile-name">{motoboyInfo.name}</div>
              <div className="xf-profile-sub">Motoboy · Região Centro</div>
              <div className="xf-profile-status">
                <div className="xf-status-badge"><div className="xf-dot" />Online agora</div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="xf-profile-deliveries">{motoboyInfo.deliveriesToday}</div>
              <div className="xf-profile-deliveries-label">entregas ativas</div>
            </div>
          </div>

          {/* Ganhos */}
          <div className="xf-gains">
            <div className="xf-gain-card">
              <div className="xf-gain-label">Hoje</div>
              <div className="xf-gain-val">R${earnings.today.toFixed(0)}</div>
              <div className="xf-gain-sub">{earnings.deliveries_today || 0} entregas</div>
            </div>
            <div className="xf-gain-card">
              <div className="xf-gain-label">Semana</div>
              <div className="xf-gain-val">R${earnings.week.toFixed(0)}</div>
              <div className="xf-gain-sub">{earnings.deliveries_week || 0} entregas</div>
            </div>
            <div className="xf-gain-card">
              <div className="xf-gain-label">Mês</div>
              <div className="xf-gain-val">R${earnings.month.toFixed(0)}</div>
              <div className="xf-gain-sub">{earnings.deliveries_month || 0} entregas</div>
            </div>
          </div>

          {/* Mapa de Rotas */}
          <div className="xf-map-section">
            <div className="xf-section-label" style={{ marginBottom: 10 }}>
              Mapa de Entregas
            </div>
            <div className="xf-zone-legend">
              <div className="xf-zone-item"><span className="xf-zone-dot verde" />Verde — Até 3 km (centro)</div>
              <div className="xf-zone-item"><span className="xf-zone-dot azul" />Azul — 3 a 8 km (bairros)</div>
              <div className="xf-zone-item"><span className="xf-zone-dot roxa" />Roxa — Acima de 8 km (regiões distantes)</div>
            </div>
            <div className="xf-map-container-sm">
              <MapaRotas
                routes={deliveries}
                motoboys={routesData.motoboys?.map(mb => ({ ...mb, coords: [mb.lng || -43.9345, mb.lat || -19.9167] })) || []}
                selectedRouteId={selectedDelivery?.id}
                factoryCoords={routesData.factoryCoords || { lng: -43.9345, lat: -19.9167 }}
                zones={[{ label: 'verde' }, { label: 'azul' }, { label: 'roxa' }]}
                onMarkerClick={(del) => setSelectedDelivery(del)}
                height="280px"
              />
            </div>
          </div>

          {/* Meta diária */}
          <div className="xf-progress-card">
            <div className="xf-progress-header">
              <span className="xf-progress-title">Meta diária — {counts.done} de {metaTotal} entregas</span>
              <span className="xf-progress-pct">{metaProgress}%</span>
            </div>
            <div className="xf-progress-bar"><div className="xf-progress-fill" style={{ width: `${metaProgress}%` }} /></div>
            <div className="xf-progress-sub">{metaTotal - counts.done > 0 ? `Faltam ${metaTotal - counts.done} entregas para bater a meta de hoje` : 'Meta atingida! 🎉'}</div>
          </div>

          {/* Na Bolsa */}
          <div>
            <div className="xf-section-label">
              Na Bolsa 🎒
              <span className="xf-count-badge">{counts.inRoute}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {inRouteDeliveries.length === 0 && (
                <div className="xf-empty">Nenhuma entrega na bolsa</div>
              )}
              {inRouteDeliveries.map((e) => (
                <div key={e.id} className="xf-delivery-card active" onClick={() => setSelectedDelivery(e)}>
                  <div className="xf-delivery-icon icon-rota">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                  </div>
                  <div className="xf-delivery-body">
                    <div className="xf-delivery-top">
                      <span className="xf-delivery-op">#{e.order_id?.slice(0, 8) || '—'} · {e.client_name || 'Cliente'}</span>
                      <span className="xf-delivery-badge badge-rota">Em rota</span>
                    </div>
                    <div className="xf-delivery-dest">{e.client_name || 'Cliente'}</div>
                    <div className="xf-delivery-addr">{e.bairro || '—'}</div>
                    <div className="xf-delivery-meta">
                      <span className="xf-meta-item">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ verticalAlign: 'middle', marginRight: 2 }}><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                        {e.estimated_time || '—'}
                      </span>
                      <span className="xf-meta-item">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ verticalAlign: 'middle', marginRight: 2 }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        {e.distance_km || '?'} km
                      </span>
                      <span className="xf-delivery-value">R$ {Number(e.total || 0).toFixed(2)}</span>
                    </div>
                  </div>
                  {e.status === 'em_rota' && (
                    <button className="xf-validate-btn" onClick={(ev) => { ev.stopPropagation(); setValidationOpen(e.id); }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Pendentes (ainda na fábrica) */}
          <div>
            <div className="xf-section-label">
              Pendentes (na fábrica)
              <span className="xf-count-badge">{counts.pending}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {pendingDeliveries.length === 0 && (
                <div className="xf-empty">Nenhuma entrega pendente</div>
              )}
              {pendingDeliveries.map((e) => (
                <div key={e.id} className="xf-delivery-card" onClick={() => setSelectedDelivery(e)}>
                  <div className="xf-delivery-icon icon-pend">📦</div>
                  <div className="xf-delivery-body">
                    <div className="xf-delivery-top">
                      <span className="xf-delivery-op">{e.client_name || 'Cliente'}</span>
                      <span className="xf-delivery-badge badge-pend">Aguardando</span>
                    </div>
                    <div className="xf-delivery-dest">{e.client_name || 'Cliente'}</div>
                    <div className="xf-delivery-addr">{e.bairro || '—'}</div>
                    <div className="xf-delivery-meta">
                      <span className="xf-meta-item">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ verticalAlign: 'middle', marginRight: 2 }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        {e.distance_km || '?'} km
                      </span>
                      <span className="xf-delivery-value">R$ {Number(e.total || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Concluídas hoje */}
          <div>
            <div className="xf-section-label">
              Concluídas hoje
              <span className="xf-count-badge">{counts.done}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {doneDeliveries.length === 0 && (
                <div className="xf-empty">Nenhuma entrega concluída</div>
              )}
              {doneDeliveries.map((e) => (
                <div key={e.id} className="xf-delivery-card">
                  <div className="xf-delivery-icon icon-done">✅</div>
                  <div className="xf-delivery-body">
                    <div className="xf-delivery-top">
                      <span className="xf-delivery-op">#{e.order_id?.slice(0, 8) || '—'} · {e.client_name || 'Cliente'}</span>
                      <span className="xf-delivery-badge badge-done">Entregue</span>
                    </div>
                    <div className="xf-delivery-dest">{e.client_name || 'Cliente'}</div>
                    <div className="xf-delivery-addr">{e.bairro || '—'}</div>
                    <div className="xf-delivery-meta">
                      <span className="xf-meta-item">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ verticalAlign: 'middle', marginRight: 2 }}><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                        {e.estimated_time || '—'}
                      </span>
                      <span className="xf-delivery-value">R$ {Number(e.total || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de validação */}
      {validationOpen && (
        <div className="xf-modal-overlay" onClick={() => setValidationOpen(null)}>
          <div className="xf-modal" onClick={(ev) => ev.stopPropagation()}>
            <h3>Validar Entrega</h3>
            {(() => {
              const delivery = deliveries.find(d => d.id === validationOpen);
              if (!delivery) return null;
              const phoneDigits = (delivery.client_phone || '').replace(/\D/g, '').slice(-4);
              const maskedPhone = delivery.client_phone
                ? delivery.client_phone.replace(/\d(?=\d{4})/g, '*')
                : '—';
              return (
                <>
                  <div className="xf-modal-client">
                    <strong>{delivery.client_name || 'Cliente'}</strong>
                    <span>📞 {maskedPhone}</span>
                    <span>📍 {delivery.bairro || '—'}</span>
                    <span className="xf-modal-hint">Código: últimos 4 dígitos do telefone</span>
                  </div>
                  <p>Informe o código de 4 dígitos:</p>
                  <input
                    type="text"
                    maxLength={4}
                    placeholder="0000"
                    value={otp}
                    onChange={(ev) => setOtp(ev.target.value.replace(/\D/g, ''))}
                    autoFocus
                  />
                  <div className="xf-modal-actions">
                    <button className="xf-btn-cancel" onClick={() => setValidationOpen(null)}>Cancelar</button>
                    <button className="xf-btn-confirm" onClick={() => handleValidate(delivery.id)} disabled={otp.length < 4 || validating}>
                      {validating ? 'Validando...' : 'Confirmar'}
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
