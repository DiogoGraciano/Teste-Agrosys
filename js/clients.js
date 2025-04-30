$(document).ready(function() {
    // Verifica se o usuário está logado
    if (localStorage.getItem('loggedIn') !== 'true') {
        window.location.href = 'index.html';
        return;
    }

    // Carrega a lista de clientes
    loadClients();

    // Evento do botão de logout
    $('#btnLogout').on('click', function() {
        localStorage.removeItem('loggedIn');
        window.location.href = 'index.html';
    });

    // Evento do botão novo cliente
    $('#btnNewClient').on('click', function() {
        $('#clientId').val('');
        $('#clientForm')[0].reset();
        $('#clientModal').modal('show');
    });

    // Evento do botão salvar cliente
    $('#btnSaveClient').on('click', function() {
        const client = {
            id: $('#clientId').val(),
            nome_completo: $('#nomeCompleto').val(),
            cpf: $('#cpf').val(),
            data_nascimento: $('#dataNascimento').val(),
            telefone: $('#telefone').val(),
            celular: $('#celular').val()
        };

        if (createClient(client)) {
            alert('Cliente salvo com sucesso');
            $('#clientModal').modal('hide');
            loadClients();
        } else {
            alert('Erro ao salvar cliente');
        }
    });

    // Função para carregar a lista de clientes
    function loadClients() {
        const clients = getClients();
        const tbody = $('#clientsTable tbody');
        tbody.empty();

        clients.forEach(client => {
            const row = `
                <tr>
                    <td>${client.nome_completo}</td>
                    <td>${client.cpf}</td>
                    <td>${formatDate(client.data_nascimento)}</td>
                    <td>${client.telefone || '-'}</td>
                    <td>${client.celular}</td>
                    <td>
                        <button class="btn btn-sm btn-primary edit-client" data-id="${client.id}">Editar</button>
                        <button class="btn btn-sm btn-danger delete-client" data-id="${client.id}">Excluir</button>
                    </td>
                </tr>
            `;
            tbody.append(row);
        });

        // Eventos dos botões de ação
        $('.edit-client').on('click', function() {
            const id = $(this).data('id');
            const client = clients.find(c => c.id === id);
            if (client) {
                $('#clientId').val(client.id);
                $('#nomeCompleto').val(client.nome_completo);
                $('#cpf').val(client.cpf);
                $('#dataNascimento').val(client.data_nascimento);
                $('#telefone').val(client.telefone);
                $('#celular').val(client.celular);
                $('#clientModal').modal('show');
            }
        });

        $('.delete-client').on('click', function() {
            const id = $(this).data('id');
            if (confirm('Tem certeza que deseja excluir este cliente?')) {
                try {
                    db.exec('DELETE FROM clients WHERE id = ?', [id]);
                    loadClients();
                } catch (error) {
                    console.error('Erro ao excluir cliente:', error);
                    alert('Erro ao excluir cliente');
                }
            }
        });
    }

    // Função para formatar data
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    }
}); 