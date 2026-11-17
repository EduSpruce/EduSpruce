# Avisos com a app fechada (notificações push) — instalar no Supabase

A partir da versão 1.035, a EduSpruce envia avisos mesmo com a app fechada ou o aparelho bloqueado
(iPhone/iPad com a app no ecrã principal e iOS 16.4+, Android, Mac e Windows).

São só **dois passos no Supabase**, feitos uma única vez. Não há segredos para copiar: as chaves VAPID são criadas pela própria função.

## 1. Correr o SQL

1. Supabase › projeto EduSpruce › **SQL Editor** › New query.
2. Colar todo o ficheiro `modern/supabase/migrations/0016_avisos_push.sql` e carregar em **Run**.
3. No fim deve aparecer `ok: avisos com a app fechada` com `agendamentos = 2`.

Cria as tabelas `eduspruce_push_subs` (aparelhos), `eduspruce_avisos` (avisos por enviar) e `eduspruce_push_vapid` (chaves),
as funções usadas pela app e dois agendamentos do pg_cron: `eduspruce-avisos` (de minuto a minuto, só chama a função quando há avisos à hora)
e `eduspruce-avisos-limpar` (todas as noites, apaga avisos com mais de 1 dia de atraso).

## 2. Criar a função `eduspruce-avisos`

1. Supabase › **Edge Functions** › **Deploy a new function** › **Via Editor**.
2. Nome: `eduspruce-avisos` (exatamente assim).
3. Apagar o código de exemplo, colar todo o ficheiro `modern/supabase/functions/eduspruce-avisos/index.ts` e carregar em **Deploy function**.
4. Depois, na página da função › **Details** (ou Settings): **desligar «Verify JWT with legacy secret»** e guardar.
   (O agendamento chama a função sem sessão; a função não devolve dados de ninguém, só envia os avisos que já estão à hora.)

## 3. Ativar em cada aparelho

Na app: **Definições › Notificações › Com a App Fechada › Ativar Avisos com a App Fechada**, e depois **Testar com a App Fechada**
(fechar a app; o aviso chega em cerca de 1 minuto).

## Como funciona

- A app calcula os avisos dos próximos 21 dias (aulas, resumo do dia, avaliações de amanhã, reuniões com os alarmes de cada uma, avisos),
  com as escolhas e o silêncio de Definições › Notificações, e guarda essa lista na conta (só hora, título curto e secção da app).
  Com **avisos discretos** ligado, nem o título vai («Aula a começar», «Reunião às 15:00»).
- A lista só é guardada se a conta tiver pelo menos um aparelho com os avisos ligados; desligar o último apaga-a.
- A função envia cada aviso para todos os aparelhos da conta e apaga-o logo a seguir; subscrições que já não existem são removidas.
- No aparelho com os avisos ligados, a app deixa de mostrar localmente os mesmos avisos (sem repetições). O «sumário por escrever» continua local.

## Problemas

| Mensagem na app | Solução |
|---|---|
| «Falta correr o 0016_avisos_push.sql no Supabase» | Passo 1 |
| «A função eduspruce-avisos ainda não foi criada» | Passo 2 |
| «desligue Verify JWT» | Passo 2, ponto 4 |
| No iPhone não aparece o botão | Abrir a app pelo ícone do ecrã principal (não no Safari) |

Registos: Supabase › Edge Functions › eduspruce-avisos › Logs; agendamentos: `select * from cron.job_run_details order by start_time desc limit 20;`
