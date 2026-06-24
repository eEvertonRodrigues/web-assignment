import React, { useState, useEffect } from 'react';
import { equipamentoService, cidadeService, funcionarioService, servicoService, enderecoService, clienteService } from '../services/api';
import Modal from '../components/Modal';

export default function Dashboard() {
  const [equipamentos, setEquipamentos] = useState([]);
  const [cidades, setCidades] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [enderecos, setEnderecos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('');
  const [modalEntity, setModalEntity] = useState('');
  const [formData, setFormData] = useState({});

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const [eqs, cids, funcs, servs, ends, clis] = await Promise.all([
        equipamentoService.listar(),
        cidadeService.listar(),
        funcionarioService.listar(),
        servicoService.listar(),
        enderecoService.listar(),
        clienteService.listar()
      ]);
      setEquipamentos(eqs || []);
      setCidades(cids || []);
      setFuncionarios(funcs || []);
      setServicos(servs || []);
      setEnderecos(ends || []);
      setClientes(clis || []);
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    }
  };

  const openModal = (mode, entity, data = {}) => {
    setModalMode(mode);
    setModalEntity(entity);
    setFormData(data);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      if (modalEntity === 'equipamento') {
        if (modalMode === 'create') await equipamentoService.criar(formData);
        if (modalMode === 'edit') await equipamentoService.atualizar(formData.id, formData);
      } else if (modalEntity === 'cidade') {
        if (modalMode === 'create') await cidadeService.criar(formData);
        if (modalMode === 'edit') await cidadeService.atualizar(formData.id, formData);
      } else if (modalEntity === 'funcionario') {
        if (modalMode === 'create') await funcionarioService.criar(formData);
        if (modalMode === 'edit') await funcionarioService.atualizar(formData.id, formData);
      } else if (modalEntity === 'servico') {
        if (modalMode === 'create') await servicoService.criar(formData);
        if (modalMode === 'edit') await servicoService.atualizar(formData.id, formData);
      } else if (modalEntity === 'endereco') {
        if (modalMode === 'create') await enderecoService.criar(formData);
        if (modalMode === 'edit') await enderecoService.atualizar(formData.id, formData);
      }
      closeModal();
      carregarDados();
    } catch (error) {
      alert('Erro ao salvar: ' + error.message);
    }
  };

  const handleDelete = async (entity, id) => {
    if (!window.confirm('Tem certeza que deseja deletar este item?')) return;
    try {
      if (entity === 'equipamento') await equipamentoService.deletar(id);
      if (entity === 'cidade') await cidadeService.deletar(id);
      if (entity === 'funcionario') await funcionarioService.deletar(id);
      if (entity === 'servico') await servicoService.deletar(id);
      if (entity === 'endereco') await enderecoService.deletar(id);
      carregarDados();
    } catch (error) {
      alert('Erro ao deletar: ' + error.message);
    }
  };

  const renderFormContent = () => {
    if (modalMode === 'view') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {Object.entries(formData).map(([key, value]) => (
            <div key={key}>
              <strong>{key}:</strong> {String(value)}
            </div>
          ))}
        </div>
      );
    }

    const inputStyle = { padding: '8px', border: '1px solid #ccc', borderRadius: '4px' };

    if (modalEntity === 'equipamento') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input style={inputStyle} name="name" placeholder="Nome" value={formData.name || ''} onChange={handleInputChange} />
          <input style={inputStyle} name="description" placeholder="Descrição" value={formData.description || ''} onChange={handleInputChange} />
          <select style={inputStyle} name="status" value={formData.status || 'available'} onChange={handleInputChange}>
            <option value="available">Available</option>
            <option value="occupied">Occupied</option>
            <option value="broken">Broken</option>
            <option value="lost">Lost</option>
          </select>
        </div>
      );
    }

    if (modalEntity === 'cidade') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input style={inputStyle} name="name" placeholder="Nome" value={formData.name || ''} onChange={handleInputChange} />
          <input style={inputStyle} name="zip_code" placeholder="CEP" value={formData.zip_code || ''} onChange={handleInputChange} />
          <input style={inputStyle} name="state" placeholder="Estado (ex: MG)" value={formData.state || ''} onChange={handleInputChange} />
        </div>
      );
    }

    if (modalEntity === 'funcionario') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input style={inputStyle} name="name" placeholder="Nome" value={formData.name || ''} onChange={handleInputChange} />
          <input style={inputStyle} name="email" placeholder="Email" value={formData.email || ''} onChange={handleInputChange} />
          <input style={inputStyle} name="phone" placeholder="Telefone" value={formData.phone || ''} onChange={handleInputChange} />
          <select style={inputStyle} name="role" value={formData.role || 'Miner'} onChange={handleInputChange}>
            <option value="Manager">Manager</option>
            <option value="Geologist">Geologist</option>
            <option value="Miner">Miner</option>
            <option value="Engineer">Engineer</option>
            <option value="Surveyor">Surveyor</option>
            <option value="Driller">Driller</option>
            <option value="Mechanic">Mechanic</option>
            <option value="Safety Officer">Safety Officer</option>
          </select>
          <select style={inputStyle} name="status" value={formData.status || 'available'} onChange={handleInputChange}>
            <option value="available">Available</option>
            <option value="occupied">Occupied</option>
            <option value="vacation">Vacation</option>
            <option value="retired">Retired</option>
            <option value="fired">Fired</option>
          </select>
          <select style={inputStyle} name="address_id" value={formData.address_id || ''} onChange={handleInputChange}>
            <option value="">Selecione um Endereço</option>
            {enderecos.map(end => (
              <option key={end.id} value={end.id}>{end.street}, {end.number} - {end.neighborhood}</option>
            ))}
          </select>
        </div>
      );
    }

    if (modalEntity === 'servico') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input style={inputStyle} name="name" placeholder="Nome" value={formData.name || ''} onChange={handleInputChange} />
          <select style={inputStyle} name="type" value={formData.type || 'Other'} onChange={handleInputChange}>
            <option value="Geological Survey">Geological Survey</option>
            <option value="Extraction">Extraction</option>
            <option value="Engineering">Engineering</option>
            <option value="Topography">Topography</option>
            <option value="Drilling">Drilling</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Safety Inspection">Safety Inspection</option>
            <option value="Other">Other</option>
          </select>
          <select style={inputStyle} name="status" value={formData.status || 'pending'} onChange={handleInputChange}>
            <option value="pending">Pending</option>
            <option value="done">Done</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <input style={inputStyle} name="value" type="number" step="0.01" placeholder="Valor" value={formData.value || ''} onChange={handleInputChange} />
          <select style={inputStyle} name="address_id" value={formData.address_id || ''} onChange={handleInputChange}>
            <option value="">Selecione um Endereço</option>
            {enderecos.map(end => (
              <option key={end.id} value={end.id}>{end.street}, {end.number} - {end.neighborhood}</option>
            ))}
          </select>
          <select style={inputStyle} name="client_id" value={formData.client_id || ''} onChange={handleInputChange}>
            <option value="">Selecione um Cliente</option>
            {clientes.map(cli => (
              <option key={cli.id} value={cli.id}>{cli.name}</option>
            ))}
          </select>
        </div>
      );
    }

    if (modalEntity === 'endereco') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input style={inputStyle} name="street" placeholder="Rua" value={formData.street || ''} onChange={handleInputChange} />
          <input style={inputStyle} name="number" placeholder="Número" value={formData.number || ''} onChange={handleInputChange} />
          <input style={inputStyle} name="neighborhood" placeholder="Bairro" value={formData.neighborhood || ''} onChange={handleInputChange} />
          <select style={inputStyle} name="city_id" value={formData.city_id || ''} onChange={handleInputChange}>
            <option value="">Selecione uma Cidade</option>
            {cidades.map(cid => (
              <option key={cid.id} value={cid.id}>{cid.name}</option>
            ))}
          </select>
        </div>
      );
    }
  };

  const getModalTitle = () => {
    const entityNames = { equipamento: 'Equipamento', cidade: 'Cidade', funcionario: 'Funcionário', servico: 'Serviço', endereco: 'Endereço' };
    const entityName = entityNames[modalEntity] || '';
    if (modalMode === 'create') return `Adicionar ${entityName}`;
    if (modalMode === 'edit') return `Editar ${entityName}`;
    if (modalMode === 'view') return `Visualizar ${entityName}`;
    return '';
  };

  const containerStyle = { marginBottom: '30px', padding: '15px', backgroundColor: '#fff', border: '1px solid #ddd' };
  const tableStyle = { width: '100%', borderCollapse: 'collapse', marginTop: '10px' };
  const thStyle = { padding: '10px', backgroundColor: '#f0f0f0', border: '1px solid #ddd', textAlign: 'left' };
  const tdStyle = { padding: '10px', border: '1px solid #ddd' };
  const btnStyle = { marginRight: '5px', padding: '5px 10px', cursor: 'pointer', backgroundColor: '#f8f9fa', color: '#333', border: '1px solid #ccc', borderRadius: '3px' };
  const primaryBtnStyle = { ...btnStyle, backgroundColor: '#007bff', color: 'white', borderColor: '#007bff' };

  return (
    <div>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
        <button style={primaryBtnStyle} onClick={() => openModal('create', 'equipamento')}>Adicionar Equipamento</button>
        <button style={primaryBtnStyle} onClick={() => openModal('create', 'cidade')}>Adicionar Cidade</button>
        <button style={primaryBtnStyle} onClick={() => openModal('create', 'funcionario')}>Adicionar Funcionário</button>
        <button style={primaryBtnStyle} onClick={() => openModal('create', 'servico')}>Adicionar Serviço</button>
        <button style={primaryBtnStyle} onClick={() => openModal('create', 'endereco')}>Adicionar Endereço</button>
      </div>

      <div style={containerStyle}>
        <h2>Equipamentos</h2>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Nome</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {equipamentos.length === 0 ? (
              <tr><td colSpan="4" style={tdStyle}>Nenhum equipamento cadastrado.</td></tr>
            ) : (
              equipamentos.map(eq => (
                <tr key={eq.id}>
                  <td style={tdStyle}>{eq.id}</td>
                  <td style={tdStyle}>{eq.name}</td>
                  <td style={tdStyle}>{eq.status}</td>
                  <td style={tdStyle}>
                    <button style={btnStyle} onClick={() => openModal('view', 'equipamento', eq)}>Visualizar</button>
                    <button style={btnStyle} onClick={() => openModal('edit', 'equipamento', eq)}>Editar</button>
                    <button style={btnStyle} onClick={() => handleDelete('equipamento', eq.id)}>Deletar</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div style={containerStyle}>
        <h2>Cidades</h2>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Nome</th>
              <th style={thStyle}>Estado</th>
              <th style={thStyle}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {cidades.length === 0 ? (
              <tr><td colSpan="4" style={tdStyle}>Nenhuma cidade cadastrada.</td></tr>
            ) : (
              cidades.map(cid => (
                <tr key={cid.id}>
                  <td style={tdStyle}>{cid.id}</td>
                  <td style={tdStyle}>{cid.name}</td>
                  <td style={tdStyle}>{cid.state}</td>
                  <td style={tdStyle}>
                    <button style={btnStyle} onClick={() => openModal('view', 'cidade', cid)}>Visualizar</button>
                    <button style={btnStyle} onClick={() => openModal('edit', 'cidade', cid)}>Editar</button>
                    <button style={btnStyle} onClick={() => handleDelete('cidade', cid.id)}>Deletar</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div style={containerStyle}>
        <h2>Endereços</h2>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Rua</th>
              <th style={thStyle}>Número</th>
              <th style={thStyle}>Bairro</th>
              <th style={thStyle}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {enderecos.length === 0 ? (
              <tr><td colSpan="5" style={tdStyle}>Nenhum endereço cadastrado.</td></tr>
            ) : (
              enderecos.map(end => (
                <tr key={end.id}>
                  <td style={tdStyle}>{end.id}</td>
                  <td style={tdStyle}>{end.street}</td>
                  <td style={tdStyle}>{end.number}</td>
                  <td style={tdStyle}>{end.neighborhood}</td>
                  <td style={tdStyle}>
                    <button style={btnStyle} onClick={() => openModal('view', 'endereco', end)}>Visualizar</button>
                    <button style={btnStyle} onClick={() => openModal('edit', 'endereco', end)}>Editar</button>
                    <button style={btnStyle} onClick={() => handleDelete('endereco', end.id)}>Deletar</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div style={containerStyle}>
        <h2>Funcionários</h2>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Nome</th>
              <th style={thStyle}>Cargo</th>
              <th style={thStyle}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {funcionarios.length === 0 ? (
              <tr><td colSpan="4" style={tdStyle}>Nenhum funcionário cadastrado.</td></tr>
            ) : (
              funcionarios.map(func => (
                <tr key={func.id}>
                  <td style={tdStyle}>{func.id}</td>
                  <td style={tdStyle}>{func.name}</td>
                  <td style={tdStyle}>{func.role}</td>
                  <td style={tdStyle}>
                    <button style={btnStyle} onClick={() => openModal('view', 'funcionario', func)}>Visualizar</button>
                    <button style={btnStyle} onClick={() => openModal('edit', 'funcionario', func)}>Editar</button>
                    <button style={btnStyle} onClick={() => handleDelete('funcionario', func.id)}>Deletar</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div style={containerStyle}>
        <h2>Serviços</h2>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Nome</th>
              <th style={thStyle}>Tipo</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {servicos.length === 0 ? (
              <tr><td colSpan="5" style={tdStyle}>Nenhum serviço cadastrado.</td></tr>
            ) : (
              servicos.map(serv => (
                <tr key={serv.id}>
                  <td style={tdStyle}>{serv.id}</td>
                  <td style={tdStyle}>{serv.name}</td>
                  <td style={tdStyle}>{serv.type}</td>
                  <td style={tdStyle}>{serv.status}</td>
                  <td style={tdStyle}>
                    <button style={btnStyle} onClick={() => openModal('view', 'servico', serv)}>Visualizar</button>
                    <button style={btnStyle} onClick={() => openModal('edit', 'servico', serv)}>Editar</button>
                    <button style={btnStyle} onClick={() => handleDelete('servico', serv.id)}>Deletar</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={getModalTitle()}>
        {renderFormContent()}
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button style={btnStyle} onClick={closeModal}>Fechar</button>
          {modalMode !== 'view' && (
            <button style={primaryBtnStyle} onClick={handleSave}>Salvar</button>
          )}
        </div>
      </Modal>
    </div>
  );
}
