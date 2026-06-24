CREATE TYPE ROLES as ENUM (
    'Manager',
    'Geologist',
    'Miner',
    'Engineer',
    'Surveyor',
    'Driller',
    'Mechanic',
    'Safety Officer'
);

CREATE TYPE SERVICE_TYPE as ENUM (
    'Geological Survey',
    'Extraction',
    'Engineering',
    'Topography',
    'Drilling',
    'Maintenance',
    'Safety Inspection',
    'Other'
);

CREATE TYPE WORKER_STATUS as ENUM(
    'available',
    'occupied',
    'vacation',
    'retired',
    'fired'
);

CREATE TYPE TOOL_STATUS as ENUM(
    'available',
    'occupied',
    'broken',
    'lost'
);

CREATE TYPE SERVICE_STATUS as ENUM (
    'pending',
    'done',
    'cancelled'
);

CREATE TABLE IF NOT EXISTS cities (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    zip_code TEXT NOT NULL,
    state TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS address (
    id SERIAL PRIMARY KEY,
    street TEXT NOT NULL,
    number TEXT NOT NULL,
    neighborhood TEXT NOT NULL,
    city_id INT NOT NULL REFERENCES cities(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS workers (
    id SERIAL PRIMARY KEY,
    phone TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role ROLES NOT NULL,
    status WORKER_STATUS NOT NULL DEFAULT 'available',
    address_id INT NOT NULL REFERENCES address(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS clients (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL,
    address_id INT REFERENCES address(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    type SERVICE_TYPE NOT NULL,
    status SERVICE_STATUS NOT NULL DEFAULT 'pending',
    value NUMERIC(10,2) NOT NULL,
    address_id INT NOT NULL REFERENCES address(id),
    client_id INT NOT NULL REFERENCES clients(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tools (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NULL,
    status TOOL_STATUS NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS workers_tools (
    id SERIAL PRIMARY KEY,
    worker_id INT NOT NULL REFERENCES workers(id),
    tool_id INT NOT NULL REFERENCES tools(id),
    borrowed_at TIMESTAMP NOT NULL DEFAULT NOW(),
    returned_at TIMESTAMP,
    condition_out TOOL_STATUS NOT NULL DEFAULT 'available',
    condition_in TOOL_STATUS
);

CREATE TABLE IF NOT EXISTS workers_services (
    worker_id INT NOT NULL REFERENCES workers(id),
    service_id INT NOT NULL REFERENCES services(id),
    assigned_at TIMESTAMP NOT NULL DEFAULT NOW(),
    unassigned_at TIMESTAMP,
    PRIMARY KEY (worker_id, service_id)
);

CREATE TABLE IF NOT EXISTS work_logs (
    id SERIAL PRIMARY KEY,
    worker_id INT NOT NULL REFERENCES workers(id),
    date DATE NOT NULL,
    hours_worked NUMERIC(5,2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
