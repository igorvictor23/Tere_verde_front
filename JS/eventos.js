// Memória global para guardar a lista original do banco de dados
let todosOsEventos = []; 

// =========================================================
// 1. BUSCAR EVENTOS PÚBLICOS NA API
// =========================================================
async function carregarEventosPublicos() {
    try {
        const resposta = await fetch('https://tere-verde-back.onrender.com/eventos/', { method: 'GET' });

        if (resposta.ok) {
            todosOsEventos = await resposta.json(); 
            renderizarCards(todosOsEventos); 
        } else {
            console.error("Erro ao carregar os eventos públicos.");
        }
    } catch (erro) {
        console.error("Erro de conexão com a API:", erro);
        renderizarCards([]); 
    }
}

// =========================================================
// 2. DESENHAR OS CARTÕES NA TELA
// =========================================================
function renderizarCards(eventos) {
    const container = document.querySelector('.grid-cards');
    const estadoVazio = document.querySelector('.estado-vazio');

    container.innerHTML = '';

    if (eventos.length === 0) {
        container.style.display = 'none';
        if (estadoVazio) estadoVazio.style.display = 'block'; 
        return;
    }

    container.style.display = 'grid';
    if (estadoVazio) estadoVazio.style.display = 'none';

    eventos.forEach(evento => {
        const [ano, mes, dia] = evento.data.split('-');
        const dataFormatada = `${dia}/${mes}/${ano}`;
        const descricao = evento.descricao ? evento.descricao : 'Junte-se a nós para mais esta aventura incrível na natureza!';

        let imagemCapa = 'imagens/foto_principal.jpg'; 
        if (evento.parque === 'PARNASO') {
            imagemCapa = 'imagens/parque_nacional.jpg'; 
        } else if (evento.parque === 'Três Picos') {
            imagemCapa = 'imagens/foto_tres_picos.jpg';
        } else if (evento.parque === 'Montanhas de Teresópolis') {
            imagemCapa = 'imagens/Parque_municipal.jpg';
        }

        const card = document.createElement('div');
        card.classList.add('card-evento');

        // INJEÇÃO DA TAG DE CLIMA INVISÍVEL NO TOPO DA IMAGEM
        card.innerHTML = `
            <div class="card-img-wrapper">
                <img src="${imagemCapa}" alt="${evento.parque}" class="card-img">
                
                <div class="clima-tag" style="display: none;">
                    <span class="clima-icone"></span>
                    <span class="clima-temp"></span>
                </div>
            </div>
            <div class="card-conteudo">
                <div class="linha-data-clima">
                    <span class="data-evento"><i class="ph ph-calendar-blank"></i> ${dataFormatada}</span>
                    <button class="btn-clima" title="Ver Previsão do Tempo"><i class="ph ph-cloud-rain"></i> Clima</button>
                </div>
                <span class="tag-parque">${evento.parque}</span>
                <h3>${evento.titulo}</h3>
                <p class="desc-evento">${descricao}</p>
                <button type="button" class="btn-card btn-inscrever">Se Inscrever</button>
            </div>
        `;

        // LIGA O BOTÃO DE CLIMA DESTE CARD ESPECÍFICO À FUNÇÃO DA API
        const btnClima = card.querySelector('.btn-clima');
        const tagClima = card.querySelector('.clima-tag');
        const iconeSpan = card.querySelector('.clima-icone');
        const tempSpan = card.querySelector('.clima-temp');

        btnClima.addEventListener('click', () => {
            // Passa a data bruta do evento e os elementos HTML que precisam ser atualizados
            buscarClimaNaAPI(evento.data, btnClima, tagClima, iconeSpan, tempSpan);
        });

        const btnInscrever = card.querySelector('.btn-inscrever');
        btnInscrever.addEventListener('click', () => {
            document.getElementById('modal-inscricao').classList.remove('oculto');
        });

        

        container.appendChild(card);
    });
}

// =========================================================
// 3. COMUNICAÇÃO COM O SEU BACK-END (O NOVO FETCH)
// =========================================================
async function buscarClimaNaAPI(dataEvento, botao, tagClima, iconeSpan, tempSpan) {
    // 1. Efeito visual: Avisa o usuário que está carregando
    const textoOriginal = botao.innerHTML;
    botao.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Buscando...';
    botao.disabled = true;

    try {
        // 2. Faz o POST enviando o JSON no "body", exatamente como seu Pydantic pediu!
        const resposta = await fetch('https://tere-verde-back.onrender.com/weather', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ data: dataEvento })
        });

        if (resposta.ok) {
            const dadosClima = await resposta.json();

            // 3. Preenche a tag com o Emoji e a Temperatura que vieram do Python
            iconeSpan.textContent = dadosClima.emoji;
            tempSpan.textContent = `${dadosClima.temperatura}°C`;

            // 4. Mágica do Layout: Mostra a tag em cima da foto e esconde o botão
            tagClima.style.display = 'flex';
            botao.style.display = 'none'; 

        } else {
            alert("Não foi possível carregar a previsão do tempo para esta data.");
            botao.innerHTML = textoOriginal;
            botao.disabled = false;
        }
    } catch (erro) {
        console.error("Erro ao buscar clima:", erro);
        alert("O serviço de meteorologia está offline no momento.");
        botao.innerHTML = textoOriginal;
        botao.disabled = false;
    }
}

// Iniciar a página
document.addEventListener('DOMContentLoaded', carregarEventosPublicos);

// =========================================================
// 4. LÓGICA DE FILTRAGEM NO FRONT-END
// =========================================================
function aplicarFiltros() {
    const parqueEscolhido = document.getElementById('filtro-parque').value;
    const dataEscolhida = document.getElementById('filtro-data').value;

    const eventosFiltrados = todosOsEventos.filter(evento => {
        let passouNoParque = true;
        if (parqueEscolhido !== 'Todos') {
            passouNoParque = (evento.parque === parqueEscolhido);
        }

        let passouNaData = true;
        if (dataEscolhida) {
            passouNaData = (evento.data === dataEscolhida);
        }

        return passouNoParque && passouNaData;
    });

    renderizarCards(eventosFiltrados);
}


// =========================================================
// 5. LÓGICA DO MODAL E TOAST DE INSCRIÇÃO
// =========================================================
const modalInscricao = document.getElementById('modal-inscricao');
const btnFecharModal = document.getElementById('btn-fechar-modal');
const btnEnviarInscricao = document.getElementById('btn-enviar-inscricao');
const inputEmail = document.getElementById('input-email');
const toastMensagem = document.getElementById('toast-mensagem');

// Fechar Modal
btnFecharModal.addEventListener('click', () => {
    modalInscricao.classList.add('oculto');
    inputEmail.value = ''; // Limpa o campo
});

// Enviar e mostrar Toast
btnEnviarInscricao.addEventListener('click', () => {
    const email = inputEmail.value.trim();

    if (email !== '' && email.includes('@')) {
        // 1. Esconde o modal
        modalInscricao.classList.add('oculto');
        
        // 2. Escreve a mensagem no toast
        toastMensagem.textContent = `Inscrição enviada para o email: ${email}`;
        
        // 3. Mostra o toast
        toastMensagem.classList.remove('oculto');
        
        // 4. Esconde o toast depois de 3.5 segundos
        setTimeout(() => {
            toastMensagem.classList.add('oculto');
        }, 3500);

        // 5. Limpa o input
        inputEmail.value = '';
    } else {
        alert("Por favor, insira um e-mail válido com @.");
    }
});

document.getElementById('btn-buscar-eventos').addEventListener('click', aplicarFiltros);