//citações// Esta função transforma a data no padrão brasileiro para ficar mais amigável na tela. ////
function formatarData(dataISO) {
  return new Date(`${dataISO}T00:00:00`).toLocaleDateString("pt-BR");
}

//citações// Aqui buscamos os cadastros no servidor e desenhamos a lista no HTML. ////
async function renderizarCadastros() {
  const lista = document.getElementById("lista_cadastros");
  const resposta = await fetch("/api/cadastros");
  const cadastros = await resposta.json();

  lista.innerHTML = "";

  if (cadastros.length === 0) {
    const itemVazio = document.createElement("li");
    itemVazio.textContent = "Nenhum cadastro enviado ainda.";
    lista.appendChild(itemVazio);
    return;
  }

  cadastros.slice().reverse().forEach((cadastro) => {
    const item = document.createElement("li");
    //citações// O template string permite montar o bloco de texto usando os dados do cadastro. ////
    item.innerHTML = `
      <strong>${cadastro.nome}</strong><br>
      E-mail: ${cadastro.email}<br>
      Nascimento: ${formatarData(cadastro.dataNascimento)}
    `;
    lista.appendChild(item);
  });
}

//citações// Esta função intercepta o envio do formulário para mandar os dados via API. ////
async function enviarFormulario(evento) {
  evento.preventDefault();

  const formulario = evento.currentTarget;

  const novoCadastro = {
    nome: formulario.nome_cliente.value.trim(),
    email: formulario.email_cliente.value.trim(),
    dataNascimento: formulario.data_nascimento_cliente.value
  };

  const resposta = await fetch("/api/cadastros", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(novoCadastro)
  });

  const resultado = await resposta.json();

  if (!resposta.ok) {
    //citações// Se o servidor devolver erro, mostramos a mensagem para orientar quem está preenchendo. ////
    alert(resultado.erro || "Não foi possível enviar o formulário.");
    return;
  }

  alert(resultado.mensagem || "Formulário enviado com sucesso.");
  formulario.reset();
  await renderizarCadastros();
}

//citações// Chamamos a renderização inicial para mostrar os cadastros já salvos assim que a página abre. ////
renderizarCadastros();