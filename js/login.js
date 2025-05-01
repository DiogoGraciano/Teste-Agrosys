$(document).ready(function() {
    // Eventos do formulário de login
    $('#loginForm').on('submit', function(e) {
        e.preventDefault();
        const username = $('#username').val();
        const password = $('#password').val();
        
        const user = getUser(username);
        if (user && user.password === password) {
            // Login bem sucedido
            localStorage.setItem('loggedIn', 'true');
            window.location.href = 'clients.html';
        } else {
            alert('Usuário ou senha inválidos');
        }
    });

    // Evento do botão de cadastro
    $('#btnRegister').on('click', function() {
        $('#registerModal').modal('show');
    });

    // Evento do botão de configurações
    $('#btnSettings').on('click', function() {
        $('#settingsModal').modal('show');
    });

    // Evento do botão salvar cadastro
    $('#btnSaveRegister').on('click', function() {
        const username = $('#newUsername').val();
        const password = $('#newPassword').val();
        const confirmPassword = $('#confirmPassword').val();

        if (password !== confirmPassword) {
            alert('As senhas não coincidem');
            return;
        }

        if (getUser(username)) {
            alert('Usuário já existe');
            return;
        }

        if (createUser(username, password)) {
            alert('Usuário cadastrado com sucesso');
            $('#registerModal').modal('hide');
            $('#registerForm')[0].reset();
        } else {
            alert('Erro ao cadastrar usuário');
        }
    });

    // Evento do botão exportar banco de dados
    $('#btnExportDB').on('click', function() {
        const data = exportDatabase();
        if (data) {
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'database_export.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } else {
            alert('Erro ao exportar banco de dados');
        }
    });

    $('#dbFile').on('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const fileName = file.name.toLowerCase();
                if (fileName.endsWith('.sql')) {
                    if (importDatabaseSql(e.target.result)) {
                        alert('Banco de dados SQL importado com sucesso');
                        $('#settingsModal').modal('hide');
                    } else {
                        alert('Erro ao importar banco de dados SQL');
                    }
                } else {
                    if (importDatabaseJson(e.target.result)) {
                        alert('Banco de dados importado com sucesso');
                        $('#settingsModal').modal('hide');
                    } else {
                        alert('Erro ao importar banco de dados');
                    }
                }
            };
            reader.readAsText(file);
        }
    });
}); 