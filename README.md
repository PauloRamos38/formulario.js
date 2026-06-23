# Formulário Simples — README (versão resumida)

Projeto de exemplo para iniciantes: formulário HTML + servidor Node.js mínimo.

Arquivos principais:

- `index.html` — página com o formulário.
- `form.js` — envia/consulta a API `/api/cadastros`.
- `server.js` — servidor que serve a página e recebe os cadastros.

Como rodar (modo rápido):

1. Abra um terminal na pasta do projeto.
2. Execute:

    ```powershell
    node server.js
    ```

3. Abra o endereço mostrado pelo servidor (por exemplo `http://localhost:3000`).

Nota sobre Live Server / Go Live: esta extensão só serve arquivos estáticos. Para que o envio funcione você precisa também rodar `node server.js`.

Dados e segurança:

- Os envios são salvos localmente em `cadastros.json` (não versionado — veja `.gitignore`).
- Este é um exemplo educacional: não use dados sensíveis nem senhas reais.

Comentários no código: o projeto contém comentários didáticos no formato `//citações// ... ////` para facilitar o aprendizado.

Se quiser, eu adiciono `package.json` com `npm start` para rodar com `npm start`.
