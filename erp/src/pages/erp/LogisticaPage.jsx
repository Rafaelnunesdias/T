import { useState, useEffect, useCallback } from 'react';
import MapaRotas from '../../components/MapaRotas';
import api from '../../services/api';
import { Truck, MapPin, Clock, Package, RefreshCw, Navigation, DollarSign, Users, Bike } from 'lucide-react';
import './LogisticaPage.css';

const ZONE_INFO = {
  verde: { label: 'Verde', radius: '3 km', color: '#10b981', desc: 'Até 3 km' },
  azul: { label: 'Azul', radius: '3-8 km', color: '#2563eb', desc: '3 a 8 km' },
  roxa: { label: 'Roxa', radius: '8+ km', color: '#7c3aed', desc: 'Acima de 8 km' },
};

export default function LogisticaPage() {
  const [routes, setRoutes] = useState([]);
  const [motoboys, setMotoboys] = useState([]);
  const [factoryCoords, setFactoryCoords] = useState(null);
  const [zones, setZones] = useState([]);
  const [zoneStats, setZoneStats] = useState([]);
  const [selectedRouteId, setSelectedRouteId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [routesRes, zonesRes] = await Promise.allSettled([
        api.get('/erp/logistics/routes'),
        api.get('/erp/logistics/zones/stats'),
      ]);

      if (routesRes.status === 'fulfilled') {
        const data = routesRes.value.data;
        setRoutes(data.routes || []);
        const rawMotoboys = data.motoboys || [];
        setMotoboys(
          rawMotoboys.map(mb => ({
            id: mb.id,
            nome: mb.name || 'Motoboy',
            coords: [mb.lng || -43.9345, mb.lat || -19.9167],
            status: mb.status || 'disponivel',
          }))
        );
        setFactoryCoords(data.factoryCoords || null);
        setZones(data.zones || []);
      } else {
        console.error('Erro rotas:', routesRes.reason);
      }

      if (zonesRes.status === 'fulfilled') {
        setZoneStats(zonesRes.value.data.zones || []);
      }
    } catch (err) {
      console.error('Erro logistica:', err);
      setError(err.response?.data?.error || err.message || 'Erro ao carregar dados.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const allDeliveries = routes.map((del) => ({ ...del, routeId: del.id || del.rota_id }));

  const filteredDeliveries = activeTab === 'all'
    ? allDeliveries
    : allDeliveries.filter((del) => {
        const zone = (del.zona || del.zone || '').toLowerCase();
        return zone === activeTab;
      });

  const selectedDelivery = selectedRouteId != null
    ? allDeliveries.find((d) => d.id === selectedRouteId || d.routeId === selectedRouteId)
    : null;

  const statusInfo = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'em rota' || s === 'em_rota' || s === 'in_transit')
      return { label: 'Em Rota', cls: 'status-em-rota' };
    return { label: 'Pendente', cls: 'status-pendente' };
  };

  const skeleton = (count = 4) =>
    Array.from({ length: count }, (_, i) => <div key={i} className="delivery-skeleton" />);

  const zoneColor = (tab) => {
    const colors = { verde: '#10b981', azul: '#2563eb', roxa: '#7c3aed' };
    return colors[tab] || 'var(--primary)';
  };

  return (
    <div className="logistica-page">
      {/* HEADER */}
      <div className="logistica-header">
        <div>
          <h1>
            <Truck size={24} style={{ marginRight: 8, verticalAlign: 'middle' }} />
            Logística
          </h1>
          <p className="logistica-subtitle">
            Mapa de entregas e zonas — {loading ? '...' : `${allDeliveries.length} entrega(s) ativa(s)`}
          </p>
        </div>
        <button className="logistica-refresh-btn" onClick={fetchData} disabled={loading}>
          <RefreshCw size={16} className={loading ? 'spin' : ''} />
          Atualizar
        </button>
      </div>

      {/* ZONE STATS ROW */}
      {zoneStats.length > 0 && !loading && (
        <div className="zone-stats-row">
          {zoneStats.map((z) => {
            const info = ZONE_INFO[z.label] || { label: z.label, color: '#888' };
            return (
              <div
                key={z.label}
                className={`zone-stat-card ${activeTab === z.label ? 'active' : ''}`}
                style={{ '--zone-color': info.color }}
                onClick={() => { setActiveTab(z.label); setSelectedRouteId(null); }}
              >
                <div className="zone-stat-indicator" style={{ background: info.color }} />
                <div className="zone-stat-info">
                  <strong style={{ color: info.color }}>{info.label}</strong>
                  <span className="zone-stat-range">{info.desc}</span>
                </div>
                <div className="zone-stat-numbers">
                  <span><Package size={12} /> {z.pedidos}</span>
                  <span><Users size={12} /> {z.entregadores}</span>
                  <span><DollarSign size={12} /> R$ {Number(z.faturamento || 0).toFixed(0)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ERROR */}
      {error && (
        <div className="logistica-error">
          <span>{error}</span>
          <button onClick={fetchData}>Tentar novamente</button>
        </div>
      )}

      {/* CONTENT */}
      <div className="logistica-content">
        {/* MAP */}
        <div className="logistica-map">
          {loading ? (
            <div className="logistica-map-loading">
              <Truck size={32} />
              <span>Carregando mapa...</span>
            </div>
          ) : (
            <MapaRotas
              routes={routes}
              motoboys={motoboys}
              factoryCoords={factoryCoords}
              zones={zones}
              selectedRouteId={selectedRouteId}
              activeZone={activeTab}
              height="100%"
              onMarkerClick={(del) => setSelectedRouteId(del.id || del.routeId)}
            />
          )}
        </div>

        {/* SIDEBAR */}
        <div className="logistica-sidebar">
          {/* Zone tabs */}
          <div className="zone-tabs">
            {['all', 'verde', 'azul', 'roxa'].map((tab) => (
              <button
                key={tab}
                className={`zone-tab${activeTab === tab ? ' active' : ''}`}
                style={tab !== 'all' && activeTab === tab ? { background: zoneColor(tab), borderColor: zoneColor(tab) } : {}}
                onClick={() => { setActiveTab(tab); setSelectedRouteId(null); }}
              >
                {tab === 'all' ? (
                  'Todas'
                ) : (
                  <><span className="zone-dot" style={{ background: zoneColor(tab) }} /> {ZONE_INFO[tab]?.label || tab}</>
                )}
              </button>
            ))}
          </div>

          {/* Delivery count */}
          <div className="delivery-count">
            <Bike size={14} />
            {motoboys.length} motoboy(s) — {filteredDeliveries.length} entrega(s)
            {activeTab !== 'all' && ` na zona ${ZONE_INFO[activeTab]?.label || activeTab}`}
          </div>

          {/* Delivery list */}
          <div className="delivery-list">
            {loading ? (
              skeleton(4)
            ) : filteredDeliveries.length === 0 ? (
              <div className="delivery-empty">
                <Navigation size={32} />
                <p>Nenhuma entrega ativa no momento</p>
              </div>
            ) : (
              filteredDeliveries.map((del, idx) => {
                const info = statusInfo(del.status);
                const isSelected = del.id === selectedRouteId || del.routeId === selectedRouteId;
                return (
                  <div
                    key={del.id || del.numero || idx}
                    className={`delivery-item${isSelected ? ' selected' : ''}`}
                    onClick={() => setSelectedRouteId(isSelected ? null : (del.id || del.routeId))}
                  >
                    <div className="delivery-item-header">
                      <span className="delivery-client">
                        {del.client_name || del.cliente || del.client || del.nome || `Entrega #${del.id || del.numero}`}
                      </span>
                      <span className={`delivery-status ${info.cls}`}>{info.label}</span>
                    </div>
                    <div className="delivery-bairro">
                      <MapPin size={12} />
                      {del.bairro || del.neighborhood || del.endereco || del.address || 'Endereço não informado'}
                    </div>
                    <div className="delivery-meta">
                      <span><Clock size={12} /> {del.estimated_time || del.tempo_estimado || del.tempo || '-- min'}</span>
                      <span><Navigation size={12} /> {del.distance_km || del.distancia || del.distance ? `${del.distance_km || del.distancia || del.distance} km` : '-- km'}</span>
                      <span><Package size={12} /> R$ {Number(del.total || 0).toFixed(2)}</span>
                    </div>
                    {del.motoboy_name || del.motoboy || del.motoboy_nome ? (
                      <div className="delivery-motoboy">
                        <Truck size={12} />
                        {del.motoboy_name || del.motoboy || del.motoboy_nome}
                      </div>
                    ) : null}
                  </div>
                );
              })
            )}
          </div>

          {/* Mini detail card when delivery is selected */}
          {selectedDelivery && !loading && (
            <div className="delivery-detail">
              <div className="delivery-detail-header">
                <strong>{selectedDelivery.client_name || selectedDelivery.cliente || `Entrega #${selectedDelivery.id}`}</strong>
                <button className="delivery-detail-close" onClick={() => setSelectedRouteId(null)}>&times;</button>
              </div>
              <div className="delivery-detail-body">
                <p><MapPin size={14} /> {selectedDelivery.bairro || selectedDelivery.endereco || '--'}</p>
                <p><Clock size={14} /> Tempo: {selectedDelivery.estimated_time || selectedDelivery.tempo_estimado || '--'}</p>
                <p><Navigation size={14} /> Distância: {selectedDelivery.distance_km || selectedDelivery.distancia || selectedDelivery.distance ? `${selectedDelivery.distance_km || selectedDelivery.distancia || selectedDelivery.distance} km` : '--'}</p>
                <p><Package size={14} /> Total: R$ {Number(selectedDelivery.total || 0).toFixed(2)}</p>
                {selectedDelivery.client_phone && <p>📞 Tel: {selectedDelivery.client_phone}</p>}
                {selectedDelivery.motoboy_name && <p><Truck size={14} /> {selectedDelivery.motoboy_name}</p>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
