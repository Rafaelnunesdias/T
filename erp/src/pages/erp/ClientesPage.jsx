import { useState, useEffect } from 'react';
import { Search, Phone, MapPin, Package, TrendingUp, Star, ArrowLeft, X } from 'lucide-react';
import './ClientesPage.css';

const MOCK_CLIENTS = [
  {
    id: 1,
    name: 'João Silva',
    phone: '(11) 99876-5432',
    email: 'joao.silva@email.com',
    city: 'São Paulo',
    status: 'ativo',
    total_pedidos: 12,
    total_gasto: 2450.00,
    ultimos_pedidos: [
      { id: 101, created_at: '2026-06-20T14:30:00', total: 189.90, status: 'entregue' },
      { id: 102, created_at: '2026-06-10T19:15:00', total: 95.50, status: 'entregue' },
      { id: 103, created_at: '2026-06-01T12:00:00', total: 220.00, status: 'finalizado' },
    ],
    favorites: [
      { name: 'Hambúrguer Artesanal', count: 5 },
      { name: 'Combo Família', count: 3 },
      { name: 'Coca-Cola 2L', count: 4 },
    ],
    addresses: [
      { id: 'a1', street: 'Rua Augusta', number: 1250, neighborhood: 'Consolação', city: 'São Paulo', state: 'SP' },
      { id: 'a2', street: 'Av. Paulista', number: 800, neighborhood: 'Bela Vista', city: 'São Paulo', state: 'SP' },
    ],
  },
  {
    id: 2,
    name: 'Maria Oliveira',
    phone: '(31) 98765-4321',
    email: 'maria.oliveira@email.com',
    city: 'Belo Horizonte',
    status: 'ativo',
    total_pedidos: 8,
    total_gasto: 1890.00,
    ultimos_pedidos: [
      { id: 201, created_at: '2026-06-25T18:45:00', total: 145.00, status: 'entregue' },
      { id: 202, created_at: '2026-06-15T20:00:00', total: 78.00, status: 'entregue' },
      { id: 203, created_at: '2026-06-05T13:30:00', total: 210.00, status: 'finalizado' },
    ],
    favorites: [
      { name: 'Pizza Margherita', count: 4 },
      { name: 'Açaí 500ml', count: 3 },
    ],
    addresses: [
      { id: 'b1', street: 'Rua da Bahia', number: 450, neighborhood: 'Centro', city: 'Belo Horizonte', state: 'MG' },
    ],
  },
  {
    id: 3,
    name: 'Pedro Henrique',
    phone: '(21) 99765-4321',
    email: 'pedro.henrique@email.com',
    city: 'Rio de Janeiro',
    status: 'ativo',
    total_pedidos: 15,
    total_gasto: 3200.00,
    ultimos_pedidos: [
      { id: 301, created_at: '2026-06-28T19:00:00', total: 310.00, status: 'entregue' },
      { id: 302, created_at: '2026-06-18T12:15:00', total: 165.00, status: 'entregue' },
      { id: 303, created_at: '2026-06-08T20:30:00', total: 98.00, status: 'finalizado' },
    ],
    favorites: [
      { name: 'Combo Família', count: 6 },
      { name: 'Hambúrguer Artesanal', count: 4 },
      { name: 'Batata Frita', count: 5 },
    ],
    addresses: [
      { id: 'c1', street: 'Rua das Laranjeiras', number: 300, neighborhood: 'Laranjeiras', city: 'Rio de Janeiro', state: 'RJ' },
      { id: 'c2', street: 'Av. Atlântica', number: 1500, neighborhood: 'Copacabana', city: 'Rio de Janeiro', state: 'RJ' },
    ],
  },
  {
    id: 4,
    name: 'Ana Paula',
    phone: '(41) 99876-1234',
    email: 'ana.paula@email.com',
    city: 'Curitiba',
    status: 'ativo',
    total_pedidos: 6,
    total_gasto: 980.00,
    ultimos_pedidos: [
      { id: 401, created_at: '2026-06-22T17:20:00', total: 125.00, status: 'entregue' },
      { id: 402, created_at: '2026-06-12T14:00:00', total: 89.00, status: 'entregue' },
    ],
    favorites: [
      { name: 'Açaí 500ml', count: 3 },
      { name: 'Coca-Cola 2L', count: 2 },
    ],
    addresses: [
      { id: 'd1', street: 'Rua XV de Novembro', number: 780, neighborhood: 'Centro', city: 'Curitiba', state: 'PR' },
    ],
  },
  {
    id: 5,
    name: 'Carlos Eduardo',
    phone: '(51) 99654-3210',
    email: 'carlos.eduardo@email.com',
    city: 'Porto Alegre',
    status: 'ativo',
    total_pedidos: 22,
    total_gasto: 5100.00,
    ultimos_pedidos: [
      { id: 501, created_at: '2026-06-29T20:45:00', total: 420.00, status: 'entregue' },
      { id: 502, created_at: '2026-06-19T18:30:00', total: 275.00, status: 'entregue' },
      { id: 503, created_at: '2026-06-09T12:00:00', total: 190.00, status: 'finalizado' },
    ],
    favorites: [
      { name: 'Combo Família', count: 8 },
      { name: 'Pizza Margherita', count: 6 },
      { name: 'Batata Frita', count: 4 },
    ],
    addresses: [
      { id: 'e1', street: 'Rua dos Andradas', number: 1100, neighborhood: 'Centro Histórico', city: 'Porto Alegre', state: 'RS' },
      { id: 'e2', street: 'Av. Ipiranga', number: 600, neighborhood: 'República', city: 'Porto Alegre', state: 'RS' },
    ],
  },
  {
    id: 6,
    name: 'Fernanda Souza',
    phone: '(71) 99543-2109',
    email: 'fernanda.souza@email.com',
    city: 'Salvador',
    status: 'ativo',
    total_pedidos: 10,
    total_gasto: 1650.00,
    ultimos_pedidos: [
      { id: 601, created_at: '2026-06-24T16:00:00', total: 155.00, status: 'entregue' },
      { id: 602, created_at: '2026-06-14T19:30:00', total: 210.00, status: 'pendente' },
      { id: 603, created_at: '2026-06-04T13:45:00', total: 88.00, status: 'entregue' },
    ],
    favorites: [
      { name: 'Açaí 500ml', count: 4 },
      { name: 'Hambúrguer Artesanal', count: 3 },
    ],
    addresses: [
      { id: 'f1', street: 'Rua Chile', number: 250, neighborhood: 'Centro', city: 'Salvador', state: 'BA' },
    ],
  },
  {
    id: 7,
    name: 'Lucas Ferreira',
    phone: '(61) 99432-1098',
    email: 'lucas.ferreira@email.com',
    city: 'Brasília',
    status: 'ativo',
    total_pedidos: 18,
    total_gasto: 4300.00,
    ultimos_pedidos: [
      { id: 701, created_at: '2026-06-27T20:15:00', total: 380.00, status: 'entregue' },
      { id: 702, created_at: '2026-06-17T14:30:00', total: 195.00, status: 'entregue' },
      { id: 703, created_at: '2026-06-07T18:00:00', total: 240.00, status: 'finalizado' },
    ],
    favorites: [
      { name: 'Combo Família', count: 7 },
      { name: 'Pizza Margherita', count: 5 },
      { name: 'Coca-Cola 2L', count: 3 },
    ],
    addresses: [
      { id: 'g1', street: 'SQN 308, Bloco A', number: 102, neighborhood: 'Asa Norte', city: 'Brasília', state: 'DF' },
    ],
  },
  {
    id: 8,
    name: 'Juliana Costa',
    phone: '(85) 99321-0987',
    email: 'juliana.costa@email.com',
    city: 'Fortaleza',
    status: 'ativo',
    total_pedidos: 5,
    total_gasto: 720.00,
    ultimos_pedidos: [
      { id: 801, created_at: '2026-06-26T15:00:00', total: 145.00, status: 'entregue' },
      { id: 802, created_at: '2026-06-16T12:30:00', total: 90.00, status: 'entregue' },
    ],
    favorites: [
      { name: 'Batata Frita', count: 3 },
      { name: 'Coca-Cola 2L', count: 2 },
    ],
    addresses: [
      { id: 'h1', street: 'Rua Barão de Aracati', number: 600, neighborhood: 'Meireles', city: 'Fortaleza', state: 'CE' },
    ],
  },
  {
    id: 9,
    name: 'Rafael Santos',
    phone: '(92) 99210-9876',
    email: 'rafael.santos@email.com',
    city: 'Manaus',
    status: 'ativo',
    total_pedidos: 14,
    total_gasto: 2800.00,
    ultimos_pedidos: [
      { id: 901, created_at: '2026-06-23T19:45:00', total: 230.00, status: 'entregue' },
      { id: 902, created_at: '2026-06-13T13:00:00', total: 175.00, status: 'finalizado' },
      { id: 903, created_at: '2026-06-03T20:00:00', total: 310.00, status: 'entregue' },
    ],
    favorites: [
      { name: 'Hambúrguer Artesanal', count: 5 },
      { name: 'Combo Família', count: 4 },
      { name: 'Pizza Margherita', count: 3 },
    ],
    addresses: [
      { id: 'i1', street: 'Rua Ramos Ferreira', number: 1050, neighborhood: 'Centro', city: 'Manaus', state: 'AM' },
      { id: 'i2', street: 'Av. Djalma Batista', number: 1800, neighborhood: 'Chapada', city: 'Manaus', state: 'AM' },
    ],
  },
  {
    id: 10,
    name: 'Beatriz Lima',
    phone: '(81) 99109-8765',
    email: 'beatriz.lima@email.com',
    city: 'Recife',
    status: 'ativo',
    total_pedidos: 9,
    total_gasto: 1430.00,
    ultimos_pedidos: [
      { id: 1001, created_at: '2026-06-21T17:30:00', total: 160.00, status: 'entregue' },
      { id: 1002, created_at: '2026-06-11T14:15:00', total: 120.00, status: 'entregue' },
    ],
    favorites: [
      { name: 'Açaí 500ml', count: 4 },
      { name: 'Batata Frita', count: 3 },
    ],
    addresses: [
      { id: 'j1', street: 'Rua da Aurora', number: 350, neighborhood: 'Boa Vista', city: 'Recife', state: 'PE' },
    ],
  },
  {
    id: 11,
    name: 'Thiago Almeida',
    phone: '(62) 99098-7654',
    email: 'thiago.almeida@email.com',
    city: 'Goiânia',
    status: 'inativo',
    total_pedidos: 3,
    total_gasto: 450.00,
    ultimos_pedidos: [
      { id: 1101, created_at: '2026-05-20T18:00:00', total: 180.00, status: 'finalizado' },
      { id: 1102, created_at: '2026-05-10T15:30:00', total: 120.00, status: 'entregue' },
    ],
    favorites: [
      { name: 'Hambúrguer Artesanal', count: 2 },
    ],
    addresses: [
      { id: 'k1', street: 'Rua 84, nº 500', number: 500, neighborhood: 'Setor Central', city: 'Goiânia', state: 'GO' },
    ],
  },
  {
    id: 12,
    name: 'Camila Ribeiro',
    phone: '(91) 98987-6543',
    email: 'camila.ribeiro@email.com',
    city: 'Belém',
    status: 'ativo',
    total_pedidos: 7,
    total_gasto: 1120.00,
    ultimos_pedidos: [
      { id: 1201, created_at: '2026-06-25T16:45:00', total: 135.00, status: 'entregue' },
      { id: 1202, created_at: '2026-06-08T20:30:00', total: 95.00, status: 'entregue' },
    ],
    favorites: [
      { name: 'Açaí 500ml', count: 3 },
      { name: 'Pizza Margherita', count: 2 },
      { name: 'Coca-Cola 2L', count: 2 },
    ],
    addresses: [
      { id: 'l1', street: 'Rua do Padre Eutíquio', number: 900, neighborhood: 'Batista Campos', city: 'Belém', state: 'PA' },
    ],
  },
  {
    id: 13,
    name: 'Felipe Martins',
    phone: '(27) 98876-5432',
    email: 'felipe.martins@email.com',
    city: 'Vitória',
    status: 'ativo',
    total_pedidos: 11,
    total_gasto: 2100.00,
    ultimos_pedidos: [
      { id: 1301, created_at: '2026-06-28T19:30:00', total: 205.00, status: 'pendente' },
      { id: 1302, created_at: '2026-06-18T13:00:00', total: 170.00, status: 'entregue' },
      { id: 1303, created_at: '2026-06-06T17:15:00', total: 145.00, status: 'entregue' },
    ],
    favorites: [
      { name: 'Combo Família', count: 4 },
      { name: 'Hambúrguer Artesanal', count: 3 },
    ],
    addresses: [
      { id: 'm1', street: 'Av. Jerônimo Monteiro', number: 700, neighborhood: 'Centro', city: 'Vitória', state: 'ES' },
      { id: 'm2', street: 'Rua Sete de Setembro', number: 250, neighborhood: 'Centro', city: 'Vitória', state: 'ES' },
    ],
  },
  {
    id: 14,
    name: 'Larissa Pereira',
    phone: '(48) 98765-4321',
    email: 'larissa.pereira@email.com',
    city: 'Florianópolis',
    status: 'ativo',
    total_pedidos: 20,
    total_gasto: 4800.00,
    ultimos_pedidos: [
      { id: 1401, created_at: '2026-06-30T12:00:00', total: 350.00, status: 'entregue' },
      { id: 1402, created_at: '2026-06-20T18:45:00', total: 280.00, status: 'entregue' },
      { id: 1403, created_at: '2026-06-10T14:30:00', total: 195.00, status: 'finalizado' },
    ],
    favorites: [
      { name: 'Pizza Margherita', count: 8 },
      { name: 'Batata Frita', count: 6 },
      { name: 'Coca-Cola 2L', count: 5 },
    ],
    addresses: [
      { id: 'n1', street: 'Rua Tenente Marones de Gusmão', number: 120, neighborhood: 'Centro', city: 'Florianópolis', state: 'SC' },
    ],
  },
  {
    id: 15,
    name: 'Gabriel Rodrigues',
    phone: '(43) 98654-3210',
    email: 'gabriel.rodrigues@email.com',
    city: 'Londrina',
    status: 'inativo',
    total_pedidos: 4,
    total_gasto: 680.00,
    ultimos_pedidos: [
      { id: 1501, created_at: '2026-05-15T17:00:00', total: 165.00, status: 'entregue' },
      { id: 1502, created_at: '2026-04-25T19:30:00', total: 130.00, status: 'finalizado' },
    ],
    favorites: [
      { name: 'Hambúrguer Artesanal', count: 2 },
      { name: 'Batata Frita', count: 1 },
    ],
    addresses: [
      { id: 'o1', street: 'Av. Higienópolis', number: 800, neighborhood: 'Centro', city: 'Londrina', state: 'PR' },
    ],
  },
  {
    id: 16,
    name: 'Mariana Nascimento',
    phone: '(32) 98543-2109',
    email: 'mariana.nascimento@email.com',
    city: 'Juiz de Fora',
    status: 'ativo',
    total_pedidos: 16,
    total_gasto: 3500.00,
    ultimos_pedidos: [
      { id: 1601, created_at: '2026-06-26T20:00:00', total: 290.00, status: 'entregue' },
      { id: 1602, created_at: '2026-06-16T15:15:00', total: 215.00, status: 'entregue' },
      { id: 1603, created_at: '2026-06-06T13:45:00', total: 180.00, status: 'finalizado' },
    ],
    favorites: [
      { name: 'Combo Família', count: 6 },
      { name: 'Pizza Margherita', count: 4 },
      { name: 'Açaí 500ml', count: 3 },
    ],
    addresses: [
      { id: 'p1', street: 'Rua Halfeld', number: 1000, neighborhood: 'Centro', city: 'Juiz de Fora', state: 'MG' },
      { id: 'p2', street: 'Av. Presidente Itamar Franco', number: 500, neighborhood: 'Boa Vista', city: 'Juiz de Fora', state: 'MG' },
    ],
  },
  {
    id: 17,
    name: 'Igor Costa',
    phone: '(19) 98432-1098',
    email: 'igor.costa@email.com',
    city: 'Campinas',
    status: 'ativo',
    total_pedidos: 13,
    total_gasto: 2750.00,
    ultimos_pedidos: [
      { id: 1701, created_at: '2026-06-27T13:30:00', total: 240.00, status: 'entregue' },
      { id: 1702, created_at: '2026-06-17T19:00:00', total: 185.00, status: 'entregue' },
    ],
    favorites: [
      { name: 'Hambúrguer Artesanal', count: 5 },
      { name: 'Coca-Cola 2L', count: 4 },
    ],
    addresses: [
      { id: 'q1', street: 'Rua Barão de Jaguara', number: 900, neighborhood: 'Centro', city: 'Campinas', state: 'SP' },
    ],
  },
  {
    id: 18,
    name: 'Patrícia Santos',
    phone: '(13) 98321-0987',
    email: 'patricia.santos@email.com',
    city: 'Santos',
    status: 'inativo',
    total_pedidos: 2,
    total_gasto: 320.00,
    ultimos_pedidos: [
      { id: 1801, created_at: '2026-04-10T16:00:00', total: 180.00, status: 'entregue' },
    ],
    favorites: [
      { name: 'Pizza Margherita', count: 1 },
    ],
    addresses: [
      { id: 'r1', street: 'Rua XV de Novembro', number: 150, neighborhood: 'Centro', city: 'Santos', state: 'SP' },
    ],
  },
  {
    id: 19,
    name: 'André Oliveira',
    phone: '(21) 98210-9876',
    email: 'andre.oliveira@email.com',
    city: 'Niterói',
    status: 'ativo',
    total_pedidos: 19,
    total_gasto: 4100.00,
    ultimos_pedidos: [
      { id: 1901, created_at: '2026-06-29T15:45:00', total: 340.00, status: 'entregue' },
      { id: 1902, created_at: '2026-06-19T20:15:00', total: 260.00, status: 'entregue' },
      { id: 1903, created_at: '2026-06-09T14:00:00', total: 195.00, status: 'finalizado' },
    ],
    favorites: [
      { name: 'Combo Família', count: 7 },
      { name: 'Batata Frita', count: 5 },
      { name: 'Hambúrguer Artesanal', count: 4 },
    ],
    addresses: [
      { id: 's1', street: 'Rua São Francisco', number: 400, neighborhood: 'Centro', city: 'Niterói', state: 'RJ' },
      { id: 's2', street: 'Av. Ernani do Amaral Peixoto', number: 300, neighborhood: 'Centro', city: 'Niterói', state: 'RJ' },
    ],
  },
  {
    id: 20,
    name: 'Isabela Fernandes',
    phone: '(16) 98109-8765',
    email: 'isabela.fernandes@email.com',
    city: 'Ribeirão Preto',
    status: 'ativo',
    total_pedidos: 8,
    total_gasto: 1350.00,
    ultimos_pedidos: [
      { id: 2001, created_at: '2026-06-24T18:30:00', total: 175.00, status: 'entregue' },
      { id: 2002, created_at: '2026-06-14T13:00:00', total: 130.00, status: 'pendente' },
    ],
    favorites: [
      { name: 'Açaí 500ml', count: 3 },
      { name: 'Coca-Cola 2L', count: 2 },
      { name: 'Batata Frita', count: 2 },
    ],
    addresses: [
      { id: 't1', street: 'Rua Augusta', number: 500, neighborhood: 'Centro', city: 'Ribeirão Preto', state: 'SP' },
    ],
  },
];

export default function ClientesPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setClients(MOCK_CLIENTS);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const viewClient = (client) => {
    setSelectedClient(client);
  };

  const closeProfile = () => {
    setSelectedClient(null);
  };

  const filtered = clients.filter(c =>
    !search || c.name?.toLowerCase().includes(search.toLowerCase()) || c.phone?.includes(search)
  );

  return (
    <div className="clientes-page">
      <div className="clientes-header">
        <div>
          <h1>Clientes</h1>
          <p>{clients.length} clientes cadastrados</p>
        </div>
      </div>

      <div className="search-input">
        <Search size={16} />
        <input placeholder="Buscar por nome ou telefone..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="clientes-grid">
        {loading ? <p className="loading-text">Carregando...</p> :
         filtered.length === 0 ? <p className="loading-text">Nenhum cliente encontrado</p> :
         filtered.map(client => (
           <div key={client.id} className="cliente-card" onClick={() => viewClient(client)}>
             <div className="cliente-avatar">{client.name?.charAt(0)?.toUpperCase() || '?'}</div>
             <div className="cliente-info">
               <h3>{client.name}</h3>
               <span className="cliente-phone">{client.phone || '—'}</span>
               <div className="cliente-stats">
                 <span><Package size={12} /> {client.total_pedidos || 0} pedidos</span>
                 <span><TrendingUp size={12} /> R$ {(client.total_gasto || 0).toFixed(2)}</span>
               </div>
             </div>
           </div>
         ))}
      </div>

      {selectedClient && (
        <div className="modal-overlay" onClick={closeProfile}>
          <div className="modal-content modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Perfil do Cliente</h3>
              <button className="btn-icon" onClick={closeProfile}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="perfil-header">
                <div className="perfil-avatar">{selectedClient.name?.charAt(0)?.toUpperCase() || '?'}</div>
                <div>
                  <h2>{selectedClient.name}</h2>
                  <p className="perfil-phone"><Phone size={14} /> {selectedClient.phone || '—'}</p>
                  {selectedClient.email && <p className="perfil-email">{selectedClient.email}</p>}
                </div>
              </div>

              <div className="perfil-stats">
                <div className="stat-card"><span className="stat-value">{selectedClient.total_pedidos || 0}</span><span className="stat-label">Pedidos</span></div>
                <div className="stat-card"><span className="stat-value">R$ {(selectedClient.total_gasto || 0).toFixed(2)}</span><span className="stat-label">Total Gasto</span></div>
              </div>

              {selectedClient.favorites?.length > 0 && (
                <>
                  <h4 className="section-title"><Star size={16} /> Produtos Favoritos</h4>
                  <div className="favorites-list">
                    {selectedClient.favorites.slice(0, 5).map((fav, i) => (
                      <div key={i} className="favorite-item">
                        <span className="fav-name">{fav.name}</span>
                        <span className="fav-count">{fav.count}x comprado</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {selectedClient.addresses?.length > 0 && (
                <>
                  <h4 className="section-title"><MapPin size={16} /> Endereços Salvos</h4>
                  <div className="addresses-list">
                    {selectedClient.addresses.map(addr => (
                      <div key={addr.id} className="address-item">
                        <MapPin size={14} />
                        <span>{addr.street}, {addr.number}{addr.neighborhood ? ` - ${addr.neighborhood}` : ''}</span>
                        <span className="address-city">{addr.city}/{addr.state}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <h4 className="section-title"><Package size={16} /> Últimos Pedidos</h4>
              {selectedClient.ultimos_pedidos?.length > 0 ? (
                <div className="pedidos-list">
                  {selectedClient.ultimos_pedidos.map(ped => (
                    <div key={ped.id} className="pedido-item">
                      <span className="pedido-data">{new Date(ped.created_at).toLocaleDateString('pt-BR')}</span>
                      <span className="pedido-valor">R$ {Number(ped.total || 0).toFixed(2)}</span>
                      <span className={`status-badge status-${ped.status}`}>{ped.status}</span>
                    </div>
                  ))}
                </div>
              ) : <p className="no-data">Nenhum pedido encontrado</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
