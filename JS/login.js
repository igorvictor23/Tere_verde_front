// 1. Verifica se já existe um passe livre guardado
const token = localStorage.getItem('token_tere_verde');

// 2. Se o token existir, joga o admin direto pro painel
if (token) {
    window.location.href = 'admin.html'; 
}

// 3. Lógica do Formulário
const formLogin = document.getElementById('form-login');
const inputEmail = document.getElementById('email');
const inputSenha = document.getElementById('password');

formLogin.addEventListener('submit', async function(event) {
    event.preventDefault();

    // Trava o botão para evitar cliques duplos e dá feedback visual
    const btn = document.querySelector('.btn-login');
    const textoOriginal = btn.innerHTML;
    btn.innerHTML = 'Entrando...';
    btn.disabled = true;

    const emailDigitado = inputEmail.value;
    const senhaDigitada = inputSenha.value;

    try {
        const resposta = await fetch('http://localhost:8000/admin/login', {
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify({
                email: emailDigitado,
                senha: senhaDigitada
            })
        });

        if (resposta.ok) {
            const dados = await resposta.json();
            localStorage.setItem('token_tere_verde', dados.token.access_token);
            localStorage.setItem('nome_admin', dados.usuario);
            
            // Opcional: Mostra um Toast de sucesso rapidinho e já pula de tela!
            mostrarNotificacao("Login efetuado com sucesso!", "sucesso");
            setTimeout(() => {
                window.location.href = 'admin.html'; 
            }, 600); // Dá um tempinho de meio segundo pra ler a mensagem verde
            
        } else {
            const erro = await resposta.json();
            // ADEUS ALERT! OLÁ TOAST!
            mostrarNotificacao("Falha no login: " + erro.detail, "erro"); 
            
            // Destrava o botão para o usuário tentar de novo
            btn.innerHTML = textoOriginal;
            btn.disabled = false;
        }

    } catch (erroDeConexao) {
        console.error("Erro de rede:", erroDeConexao);
        // Toast para erro de servidor offline
        mostrarNotificacao("Servidor offline. Verifique se o backend está rodando.", "erro");
        
        btn.innerHTML = textoOriginal;
        btn.disabled = false;
    }
});