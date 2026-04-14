// =========================================================
// 1. O HTML DO CHAT (Injetado via JavaScript)
// =========================================================
const chatHTML = `
    <button id="btn-abrir-chat" class="btn-chat-flutuante" title="Falar com o Guia">
        <i class="ph ph-chat-circle-dots"></i>
    </button>

    <div id="janela-chat" class="chat-container">
        <div class="chat-cabecalho">
            <div class="chat-titulo">
                <i class="ph ph-leaf"></i>
                <span>Guia Terê Verde</span>
            </div>
            <button id="btn-fechar-chat"><i class="ph ph-x"></i></button>
        </div>
        
        <div class="chat-corpo" id="caixa-mensagens">
            <div class="mensagem bot">
                Olá! Sou o assistente virtual do Terê Verde. 🌿<br>Como posso te ajudar a explorar os parques de Teresópolis hoje?
            </div>
        </div>
        
        <div class="chat-rodape">
            <input type="text" id="input-mensagem-chat" placeholder="Escreva sua pergunta..." autocomplete="off">
            <button id="btn-enviar-chat"><i class="ph ph-paper-plane-right"></i></button>
        </div>
    </div>
`;

// =========================================================
// 2. INICIAR O CHAT (COM FILTRO DE PÁGINAS)
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
    
    // TRAVA DE SEGURANÇA: Não carregar o chat nas páginas de administração
    const urlAtual = window.location.pathname.toLowerCase();
    const paginasRestritas = ['admin', 'login', 'usuarios', 'logs'];
    
    const bloquearChat = paginasRestritas.some(pagina => urlAtual.includes(pagina));
    
    if (bloquearChat) {
        return; // Sai da função e não injeta o chat nestas páginas
    }

    // Injeta o HTML no final do <body>
    document.body.insertAdjacentHTML('beforeend', chatHTML);

    // Seleciona os elementos recém-criados
    const btnAbrirChat = document.getElementById('btn-abrir-chat');
    const btnFecharChat = document.getElementById('btn-fechar-chat');
    const janelaChat = document.getElementById('janela-chat');
    const inputMensagem = document.getElementById('input-mensagem-chat');
    const btnEnviarChat = document.getElementById('btn-enviar-chat');
    const caixaMensagens = document.getElementById('caixa-mensagens');

    // Lógica de Abrir e Fechar
    btnAbrirChat.addEventListener('click', () => {
        janelaChat.classList.add('aberto');
        btnAbrirChat.style.display = 'none'; 
        inputMensagem.focus(); 
    });

    btnFecharChat.addEventListener('click', () => {
        janelaChat.classList.remove('aberto');
        setTimeout(() => { btnAbrirChat.style.display = 'flex'; }, 300); 
    });

    // Função para desenhar a bolha na tela
    // =========================================================
    // FUNÇÃO TURBINADA PARA DESENHAR MENSAGEM (Com suporte a Markdown)
    // =========================================================
    function adicionarMensagem(texto, remetente) {
        const div = document.createElement('div');
        div.classList.add('mensagem', remetente);
        
        // Se a mensagem for do bot, aplicamos a "tradução" do Markdown
        if (remetente === 'bot') {
            let textoFormatado = texto;
            
            // 1. Transforma **texto** em <strong>texto</strong> (Negrito)
            textoFormatado = textoFormatado.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            
            // 2. Transforma *texto* em <em>texto</em> (Itálico)
            textoFormatado = textoFormatado.replace(/\*(.*?)\*/g, '<em>$1</em>');
            
            // 3. Troca as quebras de linha padrão por <br>
            textoFormatado = textoFormatado.replace(/\n/g, '<br>');
            
            div.innerHTML = textoFormatado;
        } else {
            // Se for do usuário, só aplicamos a quebra de linha normal
            div.innerHTML = texto.replace(/\n/g, '<br>'); 
        }

        caixaMensagens.appendChild(div);
        caixaMensagens.scrollTop = caixaMensagens.scrollHeight;
    }

    // Lógica de Enviar a Mensagem
// =========================================================
    // LÓGICA DE ENVIAR MENSAGEM (CONEXÃO REAL COM A API)
    // =========================================================
    async function enviarMensagem() {
        const textoUsuario = inputMensagem.value.trim();
        if (!textoUsuario) return;

        // 1. Mostra a mensagem do usuário na tela e limpa o input
        adicionarMensagem(textoUsuario, 'user');
        inputMensagem.value = '';

        // 2. Mostra o indicador "Digitando..."
        const indicadorDigitando = document.createElement('div');
        indicadorDigitando.classList.add('digitando');
        indicadorDigitando.id = 'status-digitando';
        indicadorDigitando.innerText = 'O Guia está pensando...';
        indicadorDigitando.style.display = 'block';
        caixaMensagens.appendChild(indicadorDigitando);
        caixaMensagens.scrollTop = caixaMensagens.scrollHeight;

        // 3. O FETCH: Conexão com o seu FastAPI
        try {
            const resposta = await fetch('http://localhost:8000/chat/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mensagem: textoUsuario }) // O que o Pydantic espera
            });

            // Assim que a resposta chega, removemos o "Pensando..."
            const digitando = document.getElementById('status-digitando');
            if (digitando) digitando.remove();

            if (resposta.ok) {
                const dados = await resposta.json();
                adicionarMensagem(dados.resposta, 'bot'); // A chave que você configurou no Python!
            } else {
                adicionarMensagem("Ocorreu um erro ao acessar meus servidores de IA. Tente mais tarde. 🔌", 'bot');
            }

        } catch (erro) {
            console.error("Erro no chat:", erro);
            const digitando = document.getElementById('status-digitando');
            if (digitando) digitando.remove();
            
            // Tratamento se o FastAPI estiver desligado
            adicionarMensagem("Parece que estamos sem sinal na trilha! Verifique se o servidor backend está rodando. 📡", 'bot');
        }
    }

    // Gatilhos para o clique do botão ou tecla Enter
    btnEnviarChat.addEventListener('click', enviarMensagem);
    inputMensagem.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') enviarMensagem();
    });

    // =========================================================
    // LÓGICA DE ARRASTAR A JANELA (DRAGGABLE)
    // =========================================================
    const cabecalho = document.querySelector('.chat-cabecalho');
    let isDragging = false;
    let offsetX, offsetY;

    // Quando o usuário aperta o clique do mouse no cabeçalho
    cabecalho.addEventListener('mousedown', (e) => {
        isDragging = true;
        
        // Calcula a diferença entre onde o mouse clicou e a ponta da janela
        const rect = janelaChat.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;

        // Desliga a animação CSS temporariamente para não dar "lag" ao arrastar
        janelaChat.style.transition = 'none';
        
        // Libera a janela do canto da tela para ela poder voar livremente
        janelaChat.style.bottom = 'auto';
        janelaChat.style.right = 'auto';
        janelaChat.style.transform = 'none'; 
    });

    // Quando o usuário move o mouse pela tela toda
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return; // Se não estiver segurando o clique, ignora
        
        // Atualiza a posição da janela acompanhando o mouse
        janelaChat.style.left = `${e.clientX - offsetX}px`;
        janelaChat.style.top = `${e.clientY - offsetY}px`;
    });

    // Quando o usuário solta o clique
    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            // Devolve a transição suave de opacidade caso ele feche o chat depois
            janelaChat.style.transition = 'opacity 0.3s ease-out'; 
        }
    });

});