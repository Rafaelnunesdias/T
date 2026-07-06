import { useRef, useEffect, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import './MapaRotas.css';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || '';

const DEFAULT_CENTER = [-43.9345, -19.9167];
const DEFAULT_ZOOM = 12;

const ZONE_CONFIG = {
  verde:  { radiusKm: 3,  fill: 'rgba(16,185,129,0.1)', stroke: '#10b981' },
  azul:   { radiusKm: 8,  fill: 'rgba(59,130,246,0.08)', stroke: '#3b82f6' },
  roxa:   { radiusKm: 15, fill: 'rgba(139,92,246,0.06)', stroke: '#8b5cf6' },
};

function circleToGeoJSON(centerLng, centerLat, radiusKm, points = 64) {
  const coords = [];
  const kmPerDegLat = 111.32;
  const kmPerDegLng = 111.32 * Math.cos((centerLat * Math.PI) / 180);

  for (let i = 0; i <= points; i++) {
    const angle = (i / points) * 2 * Math.PI;
    const dx = radiusKm * Math.cos(angle);
    const dy = radiusKm * Math.sin(angle);
    coords.push([
      centerLng + dx / kmPerDegLng,
      centerLat + dy / kmPerDegLat,
    ]);
  }

  return {
    type: 'Feature',
    properties: {},
    geometry: { type: 'Polygon', coordinates: [coords] },
  };
}

export default function MapaRotas({
  routes,
  motoboys,
  factoryCoords,
  zones,
  selectedRouteId,
  activeZone = 'all',
  onMarkerClick,
  height,
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef({ factory: null, motoboys: [], deliveries: [] });
  const zoneSourceIdsRef = useRef([]);
  const mapReadyRef = useRef(false);
  const motoboysRef = useRef(motoboys);
  const routesRef = useRef(routes);
  const factoryCoordsRef = useRef(factoryCoords);
  const zonesRef = useRef(zones);
  const selectedRouteIdRef = useRef(selectedRouteId);
  const activeZoneRef = useRef(activeZone);
  const onMarkerClickRef = useRef(onMarkerClick);

  /* Keep refs in sync with props */
  motoboysRef.current = motoboys;
  routesRef.current = routes;
  factoryCoordsRef.current = factoryCoords;
  zonesRef.current = zones;
  selectedRouteIdRef.current = selectedRouteId;
  activeZoneRef.current = activeZone;
  onMarkerClickRef.current = onMarkerClick;

  const center = factoryCoords || DEFAULT_CENTER;
  const stableZones = zones || [{ label: 'verde' }, { label: 'azul' }, { label: 'roxa' }];

  /* ---------- cleanup helper ---------- */
  const clearMarkers = useCallback(() => {
    const { factory, motoboys, deliveries } = markersRef.current;
    if (factory) factory.remove();
    motoboys.forEach((m) => m.remove());
    deliveries.forEach((m) => m.remove());
    markersRef.current = { factory: null, motoboys: [], deliveries: [] };
  }, []);

  /* ---------- render helpers (use current refs) ---------- */
  function addFactoryMarker() {
    const map = mapRef.current;
    if (!map) return;
    const prev = markersRef.current.factory;
    if (prev) prev.remove();
    const fc = factoryCoordsRef.current;
    if (!fc) return;
    const el = document.createElement('div');
    el.className = 'factory-marker';
    el.title = 'Fábrica';
    const marker = new mapboxgl.Marker({ element: el }).setLngLat(fc).addTo(map);
    markersRef.current.factory = marker;
  }

  function addMotoboyMarkers() {
    const map = mapRef.current;
    if (!map) return;
    const prev = markersRef.current.motoboys;
    prev.forEach((m) => m.remove());
    markersRef.current.motoboys = [];
    const mbs = motoboysRef.current;
    if (!mbs || mbs.length === 0) return;
    const cb = onMarkerClickRef.current;
    const newMarkers = mbs.map((mb) => {
      const el = document.createElement('div');
      el.className = 'motoboy-marker';
      el.innerHTML = '&#x1F3CD;&#xFE0F;';
      el.title = mb.nome || mb.name || 'Motoboy';
      if (cb) el.addEventListener('click', () => cb(mb));
      const coords = mb.coords || [mb.lng, mb.lat];
      return new mapboxgl.Marker({ element: el }).setLngLat(coords).addTo(map);
    });
    markersRef.current.motoboys = newMarkers;
  }

  function addDeliveryMarkers() {
    const map = mapRef.current;
    if (!map) return;
    const prev = markersRef.current.deliveries;
    prev.forEach((m) => m.remove());
    markersRef.current.deliveries = [];
    const rts = routesRef.current;
    if (!rts || rts.length === 0) return;
    const cb = onMarkerClickRef.current;
    const az = activeZoneRef.current;
    const srid = selectedRouteIdRef.current;
    const newMarkers = [];
    rts.forEach((route) => {
      const deliveries = route.entregas || route.deliveries || [];
      deliveries.forEach((del) => {
        const coords = del.coords || [del.lng, del.lat];
        if (!coords) return;
        const zone = (del.zona || del.zone || '').toLowerCase();
        const isInActiveZone = az === 'all' || zone === az;
        const el = document.createElement('div');
        el.className = `delivery-marker${route.id === srid ? ' selected' : ''}${!isInActiveZone ? ' hidden-delivery' : ''}`;
        el.textContent = del.numero || del.number || del.id || '';
        el.title = del.endereco || del.address || `Entrega ${del.id}`;
        if (cb) {
          el.addEventListener('click', (e) => { e.stopPropagation(); cb(del); });
        }
        newMarkers.push(new mapboxgl.Marker({ element: el }).setLngLat(coords).addTo(map));
      });
    });
    markersRef.current.deliveries = newMarkers;
  }

  function updateRouteLine() {
    const map = mapRef.current;
    if (!map) return;
    const source = map.getSource('route-line');
    if (!source) return;
    const srid = selectedRouteIdRef.current;
    if (!srid) {
      source.setData({ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: [] } });
      return;
    }
    const rts = routesRef.current || [];
    const route = rts.find((r) => r.id === srid || r.rota_id === srid);
    if (!route) return;
    const path = route.caminho || route.path || route.coordinates || [];
    const coordinates = path.map((p) => {
      if (Array.isArray(p)) return p;
      if (p.lng !== undefined && p.lat !== undefined) return [p.lng, p.lat];
      return null;
    }).filter(Boolean);
    if (coordinates.length > 0) {
      source.setData({ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates } });
      try {
        const bounds = coordinates.reduce((b, c) => b.extend(c), new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));
        map.fitBounds(bounds, { padding: 60, maxZoom: 15 });
      } catch (e) { /* ignore bounds errors */ }
    }
  }

  /* ---------- init map ---------- */
  useEffect(() => {
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center,
      zoom: DEFAULT_ZOOM,
    });

    map.on('load', () => {
      /* route source/layer */
      map.addSource('route-line', {
        type: 'geojson',
        data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: [] } },
      });
      map.addLayer({
        id: 'route-line-layer',
        type: 'line',
        source: 'route-line',
        paint: { 'line-color': '#fc6901', 'line-width': 4, 'line-opacity': 0.85 },
      });

      /* zone sources/layers */
      const usedZones = [...new Set(stableZones.map((z) => z.label))];
      usedZones.forEach((label) => {
        const cfg = ZONE_CONFIG[label];
        if (!cfg) return;
        const sid = `zone-${label.replace(/\s+/g, '-')}`;
        map.addSource(sid, { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
        map.addLayer({ id: `${sid}-fill`, type: 'fill', source: sid, paint: { 'fill-color': cfg.fill, 'fill-opacity': 1 } });
        map.addLayer({ id: `${sid}-outline`, type: 'line', source: sid, paint: { 'line-color': cfg.stroke, 'line-width': 2, 'line-opacity': 0.6 } });
        zoneSourceIdsRef.current.push(sid);
      });

      mapReadyRef.current = true;
      addMotoboyMarkers();
      addDeliveryMarkers();
      updateRouteLine();
    });

    mapRef.current = map;

    const onResize = () => map.resize();
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      clearMarkers();
      map.remove();
      mapRef.current = null;
      mapReadyRef.current = false;
      zoneSourceIdsRef.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- re-render markers when props change ---------- */
  useEffect(() => {
    addFactoryMarker();
  }, [factoryCoords]);

  useEffect(() => {
    addMotoboyMarkers();
  }, [motoboys, onMarkerClick]);

  useEffect(() => {
    addDeliveryMarkers();
  }, [routes, selectedRouteId, activeZone, onMarkerClick]);

  useEffect(() => {
    updateRouteLine();
  }, [selectedRouteId, routes]);

  /* ---------- zone circles ---------- */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReadyRef.current) return;

    zoneSourceIdsRef.current.forEach((sid) => {
      const src = map.getSource(sid);
      if (src) src.setData({ type: 'FeatureCollection', features: [] });
    });

    if (!zones || zones.length === 0) return;

    const groups = {};
    zones.forEach((z) => {
      const label = z.label || z.cor || z.tipo;
      if (!label) return;
      if (!groups[label]) groups[label] = [];
      groups[label].push(z);
    });

    Object.entries(groups).forEach(([label, items]) => {
      const cfg = ZONE_CONFIG[label];
      if (!cfg) return;
      const sid = `zone-${label.replace(/\s+/g, '-')}`;
      const src = map.getSource(sid);
      if (!src) return;
      const features = items.map((z) => {
        const coords = z.coords || [z.lng, z.lat] || center;
        return circleToGeoJSON(coords[0], coords[1], cfg.radiusKm);
      });
      src.setData({ type: 'FeatureCollection', features });
      const isActive = activeZone === 'all' || activeZone === label;
      if (map.getLayer(`${sid}-fill`)) {
        map.setPaintProperty(`${sid}-fill`, 'fill-opacity', isActive ? 1 : 0.3);
      }
      if (map.getLayer(`${sid}-outline`)) {
        map.setPaintProperty(`${sid}-outline`, 'line-opacity', isActive ? 0.6 : 0.15);
      }
    });
  }, [zones, center, activeZone]);

  /* ---------- container height ---------- */
  useEffect(() => {
    if (containerRef.current && height) {
      containerRef.current.style.height = height;
    }
  }, [height]);

  /* ---------- animate motoboys along routes (Uber/99 style) ---------- */
  useEffect(() => {
    if (!mapRef.current) return;

    const motoboyMarkers = markersRef.current.motoboys;
    if (motoboyMarkers.length === 0) return;

    const routePaths = {};
    const rts = routesRef.current || [];
    rts.forEach((r) => {
      const path = r.caminho || r.path || r.coordinates || [];
      const coords = path
        .map((p) => {
          if (Array.isArray(p)) return p;
          if (p.lng !== undefined && p.lat !== undefined) return [p.lng, p.lat];
          return null;
        })
        .filter(Boolean);
      if (coords.length > 0) {
        if (r.motoboy_id) routePaths[r.motoboy_id] = coords;
        else routePaths[r.id] = coords;
      }
    });

    if (Object.keys(routePaths).length === 0) return;

    if (!markersRef.current.animState) markersRef.current.animState = {};
    const animState = markersRef.current.animState;
    const motoboyData = motoboysRef.current || [];
    const moveMarkers = [];

    motoboyMarkers.forEach((marker, idx) => {
      const mb = motoboyData[idx];
      if (!mb) return;
      const mbId = mb.id;
      if (!animState[mbId]) {
        const path = routePaths[mbId] || routePaths[Object.keys(routePaths)[idx % Object.keys(routePaths).length]];
        if (!path) return;
        // Calcular comprimento total da rota para velocidade consistente
        let totalDist = 0;
        const segDists = [0];
        for (let i = 1; i < path.length; i++) {
          const dx = path[i][0] - path[i-1][0];
          const dy = path[i][1] - path[i-1][1];
          totalDist += Math.sqrt(dx*dx + dy*dy);
          segDists.push(totalDist);
        }
        // Velocidade: percorre a rota em ~60-90 segundos (quadros)
        const totalFrames = 600 + Math.random() * 300;
        const speedPerFrame = 1 / totalFrames;
        animState[mbId] = {
          path,
          segDists,
          totalDist,
          t: Math.random() * 0.5, // começa em ponto aleatório da rota
          speed: speedPerFrame,
        };
      }
      moveMarkers.push({ marker, mbId });
    });

    if (moveMarkers.length === 0) return;

    let rafId;
    let lastTime = performance.now();

    function animate(now) {
      const delta = Math.min(now - lastTime, 50); // cap delta em 50ms
      lastTime = now;
      let anyMoving = false;
      moveMarkers.forEach(({ marker, mbId }) => {
        const state = animState[mbId];
        if (!state || state.path.length < 2) return;

        // Avançar proporcional ao delta
        state.t += state.speed * (delta / 16.67); // normalizado para 60fps

        if (state.t >= 1) {
          state.t = 0; // loop: volta ao início da rota (como se pegasse nova entrega)
        }

        // Interpolação ao longo do caminho usando distância acumulada
        const targetDist = state.t * state.totalDist;
        let segIdx = 0;
        for (let i = 1; i < state.segDists.length; i++) {
          if (state.segDists[i] >= targetDist) { segIdx = i; break; }
        }
        // Fallback pro último segmento
        if (segIdx === 0) segIdx = 1;

        const segStart = state.segDists[segIdx - 1];
        const segEnd = state.segDists[segIdx];
        const segLen = segEnd - segStart;
        const frac = segLen > 0 ? (targetDist - segStart) / segLen : 0;
        const p0 = state.path[segIdx - 1];
        const p1 = state.path[Math.min(segIdx, state.path.length - 1)];
        if (!p0 || !p1) return;

        const lng = p0[0] + (p1[0] - p0[0]) * frac;
        const lat = p0[1] + (p1[1] - p0[1]) * frac;
        marker.setLngLat([lng, lat]);

        // Rotacionar o marcador na direção do movimento
        const angle = Math.atan2(p1[1] - p0[1], p1[0] - p0[0]) * (180 / Math.PI);
        marker.setRotation(angle);

        anyMoving = true;
      });
      if (anyMoving) rafId = requestAnimationFrame(animate);
    }

    rafId = requestAnimationFrame(animate);

    return () => { if (rafId) cancelAnimationFrame(rafId); };
  }, [motoboys, routes]);

  return <div ref={containerRef} className="mapa-rotas-container" />;
}
