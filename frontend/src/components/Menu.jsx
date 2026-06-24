import React, { useState } from 'react';
import { relatorioService } from '../services/api';

export default function Menu({ setPagina }) {
  const [loading, setLoading] = useState(false);

  const handleGraft = async () => {
    setLoading(true);
    try {
      await relatorioService.gerarDadosAleatorios();
      alert('Dados secundários gerados aleatoriamente com sucesso!');
    } catch (err) {
      alert('Erro ao gerar dados: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <nav style={{ 
      padding: '10px 20px', 
      background: '#eee', 
      marginBottom: '20px', 
      display: 'flex', 
      alignItems: 'center',
      borderBottom: '2px solid #ccc' 
    }}>
      <div 
        onClick={() => setPagina('home')}
        style={{ 
          cursor: 'pointer', 
          marginRight: '20px', 
          display: 'flex', 
          alignItems: 'center' 
        }}
        title="Home"
      >
        {/* Placeholder circular para a imagem */}
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: '#007BFF',
          color: '#FFF',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontWeight: 'bold',
          fontSize: '12px'
        }}>
          (O)
        </div>
      </div>

      <button
        onClick={() => setPagina('dashboard')}
        style={{ 
          marginRight: '10px', 
          padding: '8px 16px', 
          cursor: 'pointer' 
        }}
      >
        Dashboard
      </button>

      <button
        onClick={handleGraft}
        disabled={loading}
        style={{ 
          marginRight: '10px', 
          padding: '8px 16px', 
          cursor: loading ? 'wait' : 'pointer',
          backgroundColor: '#ffc107',
          border: '1px solid #d39e00',
          fontWeight: 'bold'
        }}
      >
        {loading ? 'Gerando...' : 'Graft Data'}
      </button>

      <button
        onClick={() => setPagina('relatorios')}
        style={{ 
          padding: '8px 16px', 
          cursor: 'pointer' 
        }}
      >
        Relatórios
      </button>
    </nav>
  );
}
