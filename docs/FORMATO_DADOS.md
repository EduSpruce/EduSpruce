# EduFlow — formato dos dados (v0.37)

Os dados vivem no dispositivo: `localStorage['edugest.v2']` (JSON do estado `S`) e, em paralelo, IndexedDB `edugest` (store `estado` com a mesma cópia — prevalece a mais recente — e store `fotos` com fotografias e anexos). A cópia de segurança é um JSON `{app:'EduGest', versao:6, data, parcial, estado:S, fotos:{id:dataURL}}` (pode ser encriptada AES‑256). As chaves internas mantêm o nome antigo “EduGest” por compatibilidade.

Sessão: `sessionStorage['edugest.sessao']` = `{u, nome, papel, tipo:'local'|'ms', desde}`; com “manter sessão” também em `localStorage` com `ate` (30 dias).

## Estado `S`
| Campo | Conteúdo |
|---|---|
| `cfg` | definições (ver abaixo) |
| `anos[]` | anos letivos |
| `anoAtivo`, `turmaAtiva`, `escolaAtiva`, `filtroOferta` | contexto atual (`escolaAtiva`: `'principal'` ou id de `escolas[]`) |
| `escolas[]` | escolas adicionais `{id, escola, agrupamento, codigo, morada, localidade, telefone, emailEscola, site, logo, logoFundo, tipoEscola:'regular'|'profissional'|…, concelho}` (a escola principal são os mesmos campos em `cfg`) |
| `lixo[]`, `registo[]` | caixote do lixo (30 dias) e registo de importações |
| `audit[]` | **v0.34** auditoria `{q:timestamp, u, area, acao, det, v:vista, n?:edições agrupadas}` — mais recente primeiro, máx. 5000 |
| `todo[]` | **v0.34** tarefas `{id, t, prazo:'AAAA-MM-DD', feito, feitaEm, criada}` |
| `biblioteca[]` | **v0.34** recursos `{id, titulo, tipo:'ficha'|'teste'|'apres'|'plan'|'audio'|'imagem'|'folha'|'modelo'|'link'|'outro', disciplina, anoEsc, tema, etiquetas[], colecao:'Pessoal'|'Departamento'|…, acesso:'privado'|'departamento'|'escola', modelo, anoLetivo, arquivado, link?, thumb?, versoes:[{v, doc:'doc:…', nome, mime, tam, q, nota}]}` |
| `docsArq[]` | **v0.34** documentos gerados `{id, numero:'001/2027', modelo, titulo, q, estado:'rascunho'|'revisao'|'aprovado'|'enviado'|'arquivado', aprovadoPor, aprovadoEm, assinatura, ctx:{dt, turma}, ctxTxt, versoes:[{q, u, G:[{al, txt}]}]}` |
| `docSeq` | **v0.34** numeração por ano civil de fim do ano letivo `{ '2027': 3 }` |
| `importados[]` | **v0.35** ficheiros originais importados `{id, doc:'doc:…', nome, tipo, tam, mime, q, ano, esc}` |
| `todo[]` (v0.35) | tarefas também com `prio:'alta'|'normal'|'baixa'`, `turma`, `nota` |
| `avisos[]` | **v0.35** avisos urgentes programados `{id, t, txt, quando:'AAAA-MM-DDTHH:MM', feito}` (`cfg.avVistos` guarda vistos/adiados por chave) |
| `_ts` | data da última gravação |

## `cfg` (definições)
`escola`, `agrupamento`, `codigo`, `morada`, `localidade`, `telefone`, `emailEscola`, `site`, `logo`, `logoFundo`, `tipoEscola`, **`concelho`** (v0.34), `professor` (nome completo — mostrado como “Prof. Primeiro Último”), `email`, `disciplinas[]` (`'Nome|ciclo'`), `extra[]`, `arred`, `estilo` (`'azul'` por omissão), `acento`, densidade/texto/contraste, `apres` (modo de apresentação), `matriz` (`{dias:10}`), `modelos` (domínios e ponderações), `pinHash`, `ultimaCopia`, `versaoVista`, `tourVisto`, `auth` (`{contas:[{u, h:SHA‑256, nome, papel, trocar, ultimo}], ms:{clientId, tenantId, dominio}}`).
Novos na v0.34:
- `inicio` `{ordem:[chaves], ocultos:[chaves]}` — cartões do Início (`contagem, matrizes, tarefas, favoritos, datas, testes, turmas, reunioes, aniversarios, hoje`).
- `favoritos[]` `{k:'vista|turma', v, turma, esc, t}`.
- `listaEscolas` `{regular:[[nome, concelho]], profissional:[[nome, concelho]]}` — substitui as listas base dos Açores quando editadas.
- `feriadosExtra` `{'Concelho|AAAA':'AAAA-MM-DD'}` — feriado municipal indicado à mão (ex.: Povoação).
- `limFaltas` (alerta da Direção de Turma, 10 por omissão).
- `docModelos[]` `{id, nome, cat, titulo, porAluno, email, corpo}` — modelos próprios ou base alterados (mesmo `id` do base).
- `calZoom` **v0.35** zoom dos calendários (0,8–1,6; 1,6 por omissão); `navTurmas` (árvore de turmas aberta/fechada).
- `perfil` **v0.35** `{foto, genero, emailPessoal, telefone, anosServico, notas, porEscola:{escId:{email, numero, atendimento, grupo, departamento, situacao, cargos[]}}}` (o nome continua em `professor`; para a escola principal `email`/`grupo` também ficam em `cfg`).
- `gsync` **v0.35** `{clientId, email, auto, ultimo}`; o estado local da sincronização fica em `localStorage['edugest.gsync']` `{rts, lts, lh}`; na conta Google: `appDataFolder/eduflow-dados.json` (mesmo formato da cópia de segurança, `appProperties.ts`).
- `cnq` **v0.35** cache do Catálogo Nacional de Qualificações `{cursos:[{id:qualificacoesVersoesId, cod, nome, area, nivel, conc, ad}], ts, uf:{id:{ts, L:[{k:'UFCD'|'UC', cod, nome, horas, cred, tipo:'O'|'P'}]}}, v:2}` — lido de `bocatalogo.snq.gov.pt` (renova a cada 30 dias ou no botão Atualizar).
- `sazonal` (bool, por omissão ligado), `neve` (bool), `sazForcar` ('' ou natal/halloween/professor/inverno/primavera/verao/outono), `parabensVisto` (data) **v0.36**; `perfil.nascimento` (AAAA-MM-DD).
- `a11y` **v0.36** `{texto:100|115|130|150, movimento:'auto'|'sim'|'nao', contraste:bool, ligacoes:bool}`.
- `recPastas[]` **v0.36** pastas próprias da biblioteca (recursos têm `pasta`: nome da pasta ou `Turmas/<turma · disciplina>`).
- `assinaturaImg` (dataURL) — assinatura digitalizada usada nos PDF.
- `drive` `{pessoal, dep}` — ligações às pastas do Google Drive (pessoal e de departamento) da biblioteca.

## Ano letivo `anos[i]`
`{id, nome:'2026/2027', org:'periodo'|'semestre', turmas[], dt[] (turmas de que sou diretor, normalizadas), faltasProf[], porEscola:{escId:{…}}, …}`.
Dados por escola (acessores definidos por `prepAno`, guardados em `porEscola[escId]`; calendário e organização herdam da escola principal): `calendario`, `horarios`, `horProf`, `naoLetivos`, `reunioes`, `datasAval`, `intercalar`, `org`.
- `calendario` `{dias:{'AAAA-MM-DD':tipo}, notas:{data:texto}, periodos:[{n, ini, fim, dias}], periodos3?, fimS1?, feriadosLoc:[{data, tipo, nota, antes}]}` — tipos: `letivo, inicio, inicio2, termo, interrupcao, feriadoN, feriadoR, feriadoM` (**v0.34** municipal), `nao`.
- `faltasProf[]` `{id, turma, data, tempos, motivo, obs, subst?}` — **v0.34** `subst` = nome do colega que deu a aula (a aula conta como dada).
- `reposicoes[]` **v0.34** `{id, turma, data, hora, tempos, sala, obs, ref:data da aula reposta}` — somam às aulas dadas do período.
- `sumarios` **v0.34** `{turmaId:{chave_da_aula:{texto, estado:'dada'|'nao', licao}}}` (chave por tempo de 45 min: `AAAA-MM-DD|ini` ou `R|idReposição[|n]`); **v0.36** também `obs`, `ocor` e `pres:{alunoId:{f:''|'F'|'FD', fm:bool, at:bool, oc:{n:'grave'|'media'|'leve'|'positiva', t}}}`.
- `dirTurma` **v0.34** `{turmaNormalizada:{atend:[{id, data, hora, aluno, modo, quem, assunto, resumo, enc}], ocorr:[{id, data, aluno, desc, medida, part}], planos:[{id, aluno, estado, ini, fim, obj, estr, resp, aval}], diligencias:[{id, data, tipo, desc}], arquivo:[{id:'doc:…', nome, tam, q}], intercalar:{chaveAluno:{periodo:{ap, txt}}}, prepCT:{ct1…ct6:bool}, comun:[]}}`.

- `ufcds[]` **v0.35** UFCD que o professor leciona nesse ano `{cod, nome, horas, tipo:'O'|'P', curso}` e `cnqCurso` (curso do Catálogo escolhido) — pré-marcadas ao criar turmas com a Componente Tecnológica.
- `disciplinas[]`, `discExtra[]` **v0.35** — disciplinas que o professor leciona nesse ano letivo (`'Nome|ciclo'`) e outras disciplinas; `cfg.disciplinas`/`cfg.extra` ficam como modelo para anos novos.

## Turma `turmas[j]`
`{id, nome, anoEsc, ciclo, oferta, disciplina, escola?, origens?, dominios[], mencoes[], regra, instrumentos[], alunos[], modulos?, planta?}`
- `curso` (texto, nome do curso) e `cnq` **v0.35** `{id, cod, nome, nivel, area, tipo:'UFCD'|'UC'}` — curso do Catálogo Nacional de Qualificações (PROFIJ/profissional). `modulos[]` podem ter códigos UFCD (`0349`) ou UC (`UC00754`).
- `codigo` **v0.36** código interno da turma.
- `oral` **v0.36** `{per, inst:idInstrumento, cfg:{total, pesos:{amb,cor,flu,des,int}, man:{param:{N4,N3,N2,N1,'0'}}}, regs:{alunoId:{g:guião, n:{param:'N4'|'N3'|'N2'|'N1'|'0'}}}, data}`.
- `planta` **v0.34** `{filas, cols, lug:{'f-c':alunoId}, vazios?, prof:'frente', notas:{alunoId:texto} (v0.35), obs (v0.35)}`.

## Aluno `alunos[k]`
Campos anteriores: `id, num, nome, processo, genero, nasc, foto ('f:hash'), frequenta, origem, cargo, eeNome, eeContacto, email, medidas, acomod, obs, obsPer, sintese, …`
Novos na v0.34 (ficha em 15 separadores):
`numInterno`, `emailEscola`, `morada`, `eeParent`, `contactoAutorizado` (RGPD), `contactos[]` `{id, nome, parent, tel, email}`, `percurso[]` `{id, ano, turma, esc, res}`, `outrasDisc`, `faltasAl[]` `{id, data, tempos, tipo:'injust'|'just'|'atraso'|'material'|'disc', obs}`, `atividades[]` `{id, data, atividade, papel, obs}`, `documentos[]` `{id:'doc:…', nome, tam, tipo, q}`, `intervencoes[]` `{id, data, tipo, desc, resp}`, `portefolio[]` `{id, titulo, data, link, nota, doc?, thumb?}`.

## Anexos
Ficheiros (documentos do aluno, portefólio, arquivo do DT, biblioteca) são dataURL guardados no IndexedDB `fotos` com id `doc:<uid>` e referenciados pelo id. Entram na cópia de segurança completa; não são tratados como fotografias órfãs pela verificação de integridade.

## v0.37
- `cfg.bloq` `{on, desde, cat:{turmas, alunos, criterios, horario, calendario}}` — bloqueio dos dados de base (alterações a essas áreas são desfeitas enquanto estiver ligado; desbloquear pede o código se existir `pinHash`); `cfg.bloqSugVisto`.
- Sincronização na nuvem (OneDrive / Google Drive): estado do dispositivo em `localStorage['edugest.nuvem']` `{prov:'onedrive'|'google', msId, ms:{at, rt, exp}, conta, k:chave AES exportada, salt, base:{parte:hash}, mod:{parte:ts}, ultimo, erro, auto, disp}`; conflitos em `localStorage['edugest.nuvem.conf']` `[{parte, q, de, dados}]` (máx. 12).
- Na nuvem (OneDrive `Aplicações/EduFlow/`, Google `appDataFolder`): `ef-manifest.json` `{v, rev, salt, chk, q, dev, partes:{nome:{h, ts, dev}}, fotos:{id:1}}` e uma parte encriptada por ficheiro `ef-<parte>.bin` (`EF1.<gzip 0|1>.<iv>.<dados>` AES-256-GCM, chave PBKDF2-SHA256 210 000 iterações): `geral` (tudo menos anos/auditoria/contexto; `anosOrdem`), `ano-<id>` (sem turmas; `turmasOrdem`), `turma-<id>` (`_ano`), `audit` (junta os dois lados), fotografias/anexos `ef-f-<id>.bin` (imutáveis).
- Turmas do ensino profissional com `codigo`: o distintivo mostra o código em vez do ano.
- **Turma `porModulo`** (bool, ensino profissional): avaliação separada por módulo. Cada `modulos[i].av` = `{dominios, mencoes, regra, instrumentos, oral?}`; `t.dominios/instrumentos/…` passam a ser os do módulo ativo (o módulo ativo é do dispositivo: `localStorage['edugest.modAtivo']` `{turmaId: moduloId}`). Na gravação a turma guarda os critérios base em `dominios/…` e os de cada módulo em `modulos[].av`. Sem nota escrita em `notasMod`, a classificação do módulo é calculada (0–20) com os critérios e instrumentos do módulo.
- **`t.mra`** `{moduloId:{alunoId: ficha}}` — fichas do Mecanismo de Recuperação (formato da app MRA: `{id, curso, formador, formando, tipo:'Módulo'|'UFCD/Unidade', horas, faltas, exame, data, rows:[{dt, disc, mod, ativ, parecer}], atualizado, guardada}`); `t.mraCfg` `{projeto, orientador, genero}`. A app MRA original vai embutida (`<script id="mragz">`, gzip+base64) e corre numa moldura.
- Correções de carregamento (v0.37): `migrate` já não apaga a oferta `profissional`; a leitura inicial do `localStorage` já não falha (constantes `CTX_ESC`/`CTX_HERDA` definidas antes da leitura).

### v0.38
- `turma.oral.cfgGlob`: cotações globais da avaliação oral.
- `turma.oral.cfgI{momento: cfg}`: cotações próprias de um momento. A chave é o id do instrumento ou `'_proprio'`.
- `turma.oral.cfg`: aponta para as cotações ativas e é recalculado ao carregar.
- `S.cfg.iniTam{chaveCartão: 4|6|8}`: largura dos cartões do Início simples. Os cartões sem entrada ocupam as 12 colunas.
- `turma.oral.propId`: id do instrumento autónomo «Avaliação Oral».
- `turma.oral.regsI['_proprio']`: registos do instrumento autónomo.
- `turma.oral.regsI['apagado:<id>']`: arquivo dos registos de um instrumento apagado.
- Itens com `oralLig` e sem pontuação contam como pendentes, não como 0.

### v0.39
- `turma.escala`: `'20'` ou `'100'` (vazio = automático).
- `turma.conv5`: limites superiores, em %, dos níveis 1 a 4.
- `S.cfg.conv5`: idem, para a escola.
- `S.cfg.arredModo`: `'normal'`, `'cima'` ou `'baixo'`.
- `S.cfg.painel`: `{per, ord, dir, q, fil, cols}`.
- `turma.painelRes[chave]`: `{q, just, ate}`.
- `turma.evid[instId][alunoId]`: número de evidências.
- IndexedDB `eduflow-ev`, store `ev`: `{id, k:'turma|inst|aluno', t, inst, aluno, tipo:'foto'|'audio'|'ficheiro', nome, mime, tam, q, blob}`.
- `S.cfg.notasF`: `[{id, txt, cor, x, y, w, h, vista|null, min}]`.
- `S.cfg.notasOn`.
- `S.cfg.auth.perfis`: `[{id, nome, sist?, perm:{anos, turmas, escola, calendario, horarios, criterios, bloqueio, exportar, nuvem, apagar, contas}}]`.
- `contas[].papel`: id do perfil.
- `S.cfg.estilo`: `eg`, `azul`, `coral`, `social`, `gradiente`, `institucional` ou `academico`.

### v0.47
- `turma.interc[pN][alunoId] = {sem:bool, m:'Insuficiente'|'Suficiente'|'Bom'|'Muito Bom'|'Apenas Descritiva'|'', obs:string, q:timestamp}`
- `instrumento.branco = 'pend' | 'zero'` (por omissão `pend`: em branco conta como pendente e não como zero)

### v0.49–0.50
- `S.esquema` (versão do formato) · `S._mod` (última alteração real) · `S.cfg.migracoes=[{v,n,em}]`
- `sumario.cham` (timestamp: chamada confirmada) · `sumario.dif` · `sumario.prox` · `sumario.partida` · `sumario.plano`
- `instrumento.naoReal` (bool) · `instrumento.nr = {alunoId: 1}` (não realizou)
- `aluno.cid` (identificador comum entre disciplinas da mesma turma) · `aluno.numOrig` (n.º na turma de origem, turmas conjuntas)
- `ano.alunosC[cid] = {h:{campo:hash}, contactosEE:[{id,data,meio,assunto,sintese,compromisso,acomp,tarefa,disc,turma,autor,criado}]}`
- `ano.ctFotos = [{id,classe,turma,data,reuniao,tipo,em,inst,al:{cid:{nome,n:{disciplina:nota0a1},f:{disciplina:faltas},neg,ce,med}}}]`
- `tarefa.orig = {tipo:'contactoEE', cid, cont}`

### v0.51
- `ano.horBloq` (bool) · `ano.demo` (bool, ano de demonstração)
- `instrumento.anexos = {enunciado:{id,nome,tipo,tam,q}, correcao:{…}}` (o conteúdo fica nos documentos locais, `doc:…`)
- `S.cfg.sintAuto = {modo:'pers'|'modelos', ext:'curta'|'media'|'completa', evol, assid, comp, recom}`
### v0.55
- `aluno.emailAluno` (string; campo comum da turma comum — `CAMPOS_COMUNS`)
- `S.cfg.email = {via:'outlook'|'gmail'|'app', assunto, corpo, corpoAl}` (modelos com variáveis `{nome}`, `{turma}`, `{disciplina}`, `{periodo}`, `{professor}`, `{email}`)
- Cada envio bem-sucedido acrescenta um registo a `contactosEE` do aluno (tipo e-mail).
### v0.57
- `turma.modulos[].ufcdAuto` (1 = acrescentado automaticamente a partir de `ano.ufcds`)
### v0.58
- `aluno.movs = [{id, tipo:'saida'|'regresso', data:'AAAA-MM-DD', escola, concelho, codigo, motivo, q}]` — copiado para o mesmo aluno em todas as turmas/disciplinas do ano (`CAMPOS_COMUNS` inclui `movs`).
### v0.59
- `S.cfg.emailEnvio = {via, assunto, corpo, corpoAl}` (antes em `S.cfg.email`, que volta a ser só o e-mail do professor)
- `aluno.contactoAutorizadoEm` (data da autorização RGPD registada no envio)
- `instrumento.nr[aid] = 'j' | 'z' | 1` — não realizou: não imputável (não conta) / imputável (conta 0) / antigo (não conta); `instrumento._nrZ[aid]` (zeros postos automaticamente)
- `ano.aulaDisc = {'<turma>|<escola>|<AAAA-MM-DD|minutos>': idTurma}` · `sumario.modulo` (UFCD da aula)

## 0.60 — Ensino Profissional
- `modulo.av.prof = {v:1, elems:[{id,tipo,peso}]}` — modelo aplicado; domínios `pa_emp|pa_aut|pa_atc|pa_rel` (grupo «Saber Estar») e `pf_<elemId>` (grupo «Saber Fazer»).
- Instrumento `profAtt:true` (18 itens, cot 20) com os indicadores de atitudes; instrumentos `profElem:<elemId>` por elemento.
- `turma.medComp[alunoId][moduloId] = 'exame'|'pendente'`.
- `turma.projeto` (n.º de projeto, opcional), `turma.curso`, `turma.codDisc`.

## 0.61
- `turma.medComp[alunoId][moduloId]` aceita também `'nao'` (anula a sugestão do MRA); vazio = automático.
- Turmas importadas: `codigo` (código do curso), `anoForm`; o projeto passa a `ano.projetos[nomeTurma]`.
- `escola.demo`, `turma.demo` nas entidades da demonstração.

## 0.62
- `instrumento.soFinal` (bool): o formador escolheu só a nota final num Teste Escrito do ensino profissional.
- Itens criados pela estrutura rápida: `{id,rot:'g.k',niv:['Grupo I','1.1'],dom,cot}`.
- Teste de Produção Oral: item com `oralLig:true`; níveis em `oral.regsI[instId][alunoId].n`.

## 0.63
- `S.jornal = {cfg:{nome,dias,diasMat,diasEntrega}, equipa:[{id,nome,funcao,turma,contacto}], anos:{'AAAA/AAAA':{ativ:[…], pecas:[…], edicoes:[…], paa:{ficheiro,em,n}}}}`.
  - atividade: `{id,key,orig:'paa'|'manual',titulo,sec,resp,det,cal,prec,datas:[{ini,fim}],dec:null|'cobrir'|'ignorar',…}`
  - peça: `{id,titulo,tipo,estado:'ideia'|'atribuida'|'escrita'|'revisao'|'pronta'|'publicada',ativ,prazo,autor,foto,edicao,notas}`
  - edição: `{id,num,titulo,fecho,pub,estado:'planeada'|'publicada',check:[índices],notas}`
- `S.cfg.modulos.jornal` (false = desativado). `S.cfg.animPerfil` = 'sem' | 'min' | 'cheio'.

## 0.64
- `S.cfg.estilo` aceita `'ios27'`; `S.cfg.iosVidro` (0–100).
- `S.cfg.modulos.jornal`: `true`/`false` = escolha explícita; ausente = automático pelo cargo.

## 0.66
- `turma.donos`: array de nomes de utilizador com acesso à turma (vazio = só Administrador/Direção).
- `S.cfg.auth.perfis[].perm.verTodas`, `.editarTodas`; perfil `direcao`; `S.cfg.acessoMig` (migração feita).
- `contas[].h`: `a2:$argon2id$…` (ou `p3:`); `S.cfg.pinHash` no mesmo formato.
- Cópias com `soMinhasTurmas:<utilizador>` quando feitas por um professor com acesso restrito.

## 0.67
- `reuniao.origem:'email'` (importada de e-mail); `reuniao.tipo` aceita `'ativ'` (Atividade / Evento).

## 0.69
- Reunião criada a partir de atividade (`tipo:'ativ'`, `origem:'email'`): `notas` = pontos detetados (se houver) + texto completo da mensagem. `convocante` = «Nome (Cargo)» de quem assina. Sem novos campos persistidos (`turmaTxt` é só do diálogo).

## 0.70
- `cfg.logoApp`: `'abeto' | 'livro' | 'monograma' | 'floresta' | 'ramo'` (predefinido `abeto`). Nenhuma chave de armazenamento mudou com o novo nome EduSpruce.

## 0.71
- `localStorage['edugest.nuvem']` ganha: `renovar` (bool), `renTent` (ms), `g` ({t,exp} token Google), `ms.rtq` (hora do início de sessão), `ligarPend`.
- `localStorage['edugest.nuvem.auth']`: estado temporário do início de sessão por redirecionamento ({p,v,state,q,silent,view,tab}); apagado no regresso.
- Ficheiro do site `eduspruce-config.json`: `{ "microsoftClientId": "", "googleClientId": "" }`.
- `cfg.logoApp` predefinido passa a `monograma`.

## 0.72
- Sessão pode ter `tipo:'google'` (`u` = e-mail em minúsculas). `cfg.auth.google` opcional: `{clientId, dominio}`.
- Predefinições de aparência gravadas em `cfg` na primeira utilização (ver Especificação 0.72).

## v0.90
- Sem alterações ao formato dos dados.

## v0.91
- `S.cfg.auth.gContas`: [{email, nome, papel, desde}] — contas Google autorizadas (lista do administrador).
- `S.cfg.notif`: preferências de notificações; `S.cfg.ntDispensa`, `S.cfg.inicioMovel`, `S.cfg.painelMovel`.
- localStorage (por aparelho, não sincronizado): `es.cfgc` (política do site), `es.nt.env` (notificações já mostradas).

- `S.cprofij.anos[anoId].mat[turma]`: {curso, area, nivel, cod, ref, anoCurso, ini, fim, nasInt, fct:{ini, fim, horas, hDia}, disc:[{id, nome, comp: sociocultural|cientifica|tecnologica, horas, det, prof, sig:[siglas], aj, dadas|null}]} (0.909).
- `S.cfg.privMin`: minutos sem atividade até ao modo de privacidade (0 = desligado). localStorage `es.gids`: ids dos ficheiros do Drive da conta atual (por aparelho, sem dados de alunos).

- `S.jornal.quadros` (0.910): quadros do Jornal (ver ESPECIFICACAO v0.910). `FOTOS['mq:<id>']`: imagens dos quadros.
- `eduspruce-config.json` › `reposicoes`: [{h, q}] ordens de reposição; localStorage `esrep` (por aparelho): ordens já cumpridas. Ficheiro na nuvem `ef-reposto-<q>.json`: marca de reposição feita.
- `S.cprofij.anos[ano].mat[turma].disc[].det`: código da UFCD; disciplinas tecnológicas com as mesmas siglas dão-se em sequência.
