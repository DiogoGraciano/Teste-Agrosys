// Inicialização do banco de dados
let db = null;

function saveToLocalStorage() {
    if (db) {
        const data = exportDatabase();
        localStorage.setItem('agrosysDatabase', data);
    }
}

function loadFromLocalStorage() {
    const data = localStorage.getItem('agrosysDatabase');
    if (data) {
        importDatabaseJson(data);
        return true;
    }
    return false;
}

function initDatabase() {
    // Criação das tabelas se não existirem
    const createTables = `
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
    `;

    try {
        db = new alasql.Database();
        db.exec(createTables);

        // Tenta carregar dados do localStorage
        if (!loadFromLocalStorage()) {
            console.log('Nenhum dado encontrado no localStorage, banco de dados vazio iniciado');
        } else {
            console.log('Dados carregados do localStorage com sucesso');
        }

        console.log('Banco de dados inicializado com sucesso');
    } catch (error) {
        console.error('Erro ao inicializar banco de dados:', error);
    }
}

// Funções para usuários
function createUser(username, password) {
    try {
        const result = db.exec(`
            INSERT INTO users (username, password) 
            VALUES (?, ?)
        `, [username, password]);
        saveToLocalStorage(); // Salva após modificação
        return result;
    } catch (error) {
        console.error('Erro ao criar usuário:', error);
        return null;
    }
}

function getUser(username) {
    try {
        const result = db.exec(`
            SELECT * FROM users 
            WHERE username = ?
        `, [username]);
        return result[0];
    } catch (error) {
        console.error('Erro ao buscar usuário:', error);
        return null;
    }
}

// Funções para clientes
function createClient(client) {
    try {
        const result = db.exec(`
            INSERT INTO clients (nome_completo, cpf, data_nascimento, telefone, celular)
            VALUES (?, ?, ?, ?, ?)
        `, [client.nome_completo, client.cpf, client.data_nascimento, client.telefone, client.celular]);
        saveToLocalStorage(); // Salva após modificação
        return result;
    } catch (error) {
        console.error('Erro ao criar cliente:', error);
        return null;
    }
}

function getClients() {
    try {
        return db.exec('SELECT * FROM clients');
    } catch (error) {
        console.error('Erro ao buscar clientes:', error);
        return [];
    }
}

// Funções para endereços
function createAddress(address) {
    try {
        const result = db.exec(`
            INSERT INTO addresses (cliente_id, cep, rua, bairro, cidade, estado, pais, principal)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [address.cliente_id, address.cep, address.rua, address.bairro,
        address.cidade, address.estado, address.pais, address.principal]);
        saveToLocalStorage(); // Salva após modificação
        return result;
    } catch (error) {
        console.error('Erro ao criar endereço:', error);
        return null;
    }
}

function getAddresses(cliente_id) {
    try {
        cliente_id = parseInt(cliente_id);
        return db.exec('SELECT * FROM addresses WHERE cliente_id = ?', [cliente_id]);
    } catch (error) {
        console.error('Erro ao buscar endereços:', error);
        return [];
    }
}

function deleteAddress(id) {
    id = parseInt(id);
    try {
        db.exec('DELETE FROM addresses WHERE id = ?', [id]);
        saveToLocalStorage();
        return true
    } catch (error) {
        console.error('Erro ao criar endereço:', error);
        return null;
    }
}

function deleteClient(id) {
    id = parseInt(id);
    try {
        db.exec('DELETE FROM addresses WHERE cliente_id = ?', [id]);
        db.exec('DELETE FROM clients WHERE id = ?', [id]);
        saveToLocalStorage();
    } catch (error) {
        console.error('Erro ao criar endereço:', error);
        return null;
    }
}

// Funções para exportação/importação
function exportDatabase() {
    try {
        const data = {
            users: db.exec('SELECT * FROM users'),
            clients: db.exec('SELECT * FROM clients'),
            addresses: db.exec('SELECT * FROM addresses')
        };
        return JSON.stringify(data);
    } catch (error) {
        console.error('Erro ao exportar banco de dados:', error);
        return null;
    }
}

function importDatabaseJson(jsonData) {
    try {
        const data = JSON.parse(jsonData);

        // Limpa as tabelas existentes
        db.exec('DELETE FROM addresses');
        db.exec('DELETE FROM clients');
        db.exec('DELETE FROM users');

        // Insere os novos dados
        if (data.users) {
            data.users.forEach(user => {
                db.exec('INSERT INTO users (username, password) VALUES (?, ?)',
                    [user.username, user.password]);
            });
        }

        // Mapa para armazenar a correspondência entre IDs antigos e novos
        const clientIdMap = new Map();

        if (data.clients) {
            data.clients.forEach(client => {
                const result = db.exec(`
                    INSERT INTO clients (nome_completo, cpf, data_nascimento, telefone, celular)
                    VALUES (?, ?, ?, ?, ?)
                `, [client.nome_completo, client.cpf, client.data_nascimento,
                client.telefone, client.celular]);
                clientIdMap.set(client.id, result.insertId);
            });
        }

        if (data.addresses) {
            data.addresses.forEach(address => {
                const newClientId = clientIdMap.get(address.cliente_id);
                if (newClientId) {
                    db.exec(`
                        INSERT INTO addresses (cliente_id, cep, rua, bairro, cidade, estado, pais, principal)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    `, [newClientId, address.cep, address.rua, address.bairro,
                        address.cidade, address.estado, address.pais, address.principal]);
                }
            });
        }
        saveToLocalStorage();
        return true;
    } catch (error) {
        console.error('Erro ao importar banco de dados:', error);
        return false;
    }
}

function importDatabaseSql(sqlData) {
    try {
        db.exec('DELETE FROM addresses');
        db.exec('DELETE FROM clients');
        db.exec('DELETE FROM users');
        db.exec('SET FOREIGN_KEYS=OFF');
        db.exec(sqlData);
        db.exec('SET FOREIGN_KEYS=ON');
        saveToLocalStorage();
        return true
    } catch (error) {
        console.error('Erro ao importar banco de dados:', error);
        return false;
    }
}

if (db === null) {
    initDatabase();
}