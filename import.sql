-- Criação das tabelas
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE,
    password VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS clients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome_completo VARCHAR(100),
    cpf VARCHAR(14) UNIQUE,
    data_nascimento DATE,
    telefone VARCHAR(15),
    celular VARCHAR(15)
);

CREATE TABLE IF NOT EXISTS addresses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT,
    cep VARCHAR(9),
    rua VARCHAR(100),
    bairro VARCHAR(50),
    cidade VARCHAR(50),
    estado VARCHAR(2),
    pais VARCHAR(50),
    principal BOOLEAN,
    FOREIGN KEY (cliente_id) REFERENCES clients(id)
);

-- Inserção de dados de exemplo na tabela users
INSERT INTO users (username, password) VALUES
('admin', 'admin123'),
('usuario1', 'senha123'),
('usuario2', 'senha456');

-- Inserção de dados de exemplo na tabela clients
INSERT INTO clients (id, nome_completo, cpf, data_nascimento, telefone, celular) VALUES
(1,'João Silva', '123.456.789-00', '1990-05-15', '(11) 3333-4444', '(11) 99999-8888'),
(2,'Maria Santos', '987.654.321-00', '1985-08-20', '(11) 2222-3333', '(11) 98888-7777'),
(3,'Pedro Oliveira', '456.789.123-00', '1995-03-10', '(11) 4444-5555', '(11) 97777-6666');

-- Inserção de dados de exemplo na tabela addresses
INSERT INTO addresses (cliente_id, cep, rua, bairro, cidade, estado, pais, principal) VALUES
(1, '01234-567', 'Rua das Flores', 'Jardim Primavera', 'São Paulo', 'SP', 'Brasil', true),
(1, '02345-678', 'Avenida Paulista', 'Bela Vista', 'São Paulo', 'SP', 'Brasil', false),
(2, '03456-789', 'Rua das Palmeiras', 'Centro', 'Rio de Janeiro', 'RJ', 'Brasil', true),
(3, '04567-890', 'Avenida Brasil', 'Copacabana', 'Rio de Janeiro', 'RJ', 'Brasil', true); 