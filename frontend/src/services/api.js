const API_URL = import.meta.env.BACKEND_URL || 'http://localhost:3000/api';

const request = async (endpoint, options = {}) => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Erro na requisição');
  }
  
  if (response.status === 204) return null;
  return response.json();
};

export const apiService = {
  get: (endpoint) => request(endpoint),
  post: (endpoint, data) => request(endpoint, { method: 'POST', body: JSON.stringify(data) }),
  put: (endpoint, data) => request(endpoint, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (endpoint) => request(endpoint, { method: 'DELETE' }),
};

export const equipamentoService = {
  listar: () => apiService.get('/tools/all'),
  criar: (dados) => apiService.post('/tools/create', dados),
  atualizar: (id, dados) => apiService.put(`/tools/update/${id}`, dados),
  deletar: (id) => apiService.delete(`/tools/delete/${id}`),
  obter: (id) => apiService.get(`/tools/get/${id}`),
  emprestar: (id, workerId, condition_out) => apiService.put(`/tools/${id}/assign/${workerId}`, { condition_out }),
  devolver: (id, condition_in) => apiService.put(`/tools/${id}/unassign`, { condition_in })
};

export const cidadeService = {
  listar: () => apiService.get('/cities/all'),
  criar: (dados) => apiService.post('/cities/create', dados),
  atualizar: (id, dados) => apiService.put(`/cities/update/${id}`, dados),
  deletar: (id) => apiService.delete(`/cities/delete/${id}`),
  obter: (id) => apiService.get(`/cities/get/${id}`)
};

export const funcionarioService = {
  listar: () => apiService.get('/workers/all'),
  criar: (dados) => apiService.post('/workers/create', dados),
  atualizar: (id, dados) => apiService.put(`/workers/update/${id}`, dados),
  deletar: (id) => apiService.delete(`/workers/delete/${id}`),
  obter: (id) => apiService.get(`/workers/get/${id}`),
  registrarHoras: (id, dados) => apiService.post(`/workers/${id}/hours`, dados)
};

export const servicoService = {
  listar: () => apiService.get('/services/all'),
  criar: (dados) => apiService.post('/services/create', dados),
  atualizar: (id, dados) => apiService.put(`/services/update/${id}`, dados),
  deletar: (id) => apiService.delete(`/services/delete/${id}`),
  obter: (id) => apiService.get(`/services/get/${id}`),
  associarFuncionario: (id, workerId) => apiService.post(`/services/${id}/workers/${workerId}`),
  desassociarFuncionario: (id, workerId) => apiService.put(`/services/${id}/workers/${workerId}/unassign`)
};

export const enderecoService = {
  listar: () => apiService.get('/address/all'),
  criar: (dados) => apiService.post('/address/create', dados),
  atualizar: (id, dados) => apiService.put(`/address/update/${id}`, dados),
  deletar: (id) => apiService.delete(`/address/delete/${id}`),
  obter: (id) => apiService.get(`/address/get/${id}`)
};

export const clienteService = {
  listar: () => apiService.get('/clients/all'),
  criar: (dados) => apiService.post('/clients/create', dados),
  atualizar: (id, dados) => apiService.put(`/clients/update/${id}`, dados),
  deletar: (id) => apiService.delete(`/clients/delete/${id}`),
  obter: (id) => apiService.get(`/clients/get/${id}`)
};

export const relatorioService = {
  servicos: (startDate, endDate) => apiService.get(`/reports/services?startDate=${startDate}&endDate=${endDate}`),
  horas: (startDate, endDate) => apiService.get(`/reports/hours?startDate=${startDate}&endDate=${endDate}`),
  ferramentas: (startDate, endDate) => apiService.get(`/reports/tools?startDate=${startDate}&endDate=${endDate}`),
  gerarDadosAleatorios: () => apiService.post('/reports/graft', {})
};
