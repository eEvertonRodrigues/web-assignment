import React, { useState } from 'react';
import { relatorioService } from '../services/api';

export default function Relatorios() {
  const [reportType, setReportType] = useState('services'); // services, hours, tools
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setData([]);

    try {
      let result = [];
      if (reportType === 'services') {
        result = await relatorioService.servicos(startDate, endDate);
      } else if (reportType === 'hours') {
        result = await relatorioService.horas(startDate, endDate);
      } else if (reportType === 'tools') {
        result = await relatorioService.ferramentas(startDate, endDate);
      }
      setData(result || []);
    } catch (err) {
      setError(err.message || 'Erro ao gerar relatório');
    } finally {
      setLoading(false);
    }
  };

  const containerStyle = { marginBottom: '30px', padding: '15px', backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '5px' };
  const inputStyle = { padding: '8px', border: '1px solid #ccc', borderRadius: '4px', marginRight: '10px' };
  const btnStyle = { padding: '8px 15px', cursor: 'pointer', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '3px' };
  const tableStyle = { width: '100%', borderCollapse: 'collapse', marginTop: '20px' };
  const thStyle = { padding: '10px', backgroundColor: '#f0f0f0', border: '1px solid #ddd', textAlign: 'left' };
  const tdStyle = { padding: '10px', border: '1px solid #ddd' };

  return (
    <div>
      <div style={containerStyle}>
        <h2 style={{ marginTop: 0 }}>Gerar Relatório</h2>
        
        <form onSubmit={handleGenerate} style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <label style={{ marginRight: '5px' }}>Tipo de Relatório:</label>
            <select 
              value={reportType} 
              onChange={(e) => setReportType(e.target.value)} 
              style={inputStyle}
            >
              <option value="services">Serviços por Funcionário</option>
              <option value="hours">Horas Trabalhadas</option>
              <option value="tools">Histórico de Ferramentas</option>
            </select>
          </div>

          <div>
            <label style={{ marginRight: '5px' }}>Data Inicial:</label>
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)} 
              style={inputStyle} 
            />
          </div>

          <div>
            <label style={{ marginRight: '5px' }}>Data Final:</label>
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)} 
              style={inputStyle} 
            />
          </div>

          <button type="submit" style={btnStyle} disabled={loading}>
            {loading ? 'Gerando...' : 'Gerar'}
          </button>
        </form>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>

      <div style={containerStyle}>
        <h3 style={{ marginTop: 0 }}>Resultados do Relatório</h3>
        
        {data.length === 0 && !loading && <p>Nenhum dado encontrado para este período.</p>}
        {loading && <p>Carregando...</p>}
        
        {data.length > 0 && reportType === 'services' && (
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>ID do Funcionário</th>
                <th style={thStyle}>Nome</th>
                <th style={thStyle}>Serviços Concluídos</th>
                <th style={thStyle}>Serviços Pendentes</th>
              </tr>
            </thead>
            <tbody>
              {data.map(row => (
                <tr key={row.worker_id}>
                  <td style={tdStyle}>{row.worker_id}</td>
                  <td style={tdStyle}>{row.worker_name}</td>
                  <td style={tdStyle}>{row.completed_services}</td>
                  <td style={tdStyle}>{row.pending_services}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {data.length > 0 && reportType === 'hours' && (
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>ID do Funcionário</th>
                <th style={thStyle}>Nome</th>
                <th style={thStyle}>Horas Trabalhadas</th>
              </tr>
            </thead>
            <tbody>
              {data.map(row => (
                <tr key={row.worker_id}>
                  <td style={tdStyle}>{row.worker_id}</td>
                  <td style={tdStyle}>{row.worker_name}</td>
                  <td style={tdStyle}>{Number(row.total_hours).toFixed(2)}h</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {data.length > 0 && reportType === 'tools' && (
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>ID da Ferramenta</th>
                <th style={thStyle}>Ferramenta</th>
                <th style={thStyle}>Vezes Emprestada</th>
                <th style={thStyle}>Estado Atual</th>
              </tr>
            </thead>
            <tbody>
              {data.map(row => (
                <tr key={row.tool_id}>
                  <td style={tdStyle}>{row.tool_id}</td>
                  <td style={tdStyle}>{row.tool_name}</td>
                  <td style={tdStyle}>{row.times_borrowed}</td>
                  <td style={tdStyle}>{row.current_status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
