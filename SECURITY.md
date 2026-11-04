# Segurança e privacidade

O EduSpruce trata dados pessoais de alunos, muitos deles menores (RGPD).

## Princípios
- Os dados ficam **no dispositivo do professor** (localStorage e IndexedDB). Não existe servidor do EduSpruce.
- A sincronização usa apenas a **nuvem do próprio professor** (OneDrive ou Google Drive), com cifragem AES-GCM feita no dispositivo (chave derivada da palavra-passe com PBKDF2, 210 000 iterações).
- As palavras-passe das contas locais são guardadas apenas como hash SHA-256.
- A app nunca escreve no programa de gestão da escola.

## Nunca coloque dados reais no repositório
O `.gitignore` exclui JSON, Excel, CSV e PDF. Antes de cada *commit*, confirme que não está a enviar cópias de segurança, pautas ou listas de alunos.

## Comunicar uma vulnerabilidade
Não abra uma *issue* pública. Contacte o autor diretamente, com a descrição do problema e os passos para o reproduzir. A resposta é dada assim que possível.


## Autenticação local (0.66)
- Palavras-passe e código de acesso com Argon2id (m=19 MiB, t=2, p=1, sal aleatório de 16 bytes).
- 5 tentativas falhadas → bloqueio de 15 minutos (persistente no dispositivo).
- Perfis de acesso: Professor (só as suas turmas), Direção (vê todas), Administrador (tudo).
