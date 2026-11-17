# SpruceNote Web Clipper

Extensão do Chrome para guardar imagens, texto, ligações e vídeos de qualquer site nos quadros do SpruceNote (EduSpruce).

## Instalar

1. Descompacte `sprucenote-web-clipper.zip`.
2. No Chrome, abra `chrome://extensions` e ligue o **Modo de programador** (canto superior direito).
3. Carregue em **Carregar expandida** e escolha a pasta `sprucenote-web-clipper`.
4. Fixe o ícone do SpruceNote na barra (peça de puzzle › alfinete).
5. Nas Opções da extensão, entre com a mesma conta Google da EduSpruce.

## Configuração (uma vez, no Supabase)

Para «Entrar com Google», acrescente este endereço em **Supabase › Authentication › URL Configuration › Redirect URLs**:

    https://cnbghikaofjkhinjidkbdpeeldmaponn.chromiumapp.org/

Sem isto, ainda pode entrar com e-mail e palavra-passe de reserva (definida na EduSpruce, em Definições).

## Como funciona

- **Imagens:** passe o rato por cima e carregue em «Guardar».
- **Texto:** selecione, botão direito › Guardar no SpruceNote (ou ligue nas Opções o botão junto à seleção).
- **Páginas e vídeos do YouTube/Vimeo:** ícone na barra do Chrome ou Alt+Shift+S.
- No painel, «Guardar em ▾» escolhe o quadro: o principal ou um dos 10 abertos mais recentemente.
- Os recortes chegam ao quadro numa coluna **«Por Arrumar»**: a EduSpruce arruma-os sozinha quando está aberta.

Os recortes vão cifrados com a chave da conta, como os restantes dados da EduSpruce; a extensão só guarda no computador a sessão da conta.
