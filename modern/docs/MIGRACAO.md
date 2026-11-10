# Migração de dados (proposta)

1. **Exportar** a cópia de segurança atual (Definições → Cópia de segurança → .json). Fica no aparelho do professor.
2. **Validar** antes de migrar: `src/esm/migracao.mjs → validar(copia)` devolve contagens (anos, turmas, alunos, instrumentos, classificações) e identificadores repetidos.
3. **Dividir em partes** com a mesma função que a sincronização já usa (`nvPartes`) — os ecrãs leem exatamente os mesmos dados.
4. **Encriptar no aparelho** (AES-256-GCM, a mesma chave que hoje) e gravar com o fornecedor Supabase (`escrever(nome, texto)`).
5. **Verificar**: reler todas as partes, desencriptar e comparar com a cópia (contagens + hash). Só depois se marca como migrado.
6. **Repetível**: gravar é `upsert` por (utilizador, nome); correr de novo não duplica nada.
7. **Reversível**: o Google Drive/OneDrive continuam intactos até o professor decidir; apagar as linhas no Supabase repõe o estado anterior.

Nada disto está ativo: exige `supabase-config.json` com `"ativo": true` e a etapa 5 aprovada.
