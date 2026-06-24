TRUNCATE TABLE work_logs, workers_services, workers_tools, tools, services, clients, workers, address, cities RESTART IDENTITY CASCADE;

INSERT INTO cities (name, zip_code, state) VALUES
('Belo Horizonte', '30120-010', 'MG'),
('Nova Lima', '34000-000', 'MG'),
('Mariana', '35420-000', 'MG');

INSERT INTO address (street, number, neighborhood, city_id) VALUES
('Rua das Minas', '100', 'Centro', 1),
('Av. Geologia', '250', 'Vila da Serra', 2),
('Estrada do Ouro', 'S/N', 'Zona Rural', 3),
('Rua do Cobre', '45', 'Distrito Industrial', 2);

INSERT INTO workers (phone, name, email, role, status, address_id) VALUES
('31988880001', 'Carlos Silva', 'carlos.miner@example.com', 'Miner', 'occupied', 1),
('31988880002', 'Ana Souza', 'ana.geo@example.com', 'Geologist', 'available', 2),
('31988880003', 'Beto Rocha', 'beto.drill@example.com', 'Driller', 'occupied', 3),
('31988880004', 'Fernanda Lima', 'fernanda.safety@example.com', 'Safety Officer', 'available', 1),
('31988880005', 'João Mendonça', 'joao.miner@example.com', 'Miner', 'available', 4),
('31988880006', 'Susane Carvalho', 'susane.geo@example.com', 'Geologist', 'available', 2);

INSERT INTO clients (name, email, phone, address_id) VALUES
('Vale Extrações', 'contato@valeext.com', '3133334444', 4),
('Mineração Alfa', 'compras@minalfa.com.br', '3132221111', 1),
('Gama Geologia', 'contato@gamageo.com.br', '3131110000', 2);

INSERT INTO services (name, type, status, value, address_id, client_id) VALUES
('Mapeamento Geológico Mina X', 'Geological Survey', 'done', 15000.00, 2, 1),
('Perfuração de Amostragem Y', 'Drilling', 'pending', 45000.50, 3, 2),
('Inspeção de Segurança Nível 2', 'Safety Inspection', 'pending', 8000.00, 3, 1),
('Sondagem Rotativa Z', 'Drilling', 'pending', 35000.00, 4, 3),
('Manutenção Preventiva Equip.', 'Transport and Logistics', 'pending', 5000.00, 1, 2);

INSERT INTO tools (name, description, status) VALUES
('Perfuratriz Pneumática', 'Equipamento de perfuração pesado', 'occupied'),
('Kit de Geologia', 'Martelo geológico, bússola e lupa', 'available'),
('Capacete com Lanterna', 'EPI padrão de mina', 'occupied'),
('Medidor de Gás', 'Equipamento de monitoramento', 'available'),
('Estação Total', 'Equipamento de topografia avançado', 'available'),
('Marreta 10kg', 'Ferramenta manual para impacto', 'available');

INSERT INTO workers_services (worker_id, service_id, assigned_at, unassigned_at) VALUES
(2, 1, '2023-01-10 08:00:00', '2023-01-20 18:00:00'), 
(3, 2, '2023-10-01 07:00:00', NULL),                
(1, 2, '2023-10-02 07:00:00', NULL),               
(4, 3, '2023-10-05 09:00:00', NULL);

INSERT INTO workers_tools (worker_id, tool_id, borrowed_at, condition_out) VALUES
(3, 1, '2023-10-01 07:30:00', 'available'),
(1, 3, '2023-10-02 07:15:00', 'available');

INSERT INTO work_logs (worker_id, date, hours_worked) VALUES
(1, '2023-10-01', 8.0),
(1, '2023-10-02', 8.5),
(2, '2023-01-10', 6.0),
(2, '2023-01-11', 7.5),
(3, '2023-10-01', 9.0),
(4, '2023-10-05', 4.0);
