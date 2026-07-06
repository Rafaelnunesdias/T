import { useState } from 'react';
import { Store, Globe, DollarSign, Bell, Shield, Smartphone } from 'lucide-react';
import './ConfigPage.css';

export default function ConfigPage() {
  const [business, setBusiness] = useState({
    name: 'Fábrica de Salgados Sabor & Cia',
    type: 'Fábrica de Salgados',
    email: 'contato@saborcia.com.br',
    phone: '(31) 99999-8888',
    address: 'Rua das Indústrias, 1000 - Centro',
    deliveryFee: 5.00,
    freeDeliveryFrom: 50.00,
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="config-page">
      <div className="config-header">
        <h1>Configurações</h1>
        <p>Gerencie as informações do seu negócio</p>
      </div>

      <div className="config-grid">
        <section className="config-section">
          <div className="section-header"><Store size={18} color="#fc6901" /><h2>Dados do Negócio</h2></div>
          <div className="config-field">
            <label>Nome do Negócio</label>
            <input value={business.name} onChange={e => setBusiness({...business, name: e.target.value})} />
          </div>
          <div className="config-field">
            <label>Tipo</label>
            <select value={business.type} onChange={e => setBusiness({...business, type: e.target.value})}>
              <option>Fábrica de Salgados</option>
              <option>Restaurante</option>
              <option>Pizzaria</option>
              <option>Hamburgueria</option>
              <option>Padaria</option>
              <option>Outro</option>
            </select>
          </div>
          <div className="config-field">
            <label>E-mail</label>
            <input value={business.email} onChange={e => setBusiness({...business, email: e.target.value})} />
          </div>
          <div className="config-field">
            <label>Telefone</label>
            <input value={business.phone} onChange={e => setBusiness({...business, phone: e.target.value})} />
          </div>
          <div className="config-field">
            <label>Endereço</label>
            <input value={business.address} onChange={e => setBusiness({...business, address: e.target.value})} />
          </div>
        </section>

        <section className="config-section">
          <div className="section-header"><DollarSign size={18} color="#10b981" /><h2>Taxas de Entrega</h2></div>
          <div className="config-field">
            <label>Taxa de Entrega Padrão (R$)</label>
            <input type="number" step="0.5" value={business.deliveryFee} onChange={e => setBusiness({...business, deliveryFee: parseFloat(e.target.value) || 0})} />
          </div>
          <div className="config-field">
            <label>Frete Grátis Acima de (R$)</label>
            <input type="number" step="5" value={business.freeDeliveryFrom} onChange={e => setBusiness({...business, freeDeliveryFrom: parseFloat(e.target.value) || 0})} />
          </div>
        </section>

        <section className="config-section">
          <div className="section-header"><Globe size={18} color="#3b82f6" /><h2>Personalização</h2></div>
          <div className="config-field">
            <label>Cor Primária</label>
            <div className="color-picker">
              <input type="color" value="#fc6901" />
              <span>#fc6901</span>
            </div>
          </div>
          <div className="config-field">
            <label>Cor Secundária</label>
            <div className="color-picker">
              <input type="color" value="#7b4b34" />
              <span>#7b4b34</span>
            </div>
          </div>
          <div className="config-field">
            <label>Logo</label>
            <button className="upload-btn">Fazer upload</button>
          </div>
        </section>
      </div>

      <div className="config-save">
        <button className="save-btn" onClick={handleSave}>
          {saved ? '✓ Salvo!' : 'Salvar Alterações'}
        </button>
      </div>
    </div>
  );
}
