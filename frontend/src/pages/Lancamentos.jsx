import React, { useState, useEffect } from 'react';
import { funcionarioService, servicoService, equipamentoService } from '../services/api';

export default function Lancamentos() {
  const [operation, setOperation] = useState('horas');
  const [workers, setWorkers] = useState([]);
  const [services, setServices] = useState([]);
  const [tools, setTools] = useState([]);
  
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const [w, s, t] = await Promise.all([
        funcionarioService.listar(),
        servicoService.listar(),
        equipamentoService.listar()
      ]);
      setWorkers(w || []);
      setServices(s || []);
      setTools(t || []);
    } catch (err) {
      console.error('Erro ao carregar listas', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOperationChange = (e) => {
    setOperation(e.target.value);
    setFormData({});
    setMessage('');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      if (operation === 'horas') {
        if (!formData.worker_id || !formData.date || !formData.hours) throw new Error("Preencha todos os campos");
        await funcionarioService.registrarHoras(formData.worker_id, {
          date: formData.date,
          hours_worked: formData.hours
        });
        setMessage('Horas registradas com sucesso!');
      } else if (operation === 'associar_servico') {
        if (!formData.service_id || !formData.worker_id) throw new Error("Selecione funcionário e serviço");
        await servicoService.associarFuncionario(formData.service_id, formData.worker_id);
        setMessage('Funcionário associado ao serviço com sucesso!');
      } else if (operation === 'desassociar_servico') {
        if (!formData.service_id || !formData.worker_id) throw new Error("Selecione funcionário e serviço");
        await servicoService.desassociarFuncionario(formData.service_id, formData.worker_id);
        setMessage('Funcionário desassociado do serviço com sucesso!');
      } else if (operation === 'emprestar_ferramenta') {
        if (!formData.tool_id || !formData.worker_id) throw new Error("Selecione funcionário e ferramenta");
        await equipamentoService.emprestar(formData.tool_id, formData.worker_id, formData.condition_out || 'available');
        setMessage('Ferramenta emprestada com sucesso!');
      } else if (operation === 'devolver_ferramenta') {
        if (!formData.tool_id) throw new Error("Selecione a ferramenta");
        await equipamentoService.devolver(formData.tool_id, formData.condition_in || 'available');
        setMessage('Ferramenta devolvida com sucesso!');
      }
      setFormData({});
    } catch (err) {
      setError(err.message || 'Erro ao realizar operação');
    } finally {
      setLoading(false);
    }
  };

  const containerStyle = { marginBottom: '30px', padding: '20px', backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '5px' };
  const inputStyle = { padding: '8px', border: '1px solid #ccc', borderRadius: '4px', width: '100%', boxSizing: 'border-box' };
  const btnStyle = { padding: '10px 15px', cursor: 'pointer', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '3px', width: '100%' };
  const formGroup = { marginBottom: '15px' };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={containerStyle}>
        <h2 style={{ marginTop: 0 }}>Lançamentos e Operações</h2>
        
        <div style={formGroup}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Selecione a Operação:</label>
          <select value={operation} onChange={handleOperationChange} style={inputStyle}>
            <option value="horas">Registrar Horas Trabalhadas</option>
            <option value="associar_servico">Associar Funcionário a Serviço</option>
            <option value="desassociar_servico">Desassociar Funcionário de Serviço</option>
            <option value="emprestar_ferramenta">Emprestar Ferramenta</option>
            <option value="devolver_ferramenta">Devolver Ferramenta</option>
          </select>
        </div>

        <form onSubmit={handleSubmit}>
          
          {(operation === 'horas' || operation === 'associar_servico' || operation === 'desassociar_servico' || operation === 'emprestar_ferramenta') && (
            <div style={formGroup}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Funcionário:</label>
              <select name="worker_id" value={formData.worker_id || ''} onChange={handleInputChange} style={inputStyle}>
                <option value="">Selecione um Funcionário</option>
                {workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
          )}

          {(operation === 'associar_servico' || operation === 'desassociar_servico') && (
            <div style={formGroup}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Serviço:</label>
              <select name="service_id" value={formData.service_id || ''} onChange={handleInputChange} style={inputStyle}>
                <option value="">Selecione um Serviço</option>
                {services.map(s => <option key={s.id} value={s.id}>{s.name} ({s.status})</option>)}
              </select>
            </div>
          )}

          {(operation === 'emprestar_ferramenta' || operation === 'devolver_ferramenta') && (
            <div style={formGroup}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Ferramenta:</label>
              <select name="tool_id" value={formData.tool_id || ''} onChange={handleInputChange} style={inputStyle}>
                <option value="">Selecione uma Ferramenta</option>
                {tools.map(t => <option key={t.id} value={t.id}>{t.name} ({t.status})</option>)}
              </select>
            </div>
          )}

          {operation === 'horas' && (
            <>
              <div style={formGroup}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Data:</label>
                <input type="date" name="date" value={formData.date || ''} onChange={handleInputChange} style={inputStyle} />
              </div>
              <div style={formGroup}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Horas Trabalhadas:</label>
                <input type="number" step="0.1" name="hours" value={formData.hours || ''} onChange={handleInputChange} style={inputStyle} />
              </div>
            </>
          )}

          {operation === 'emprestar_ferramenta' && (
            <div style={formGroup}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Condição de Saída:</label>
              <select name="condition_out" value={formData.condition_out || 'available'} onChange={handleInputChange} style={inputStyle}>
                <option value="available">Available</option>
                <option value="broken">Broken</option>
                <option value="lost">Lost</option>
              </select>
            </div>
          )}

          {operation === 'devolver_ferramenta' && (
            <div style={formGroup}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Condição de Retorno:</label>
              <select name="condition_in" value={formData.condition_in || 'available'} onChange={handleInputChange} style={inputStyle}>
                <option value="available">Available</option>
                <option value="broken">Broken</option>
                <option value="lost">Lost</option>
              </select>
            </div>
          )}

          <button type="submit" style={btnStyle} disabled={loading}>
            {loading ? 'Processando...' : 'Executar Lançamento'}
          </button>
        </form>

        {message && <p style={{ color: 'green', marginTop: '15px' }}>{message}</p>}
        {error && <p style={{ color: 'red', marginTop: '15px' }}>{error}</p>}
      </div>
    </div>
  );
}
