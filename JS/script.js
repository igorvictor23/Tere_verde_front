// ==========================================
// Lógica do Carrossel de Imagens (Sobre a Cidade)
// ==========================================
let slideIndex = 0;
const slides = document.querySelectorAll('.slide');

function mudarSlide(n) {
    slides[slideIndex].classList.remove('ativo');
    slideIndex += n;
    
    if (slideIndex >= slides.length) {
        slideIndex = 0;
    }
    if (slideIndex < 0) {
        slideIndex = slides.length - 1;
    }
    
    slides[slideIndex].classList.add('ativo');
}

// ==========================================
// Lógica do Carrossel de Dicas (Trilheiro)
// ==========================================
let dicaIndex = 0;
const slidesDicas = document.querySelectorAll('.dica-slide');

function mudarDica(n) {
    slidesDicas[dicaIndex].classList.remove('ativo');
    dicaIndex += n;
    
    if (dicaIndex >= slidesDicas.length) {
        dicaIndex = 0;
    }
    if (dicaIndex < 0) {
        dicaIndex = slidesDicas.length - 1;
    }
    
    slidesDicas[dicaIndex].classList.add('ativo');
}

window.addEventListener('scroll', () => {
    const reveals = document.querySelectorAll('.parque-detalhe, .sobre-cidade, .dicas-trilha');
    
    reveals.forEach(reveal => {
        const windowHeight = window.innerHeight;
        const revealTop = reveal.getBoundingClientRect().top;
        const revealPoint = 150;

        if (revealTop < windowHeight - revealPoint) {
            reveal.classList.add('active');
        }
    });
});

// =========================================================
// SISTEMA GLOBAL DE NOTIFICAÇÕES (TOASTS)
// =========================================================
function mostrarNotificacao(mensagem, tipo) {
    const container = document.getElementById('toast-container');
    if (!container) return; 

    const toast = document.createElement('div');
    toast.classList.add('toast', tipo);
    toast.innerText = mensagem;
    container.appendChild(toast);

    setTimeout(() => { toast.classList.add('mostrar'); }, 10);

    setTimeout(() => {
        toast.classList.remove('mostrar'); 
        setTimeout(() => { toast.remove(); }, 400);
    }, 3000);
}

// =========================================================
// LÓGICA GLOBAL DE LOGOUT
// =========================================================
window.realizarLogout = function(event) {
    // Se o evento existir (clique), impede que ele abra o link direto
    if (event) event.preventDefault(); 
    
    // Faz a faxina na memória
    localStorage.removeItem('token_tere_verde');
    localStorage.removeItem('nome_admin');
    
    // Manda pra Landing Page (Início) como você pediu!
    window.location.href = 'index.html';
};

// Conecta a função em TODOS os botões de sair do sistema
document.addEventListener('DOMContentLoaded', () => {
    const botoesSair = document.querySelectorAll('.btn-sair');
    botoesSair.forEach(botao => {
        botao.addEventListener('click', window.realizarLogout);
    });
});
