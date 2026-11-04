# Publicar no GitHub Pages

1. Crie um repositório (público ou privado com GitHub Pro) e envie todos os ficheiros desta pasta.
2. **Settings › Pages › Build and deployment**: *Source* = *Deploy from a branch*, *Branch* = `main`, pasta `/ (root)` › **Save**.
3. Aguarde 1–2 minutos. A app fica em `https://<utilizador>.github.io/<repositório>/`.
4. (Opcional) Domínio próprio: em **Custom domain** indique, por exemplo, `eduflow.escola.pt`, crie o registo CNAME no DNS e ative **Enforce HTTPS**.

O ficheiro `.nojekyll` evita que o GitHub processe os ficheiros com Jekyll.

## Atualizar
Substitua o `index.html` por uma versão nova e faça *commit*. Os dados dos professores não são afetados: estão no navegador de cada um.

## Instalar como app
- **iPad / iPhone (Safari):** Partilhar › Adicionar ao Ecrã Principal.
- **Chrome / Edge:** ícone «Instalar» na barra de endereço.
