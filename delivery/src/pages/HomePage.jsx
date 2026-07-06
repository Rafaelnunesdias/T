import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ShoppingCart, Search, Star, Truck, Clock, MapPin } from 'lucide-react';
import './HomePage.css';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    const cart = localStorage.getItem('cart');
    if (cart) {
      setCartCount(JSON.parse(cart).length);
    }
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/delivery/products/public?business_id=3e03f0c7-03b9-4ede-a84f-7b04db0fc394');
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/delivery/categories?business_id=3e03f0c7-03b9-4ede-a84f-7b04db0fc394');
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesCategory = !selectedCategory || product.categories?.name === selectedCategory;
    const matchesSearch = !searchTerm || product.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = cart.find(item => item.id === product.id);
    
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    setCartCount(cart.length);
  };

  return (
    <div className="home-page">
      <header className="header">
        <div className="header-container">
          <div className="logo">
            <Truck size={32} color="#fc6901" />
            <h1>X Salgados Delivery</h1>
          </div>
          
          <div className="search-bar">
            <Search size={20} />
            <input
              type="text"
              placeholder="Buscar salgados, bebidas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button className="cart-button" onClick={() => navigate('/cart')}>
            <ShoppingCart size={24} />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>
        </div>
      </header>

      <section className="hero">
        <div className="hero-content">
          <h2>Os melhores salgados da cidade!</h2>
          <p>Feitos na hora, com ingredientes frescos e muito carinho</p>
          <button className="cta-button" onClick={() => document.getElementById('products').scrollIntoView({ behavior: 'smooth' })}>
            Fazer Pedido
          </button>
        </div>
      </section>

      <section className="features">
        <div className="feature-card">
          <Clock size={32} color="#fc6901" />
          <h3>Entrega Rápida</h3>
          <p>Receba em 30-40 minutos</p>
        </div>
        <div className="feature-card">
          <Star size={32} color="#fc6901" />
          <h3>Qualidade Premium</h3>
          <p>Ingredientes selecionados</p>
        </div>
        <div className="feature-card">
          <MapPin size={32} color="#fc6901" />
          <h3>Entrega em toda cidade</h3>
          <p>Frete a partir de R$5,00</p>
        </div>
      </section>

      <section id="products" className="products-section">
        <div className="products-container">
          <h2>Nossos Produtos</h2>

          <div className="categories">
            <button
              className={`category-btn ${!selectedCategory ? 'active' : ''}`}
              onClick={() => setSelectedCategory('')}
            >
              Todos
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                className={`category-btn ${selectedCategory === category.name ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category.name)}
              >
                {category.name}
              </button>
            ))}
          </div>

          <div className="products-grid">
            {filteredProducts.map((product) => (
              <div key={product.id} className="product-card">
                <div className="product-image">
                  🥟
                </div>
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <p>{product.description}</p>
                  <div className="product-footer">
                    <span className="price">R$ {product.price.toFixed(2)}</span>
                    <button
                      className="add-button"
                      onClick={() => addToCart(product)}
                    >
                      Adicionar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-container">
          <div className="footer-info">
            <h3>X Salgados</h3>
            <p>Rua dos Salgados, 123 - Centro</p>
            <p>(31) 3333-4444</p>
            <p>Seg-Dom: 18h às 23h</p>
          </div>
          <div className="footer-links">
            <h4>Links Úteis</h4>
            <a href="#">Sobre Nós</a>
            <a href="#">Contato</a>
            <a href="#">Política de Privacidade</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 X Salgados. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}