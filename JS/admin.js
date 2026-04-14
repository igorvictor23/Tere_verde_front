async function carregarEventos() {
    const token = localStorage.getItem('token_tere_verde');
    try {
        const resposta = await fetch('https://tere-verde-back.onrender.com/eventos/admin_events', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (resposta.ok) {
            const listaDeEventos = await resposta.json();
            renderizarTabela(listaDeEventos);
        } else if (resposta.status === 401) {
            mostrarNotificacao("Sua sessão expirou ou foi desativada.", "erro");
            setTimeout(realizarLogout, 1500);
        }
    } catch (erro) {
        console.error("Erro ao conectar com a API:", erro);
    }
}

function renderizarTabela(eventos) {
    const corpoTabela = document.querySelector('.admin-table tbody');
    corpoTabela.innerHTML = '';

    eventos.forEach(evento => {
        const [ano, mes, dia] = evento.data.split('-');
        const dataFormatada = `${dia}/${mes}/${ano}`;

        const linha = document.createElement('tr');
        linha.dataset.id = evento.id;
        linha.dataset.titulo = evento.titulo;
        linha.dataset.data = evento.data; 
        linha.dataset.parque = evento.parque;
        linha.dataset.descricao = evento.descricao || '';

        linha.innerHTML = `
            <td class="id-coluna">#${evento.id}</td>
            <td>${dataFormatada}</td>
            <td>${evento.titulo}</td>
            <td>${evento.parque}</td>
            <td><strong>${evento.nome_admin}</strong></td>
            <td class="desc-tabela">${evento.descricao ? evento.descricao : '-'}</td>
            <td class="acoes">
                <button type="button" class="btn-acao editar" title="Editar"><i class="ph ph-pencil-simple"></i></button>
                <button type="button" class="btn-acao excluir" title="Excluir"><i class="ph ph-trash"></i></button>
            </td>
        `;
        corpoTabela.appendChild(linha);
    });
}
document.addEventListener('DOMContentLoaded', carregarEventos);

// =========================================================
// DELEGAÇÃO DE EVENTOS DA TABELA
// =========================================================
document.querySelector('.admin-table tbody').addEventListener('click', function(event) {
    const btnEditar = event.target.closest('.editar');
    if (btnEditar) {
        event.stopPropagation(); 
        abrirModalEdicao(btnEditar);
    }

    const btnExcluir = event.target.closest('.excluir');
    if (btnExcluir) {
        const linha = btnExcluir.closest('tr');
        abrirModalConfirmacao(linha.dataset.id); 
    }
});

// =========================================================
// LÓGICA DO MODAL (ABRIR, FECHAR E CLIQUE FORA)
// =========================================================
const modalOverlay = document.getElementById('modal-evento');

function abrirModalBase() {
    modalOverlay.style.display = 'flex'; 
}

function fecharModal() {
    modalOverlay.style.display = 'none'; 
    document.getElementById('form-evento').reset(); 
    delete document.getElementById('form-evento').dataset.idEdicao; 
    document.getElementById('modal-titulo').innerText = 'Cadastrar Novo Evento';
}

document.getElementById('btn-fechar-modal').addEventListener('click', fecharModal);
document.getElementById('btn-cancelar').addEventListener('click', fecharModal);

modalOverlay.addEventListener('click', (evento) => {
    if (evento.target === modalOverlay) fecharModal();
});

// =========================================================
// ABRIR MODAL PARA EDIÇÃO E NOVO EVENTO
// =========================================================
function abrirModalEdicao(botao) {
    const linha = botao.closest('tr');
    const dados = linha.dataset;

    document.getElementById('nome_evento').value = dados.titulo;
    document.getElementById('data_evento').value = dados.data;
    document.getElementById('parque_evento').value = dados.parque || '';
    document.getElementById('desc_evento').value = dados.descricao;

    document.getElementById('modal-titulo').innerText = 'Editar Evento';
    document.getElementById('form-evento').dataset.idEdicao = dados.id;
    
    abrirModalBase(); 
}

document.querySelector('.btn-novo-evento').addEventListener('click', () => {
    document.getElementById('form-evento').reset();
    delete document.getElementById('form-evento').dataset.idEdicao;
    document.getElementById('modal-titulo').innerText = 'Cadastrar Novo Evento';
    abrirModalBase(); 
});

// =========================================================
// SALVAR E ATUALIZAR (PUT)
// =========================================================
async function atualizarEvento(idDoEvento, dadosDoFormulario) {
    const token = localStorage.getItem('token_tere_verde');
    try {
        const resposta = await fetch(`http://localhost:8000/eventos/${idDoEvento}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(dadosDoFormulario) 
        });

        if (resposta.ok) {
            mostrarNotificacao("Evento atualizado com sucesso!", "sucesso");
            carregarEventos(); 
        } else if (resposta.status === 401) {
            mostrarNotificacao("Sua sessão expirou ou foi desativada.", "erro");
            setTimeout(realizarLogout, 1500);
        } else {
            const erro = await resposta.json();
            mostrarNotificacao("Erro: " + (erro.detail || "Verifique os dados."), "erro");
        }
    } catch (erro) {
        mostrarNotificacao("Servidor offline. Tente novamente.", "erro");
    }
}

// =========================================================
// DELETAR EVENTO (COM MODAL CUSTOMIZADO)
// =========================================================
const modalConfirmacao = document.getElementById('modal-confirmacao');
let idParaDeletar = null; 

window.abrirModalConfirmacao = function(id) {
    idParaDeletar = id; 
    modalConfirmacao.style.display = 'flex';
}

window.fecharModalConfirmacao = function() {
    modalConfirmacao.style.display = 'none';
    idParaDeletar = null; 
}

document.getElementById('btn-confirmar-exclusao').addEventListener('click', async () => {
    if (!idParaDeletar) return; 

    const token = localStorage.getItem('token_tere_verde');

    try {
        const resposta = await fetch(`http://localhost:8000/eventos/${idParaDeletar}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (resposta.ok) {
            mostrarNotificacao("Evento excluído com sucesso!", "sucesso");
            carregarEventos(); 
            fecharModalConfirmacao(); 
        } else if (resposta.status === 401) {
            mostrarNotificacao("Sua sessão expirou ou foi desativada.", "erro");
            setTimeout(realizarLogout, 1500);
        } else {
            const erro = await resposta.json();
            mostrarNotificacao("Erro ao excluir: " + (erro.detail || "Tente novamente."), "erro");
        }
    } catch (erro) {
        mostrarNotificacao("Servidor offline. Verifique a conexão.", "erro");
    }
});

// =========================================================
// CRIAR NOVO EVENTO (POST) E SUBMIT DO FORM
// =========================================================
async function criarEvento(dadosDoFormulario) {
    const token = localStorage.getItem('token_tere_verde');
    try {
        const resposta = await fetch(`http://localhost:8000/eventos/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(dadosDoFormulario) 
        });

        if (resposta.ok) {
            mostrarNotificacao("Novo evento cadastrado com sucesso!", "sucesso");
            carregarEventos(); 
        } else if (resposta.status === 401) {
            mostrarNotificacao("Sua sessão expirou ou foi desativada.", "erro");
            setTimeout(realizarLogout, 1500);
        } else {
            const erro = await resposta.json();
            mostrarNotificacao("Erro ao cadastrar: " + (erro.detail || "Verifique os dados."), "erro");
        }
    } catch (erro) {
        mostrarNotificacao("Servidor offline. Tente novamente.", "erro");
    }
}

document.getElementById('form-evento').addEventListener('submit', async function(event) {
    event.preventDefault();

    const idParaEdicao = this.dataset.idEdicao;
    const dados = {
        titulo: document.getElementById('nome_evento').value,
        data: document.getElementById('data_evento').value,
        parque: document.getElementById('parque_evento').value,
        descricao: document.getElementById('desc_evento').value
    };

    if (idParaEdicao) {
        await atualizarEvento(idParaEdicao, dados);
        fecharModal(); 
    } else {
        await criarEvento(dados);
        fecharModal(); 
    }
});
