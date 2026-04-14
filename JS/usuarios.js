// =========================================================
// 1. BUSCAR USUÁRIOS NA API
// =========================================================
async function carregarUsuarios() {
    const token = localStorage.getItem('token_tere_verde');
    const tbody = document.getElementById('lista-usuarios');

    // 1ª Trava de Segurança
    if (!token) {
        mostrarNotificacao("Sua sessão expirou. Por favor, faça login novamente.", "erro");
        setTimeout(() => window.location.href = 'login.html', 1500);
        return;
    }

    try {
        const resposta = await fetch('http://localhost:8000/admin/', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        // O TOKEN É VÁLIDO, MAS O USUÁRIO NÃO É SUPER ADMIN (403)
        if (resposta.status === 403) {
            mostrarNotificacao("Acesso Negado: Área restrita.", "erro");
            
            // Desenha um cadeado na tabela
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color: var(--vermelho-destaque); padding: 50px;">
                <i class="ph ph-lock-key" style="font-size: 2.5rem; margin-bottom: 10px; display: block;"></i>
                <strong>Acesso Restrito</strong><br>Você não tem privilégios de Super Admin para gerenciar usuários.
            </td></tr>`;
            
            // Desativa o botão de criar novo admin
            const btnNovo = document.getElementById('btn-novo-usuario');
            if (btnNovo) {
                btnNovo.disabled = true;
                btnNovo.style.opacity = '0.5';
                btnNovo.style.cursor = 'not-allowed';
            }
            return;
        }

        // O TOKEN VENCEU OU A CONTA FOI DESATIVADA (401)
        if (resposta.status === 401) {
            mostrarNotificacao("Sua sessão expirou ou foi desativada.", "erro");
            localStorage.removeItem('token_tere_verde');
            setTimeout(() => window.location.href = 'login.html', 1500);
            return;
        }

        if (resposta.ok) {
            const usuarios = await resposta.json();
            renderizarUsuarios(usuarios);
        } else {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:red;">Erro ao carregar administradores.</td></tr>`;
        }
    } catch (erro) {
        console.error("Erro de conexão:", erro);
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:red;">Servidor offline.</td></tr>`;
    }
}

// =========================================================
// 2. DESENHAR A TABELA
// =========================================================
function renderizarUsuarios(usuarios) {
    const tbody = document.getElementById('lista-usuarios');
    tbody.innerHTML = '';

    if (usuarios.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">Nenhum administrador encontrado.</td></tr>`;
        return;
    }

    usuarios.forEach(user => {
        const statusClasse = user.ativo ? 'status-ativo' : 'status-inativo';
        const statusTexto = user.ativo ? 'Ativo' : 'Inativo';
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>#${user.id}</td>
            <td><strong>${user.nome}</strong></td>
            <td>${user.email}</td>
            <td><span class="status-tag ${statusClasse}">${statusTexto}</span></td>
            <td class="col-acoes">
                <button class="btn-desbloquear" onclick="prepararEdicao(${user.id}, '${user.email}')" style="margin-right: 5px;" title="Editar">
                    <i class="ph ph-pencil-simple"></i>
                </button>
                <button class="btn-bloquear" onclick="prepararDelecao(${user.id}, '${user.nome}')" title="Excluir">
                    <i class="ph ph-trash"></i> 
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// =========================================================
// 3. LÓGICA DE EXCLUSÃO COM MODAL (DELETE)
// =========================================================
let idUsuarioParaDeletar = null;

window.prepararDelecao = function(id, nome) {
    idUsuarioParaDeletar = id; 
    
    const textoConfirmacao = document.getElementById('texto-confirmacao-delecao');
    if(textoConfirmacao) textoConfirmacao.innerText = `Tem certeza que deseja excluir o administrador ${nome}?`;
    
    const modal = document.getElementById('modal-deletar-usuario');
    if(modal) modal.style.display = 'flex';
}

const btnConfirmarDelecao = document.getElementById('btn-confirmar-delecao');
if (btnConfirmarDelecao) {
    btnConfirmarDelecao.addEventListener('click', async () => {
        if (!idUsuarioParaDeletar) return;

        const token = localStorage.getItem('token_tere_verde');
        btnConfirmarDelecao.innerHTML = 'Excluindo...';

        try {
            const resposta = await fetch(`http://localhost:8000/admin/${idUsuarioParaDeletar}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (resposta.ok) {
                document.getElementById('modal-deletar-usuario').style.display = 'none'; 
                mostrarNotificacao("Administrador excluído com sucesso!", "sucesso"); 
                carregarUsuarios(); 
            } else if (resposta.status === 401) {
                mostrarNotificacao("Sessão expirada. Faça login novamente.", "erro");
                setTimeout(() => window.location.href = 'login.html', 1500);
            } else if (resposta.status === 403) {
                mostrarNotificacao("Acesso Negado: Somente Super Admins podem excluir.", "erro");
            } else {
                const erroData = await resposta.json();
                mostrarNotificacao(`Falha: ${erroData.detail}`, "erro"); 
            }
        } catch (erro) {
            mostrarNotificacao("Erro de conexão com o servidor.", "erro"); 
        } finally {
            btnConfirmarDelecao.innerHTML = 'Confirmar Exclusão';
            idUsuarioParaDeletar = null;
        }
    });
}

// =========================================================
// 4. LÓGICA DE CRIAÇÃO COM MODAL (POST)
// =========================================================
const btnSalvarNovoAdmin = document.getElementById('btn-salvar-novo-admin');

if (btnSalvarNovoAdmin) {
    btnSalvarNovoAdmin.addEventListener('click', async () => {
        const nome = document.getElementById('input-novo-nome').value;
        const email = document.getElementById('input-novo-email').value;
        const senha = document.getElementById('input-nova-senha').value;

        if (!nome || !email || !senha) {
            mostrarNotificacao("Preencha todos os campos para continuar!", "erro"); 
            return;
        }

        const token = localStorage.getItem('token_tere_verde');
        btnSalvarNovoAdmin.innerHTML = 'Salvando...';
        btnSalvarNovoAdmin.disabled = true;

        try {
            const resposta = await fetch('http://localhost:8000/admin/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ nome, email, senha, ativo: true })
            });

            if (resposta.ok) {
                document.getElementById('input-novo-nome').value = '';
                document.getElementById('input-novo-email').value = '';
                document.getElementById('input-nova-senha').value = '';
                
                document.getElementById('modal-criar-usuario').style.display = 'none';
                
                mostrarNotificacao("Administrador cadastrado com sucesso!", "sucesso"); 
                carregarUsuarios(); 
            } else if (resposta.status === 401) {
                mostrarNotificacao("Sessão expirada. Faça login novamente.", "erro");
                setTimeout(() => window.location.href = 'login.html', 1500);
            } else if (resposta.status === 403) {
                mostrarNotificacao("Acesso Negado: Somente Super Admins podem criar.", "erro");
            } else {
                const erroData = await resposta.json();
                mostrarNotificacao(erroData.detail || 'Erro ao cadastrar.', "erro"); 
            }
        } catch (erro) {
            mostrarNotificacao("Erro de comunicação com o servidor.", "erro"); 
        } finally {
            btnSalvarNovoAdmin.innerHTML = 'Salvar Administrador';
            btnSalvarNovoAdmin.disabled = false;
        }
    });
} 

// =========================================================
// LÓGICA DE EDIÇÃO VISUAL (ABRIR MODAL)
// =========================================================
window.prepararEdicao = function(id, emailAtual) {
    // 1. Preenche os campos do modal com os dados atuais
    document.getElementById('input-editar-id').value = id;
    document.getElementById('input-editar-email').value = emailAtual;
    document.getElementById('input-editar-senha').value = ''; // Senha sempre vem vazia
    
    // 2. Faz o modal pular na tela
    document.getElementById('modal-editar-usuario').style.display = 'flex';
}


// =========================================================
// 5. LÓGICA DE EDIÇÃO COM MODAL (PUT)
// =========================================================
const btnSalvarEdicao = document.getElementById('btn-salvar-edicao');

if (btnSalvarEdicao) {
    btnSalvarEdicao.addEventListener('click', async () => {
        // Pega o ID escondido e os valores digitados
        const id = document.getElementById('input-editar-id').value;
        const email = document.getElementById('input-editar-email').value;
        const senha = document.getElementById('input-editar-senha').value;

        // Proteção extra: se o cara não digitou nada, não tem porque incomodar o servidor
        if (!email && !senha) {
            mostrarNotificacao("Preencha o e-mail ou a senha para alterar.", "erro"); 
            return;
        }

        const token = localStorage.getItem('token_tere_verde');
        btnSalvarEdicao.innerHTML = 'Salvando...';
        btnSalvarEdicao.disabled = true;

        // Monta o pacote de dados (só envia o que foi preenchido)
        const dadosParaAtualizar = {};
        if (email) dadosParaAtualizar.email = email;
        if (senha) dadosParaAtualizar.senha = senha;

        try {
            const resposta = await fetch(`http://localhost:8000/admin/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dadosParaAtualizar)
            });

            // Tratamento das Respostas
            if (resposta.ok) { // 204 No Content cai aqui!
                document.getElementById('input-editar-id').value = '';
                document.getElementById('input-editar-email').value = '';
                document.getElementById('input-editar-senha').value = '';
                
                document.getElementById('modal-editar-usuario').style.display = 'none';
                
                mostrarNotificacao("Dados atualizados com sucesso!", "sucesso"); 
                carregarUsuarios(); 
                
            } else if (resposta.status === 401) {
                mostrarNotificacao("Sessão expirada. Faça login novamente.", "erro");
                setTimeout(() => window.location.href = 'login.html', 1500);
            } else if (resposta.status === 403) {
                mostrarNotificacao("Acesso Negado: Somente Super Admins podem editar.", "erro");
                
            // O SEU ERRO 409 AQUI!
            } else if (resposta.status === 409) {
                mostrarNotificacao("Conflito: Este e-mail já está em uso por outro usuário!", "erro");
                
            } else {
                const erroData = await resposta.json();
                mostrarNotificacao(erroData.detail || 'Erro ao atualizar dados.', "erro"); 
            }
        } catch (erro) {
            mostrarNotificacao("Erro de comunicação com o servidor.", "erro"); 
        } finally {
            btnSalvarEdicao.innerHTML = 'Salvar Alterações';
            btnSalvarEdicao.disabled = false;
        }
    });
}

document.addEventListener('DOMContentLoaded', carregarUsuarios);