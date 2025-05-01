$(document).ready(function () {
    // Verifica se o usuário está logado
    if (localStorage.getItem('loggedIn') !== 'true') {
        window.location.href = 'index.html';
        return;
    }

    // Carrega a lista de clientes no select
    loadClientSelect();

    //mascara no cep
    $('#cep').mask('00000-000');

    // Evento do botão de logout
    $('#btnLogout').on('click', function () {
        localStorage.removeItem('loggedIn');
        window.location.href = 'index.html';
    });

    // Evento de mudança no select de clientes
    $('#clientSelect').on('change', function () {
        loadAddresses($(this).val());
    });

    // Evento do botão novo endereço
    $('#btnNewAddress').on('click', function () {
        const clienteId = $('#clientSelect').val();
        if (!clienteId) {
            alert('Selecione um cliente primeiro');
            return;
        }

        $('#addressId').val('');
        $('#clienteId').val(clienteId);
        $('#addressForm')[0].reset();
        $('#addressModal').modal('show');
    });

    function limpaFormularioCep() {
        // Limpa valores do formulário de cep.
        $('#rua').val(),
        $('#bairro').val(),
        $('#cidade').val(),
        $('#estado').val()
    }

    //Quando o campo cep perde o foco.
    $("#cep").blur(function () {

        //Nova variável "cep" somente com dígitos.
        var cep = $(this).val().replace(/\D/g, '');

        //Verifica se campo cep possui valor informado.
        if (cep != "") {

            //Expressão regular para validar o CEP.
            var validacep = /^[0-9]{8}$/;

            //Valida o formato do CEP.
            if (validacep.test(cep)) {

                //Preenche os campos com "..." enquanto consulta webservice.
                $("#rua").val("...");
                $("#bairro").val("...");
                $("#cidade").val("...");
                $("#estado").val("...");
                //Consulta o webservice viacep.com.br/
                $.getJSON("https://viacep.com.br/ws/" + cep + "/json/?callback=?", function (dados) {

                    if (!("erro" in dados)) {
                        //Atualiza os campos com os valores da consulta.
                        $("#rua").val(dados.logradouro);
                        $("#bairro").val(dados.bairro);
                        $("#cidade").val(dados.localidade);
                        $("#estado").val(dados.uf);
                    }
                    else {
                        //CEP pesquisado não foi encontrado.
                        limpaFormularioCep();
                        alert("CEP não encontrado.");
                    }
                });
            }
            else {
                //cep é inválido.
                limpaFormularioCep();
                alert("Formato de CEP inválido.");
            }
        }
        else {
            //cep sem valor, limpa formulário.
            limpaFormularioCep();
        }
    });
    // Evento do botão salvar endereço
    $('#btnSaveAddress').on('click', function () {
        const address = {
            id: $('#addressId').val(),
            cliente_id: $('#clienteId').val(),
            cep: $('#cep').val(),
            rua: $('#rua').val(),
            bairro: $('#bairro').val(),
            cidade: $('#cidade').val(),
            estado: $('#estado').val(),
            pais: $('#pais').val(),
            principal: $('#principal').is(':checked')
        };

        if (address.principal) {
            address.cliente_id = parseInt(address.cliente_id);
            // Se este endereço for principal, remove a marcação dos outros
            try {
                db.exec('UPDATE addresses SET principal = 0 WHERE cliente_id = ?', [address.cliente_id]);
            } catch (error) {
                console.error('Erro ao atualizar endereços:', error);
            }
        }

        if (createAddress(address)) {
            alert('Endereço salvo com sucesso');
            $('#addressModal').modal('hide');
            loadAddresses(address.cliente_id);
        } else {
            alert('Erro ao salvar endereço');
        }
    });

    // Função para carregar o select de clientes
    function loadClientSelect() {
        const clients = getClients();
        const select = $('#clientSelect');
        select.empty();
        select.append('<option value="">Selecione um cliente</option>');

        clients.forEach(client => {
            select.append(`<option value="${client.id}">${client.nome_completo}</option>`);
        });
    }

    // Função para carregar a lista de endereços
    function loadAddresses(clienteId) {
        if (!clienteId) {
            $('#addressesTable tbody').empty();
            return;
        }

        const addresses = getAddresses(clienteId);
        const tbody = $('#addressesTable tbody');
        tbody.empty();

        addresses.forEach(address => {
            const row = `
                <tr>
                    <td>${address.cep}</td>
                    <td>${address.rua}</td>
                    <td>${address.bairro}</td>
                    <td>${address.cidade}</td>
                    <td>${address.estado}</td>
                    <td>${address.pais}</td>
                    <td>${address.principal ? 'Sim' : 'Não'}</td>
                    <td>
                        <button class="btn btn-sm btn-primary edit-address" data-id="${address.id}">Editar</button>
                        <button class="btn btn-sm btn-danger delete-address" data-id="${address.id}">Excluir</button>
                    </td>
                </tr>
            `;
            tbody.append(row);
        });

        // Eventos dos botões de ação
        $('.edit-address').on('click', function () {
            const id = $(this).data('id');
            const address = addresses.find(a => a.id === id);
            if (address) {
                $('#addressId').val(address.id);
                $('#clienteId').val(address.cliente_id);
                $('#cep').val(address.cep);
                $('#rua').val(address.rua);
                $('#bairro').val(address.bairro);
                $('#cidade').val(address.cidade);
                $('#estado').val(address.estado);
                $('#pais').val(address.pais);
                $('#principal').prop('checked', address.principal);
                $('#addressModal').modal('show');
            }
        });

        $('.delete-address').on('click', function () {
            const id = $(this).data('id');
            if (confirm('Tem certeza que deseja excluir este endereço?')) {
                try {
                    deleteAddress(id)
                    loadAddresses(clienteId);
                } catch (error) {
                    console.error('Erro ao excluir endereço:', error);
                    alert('Erro ao excluir endereço');
                }
            }
        });
    }
}); 