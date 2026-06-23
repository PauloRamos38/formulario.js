const http = require('http');
const fs = require('fs');
const path = require('path');

const portas = [3000, 3001, 5500];
const pastaBase = __dirname;
const arquivoCadastros = path.join(pastaBase, 'cadastros.json');

const tiposMime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.ico': 'image/x-icon'
};

//citações// Esta função serve os arquivos estáticos do projeto (HTML, CSS e JS). ////
function responderArquivo(caminhoArquivo, resposta) {
  fs.readFile(caminhoArquivo, (erro, conteudo) => {
    if (erro) {
      resposta.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      resposta.end('Arquivo não encontrado.');
      return;
    }

    const extensao = path.extname(caminhoArquivo).toLowerCase();
    const tipoMime = tiposMime[extensao] || 'application/octet-stream';

    resposta.writeHead(200, { 'Content-Type': tipoMime });
    resposta.end(conteudo);
  });
}

//citações// Lê os cadastros salvos no arquivo; se não existir ainda, retorna uma lista vazia. ////
function lerCadastros() {
  try {
    const conteudo = fs.readFileSync(arquivoCadastros, 'utf8');
    return JSON.parse(conteudo);
  } catch {
    return [];
  }
}

//citações// Salva toda a lista de cadastros em JSON para manter os dados entre reinicializações do servidor. ////
function salvarCadastros(cadastros) {
  fs.writeFileSync(arquivoCadastros, JSON.stringify(cadastros, null, 2), 'utf8');
}

//citações// Validação simples do lado do servidor para evitar receber campos vazios ou formato inválido. ////
function validarCadastro(cadastro) {
  const nome = typeof cadastro.nome === 'string' ? cadastro.nome.trim() : '';
  const email = typeof cadastro.email === 'string' ? cadastro.email.trim() : '';
  const dataNascimento = typeof cadastro.dataNascimento === 'string' ? cadastro.dataNascimento.trim() : '';

  if (nome === '') {
    return 'O campo Nome não pode ficar vazio.';
  }

  if (email === '' || !email.includes('@') || !email.includes('.')) {
    return 'O campo E-mail não é válido.';
  }

  if (dataNascimento === '') {
    return 'O campo Data de Nascimento não pode ficar vazio.';
  }

  return null;
}

//citações// Lê o corpo da requisição POST em partes até completar o JSON enviado pelo formulário. ////
function lerCorpo(requisicao) {
  return new Promise((resolve, reject) => {
    let corpo = '';

    requisicao.on('data', (pedaço) => {
      corpo += pedaço;

      if (corpo.length > 1000000) {
        reject(new Error('Corpo da requisição muito grande.'));
        requisicao.destroy();
      }
    });

    requisicao.on('end', () => resolve(corpo));
    requisicao.on('error', reject);
  });
}

//citações// Aqui definimos as rotas da API e também o fallback para servir os arquivos da interface. ////
const servidor = http.createServer((requisicao, resposta) => {
  const url = new URL(requisicao.url, 'http://localhost');

  if (url.pathname === '/api/cadastros') {
    if (requisicao.method === 'GET') {
      const cadastros = lerCadastros();
      resposta.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      resposta.end(JSON.stringify(cadastros));
      return;
    }

    if (requisicao.method === 'POST') {
      lerCorpo(requisicao)
        .then((corpo) => {
          const dados = corpo ? JSON.parse(corpo) : {};
          const erroValidacao = validarCadastro(dados);

          if (erroValidacao) {
            resposta.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
            resposta.end(JSON.stringify({ erro: erroValidacao }));
            return;
          }

          const novoCadastro = {
            nome: dados.nome.trim(),
            email: dados.email.trim(),
            dataNascimento: dados.dataNascimento.trim(),
            criadoEm: new Date().toISOString()
          };

          const cadastros = lerCadastros();
          cadastros.push(novoCadastro);
          salvarCadastros(cadastros);

          resposta.writeHead(201, { 'Content-Type': 'application/json; charset=utf-8' });
          resposta.end(JSON.stringify({ mensagem: 'Cadastro recebido com sucesso.', cadastro: novoCadastro }));
        })
        .catch(() => {
          resposta.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
          resposta.end(JSON.stringify({ erro: 'Não foi possível ler os dados enviados.' }));
        });

      return;
    }

    resposta.writeHead(405, { 'Content-Type': 'application/json; charset=utf-8' });
    resposta.end(JSON.stringify({ erro: 'Método não permitido.' }));
    return;
  }

  let caminhoRequisitado = url.pathname === '/' ? '/index.html' : url.pathname;
  caminhoRequisitado = decodeURIComponent(caminhoRequisitado);
  caminhoRequisitado = caminhoRequisitado.replace(/^\//, '');

  const caminhoArquivo = path.resolve(pastaBase, caminhoRequisitado);

  if (!caminhoArquivo.startsWith(pastaBase)) {
    resposta.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    resposta.end('Acesso negado.');
    return;
  }

  responderArquivo(caminhoArquivo, resposta);
});

//citações// O servidor tenta portas diferentes para continuar funcionando mesmo se a 3000 estiver ocupada. ////
function iniciarServidor(indicePorta = 0) {
  const porta = portas[indicePorta];

  servidor.listen(porta, () => {
    console.log(`Servidor rodando em http://localhost:${porta}`);
  });

  servidor.once('error', (erro) => {
    if (erro.code === 'EADDRINUSE' && indicePorta + 1 < portas.length) {
      console.log(`Porta ${porta} em uso, tentando ${portas[indicePorta + 1]}...`);
      iniciarServidor(indicePorta + 1);
      return;
    }

    throw erro;
  });
}

//citações// Ponto de entrada do servidor: começa a escutar requisições HTTP. ////
iniciarServidor();