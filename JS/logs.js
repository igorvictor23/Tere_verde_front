// ====================================
// 1. BUSCAR LOGS NA API
// =========================================================
async function carregarLogs() {
    const token = localStorage.getItem('token_tere_verde');
    const containerTerminal = document.querySelector('.terminal-body');

    try {
        const resposta = await fetch('https://tere-verde-back.onrender.com/logs/', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        // A NOVA TRAVA: ERRO 403 (Sabe quem é, mas não deixa ver)
        if (resposta.status === 403) {
            containerTerminal.innerHTML = `<div class="log-linha" style="color: #f44747; font-weight: bold; margin-top: 10px;">
                <span class="log-tipo erro">FATAL [403]:</span> ACESSO NEGADO. PRIVILÉGIOS DE SUPER ADMIN EXIGIDOS PARA LER OS LOGS.
            </div>`;
            return;
        }

        // TUDO CERTO, MOSTRA OS DADOS
        if (resposta.ok) {
            const listaDeLogs = await resposta.json();
            renderizarLogs(listaDeLogs);
            
        // ERRO 401: VENCEU OU DESATIVADO
        } else if (resposta.status === 401) {
            containerTerminal.innerHTML = `<div class="log-linha"><span class="log-tipo erro">ERROR:</span> Sessão expirada ou desativada. Faça login novamente.</div>`;
            localStorage.removeItem('token_tere_verde');
            setTimeout(() => window.location.href = 'login.html', 1500);
        } else {
            containerTerminal.innerHTML = `<div class="log-linha"><span class="log-tipo erro">ERROR:</span> Falha ao carregar os registros do servidor.</div>`;
        }
    } catch (erro) {
        console.error("Erro de conexão com a API de logs:", erro);
        containerTerminal.innerHTML = `<div class="log-linha"><span class="log-tipo erro">FATAL:</span> Servidor offline ou inacessível.</div>`;
    }
}

// =========================================================
// 2. DESENHAR OS LOGS NO TERMINAL
// =========================================================
function renderizarLogs(logs) {
    const container = document.querySelector('.terminal-body');
    container.innerHTML = ''; 

    if (logs.length === 0) {
        container.innerHTML = `<div class="log-linha"><span class="log-tipo aviso">WARN:</span> Nenhum registro de atividade encontrado no banco de dados.</div>`;
        return;
    }

    logs.forEach(log => {
        let dataFormatada = log.data; 
        
        if (log.data.includes('T')) {
            dataFormatada = log.data.replace('T', ' ').split('.')[0];
        }

        let classeCor = 'info'; 
        let prefixo = 'INFO:';
        let acaoTexto = 'Modificou um evento'; 

        const operacao = log.operacao.toLowerCase();

        if (operacao === 'insert' || operacao === 'create') {
            classeCor = 'sucesso'; 
            prefixo = 'SUCCESS:';
            acaoTexto = 'Criou o novo evento';
        } else if (operacao === 'update') {
            classeCor = 'info'; 
            prefixo = 'INFO:';
            acaoTexto = 'Atualizou os dados do evento';
        } else if (operacao === 'delete') {
            classeCor = 'erro'; 
            prefixo = 'WARN:'; 
            acaoTexto = 'Excluiu o evento';
        }

        const idTexto = log.id_evento ? `(#${log.id_evento})` : '';

        const linha = document.createElement('div');
        linha.classList.add('log-linha');
        
        linha.innerHTML = `
            <span class="log-data">[${dataFormatada}]</span> 
            <span class="log-tipo ${classeCor}">${prefixo}</span> 
            Usuário <strong>${log.usuario}</strong> ${acaoTexto} '${log.titulo_evento}' ${idTexto}.
        `;

        container.appendChild(linha);
    });

    container.scrollTop = container.scrollHeight;
}

// =========================================================
// 3. INICIAR E LIGAR O BOTÃO DE ATUALIZAR
// =========================================================
document.addEventListener('DOMContentLoaded', carregarLogs);
document.querySelector('.btn-novo-evento').addEventListener('click', carregarLogs);

