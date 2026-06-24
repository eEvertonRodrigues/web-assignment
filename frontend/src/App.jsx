import React, { useState } from 'react';
import Menu from './components/Menu';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Relatorios from './pages/Relatorios';
import Lancamentos from './pages/Lancamentos';

function App() {
  const [pagina, setPagina] = useState('home');

  return (
    <div style={{
      fontFamily: 'Arial, sans-serif',
      margin: '0',
      padding: '0',
      minHeight: '100vh',
      backgroundColor: '#f9f9f9'
    }}>
      <Menu setPagina={setPagina} />

      <main style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        {pagina === 'home' && <Home />}
        {pagina === 'dashboard' && <Dashboard />}
        {pagina === 'lancamentos' && <Lancamentos />}
        {pagina === 'relatorios' && <Relatorios />}
      </main>
    </div>
  );
}

export default App;
