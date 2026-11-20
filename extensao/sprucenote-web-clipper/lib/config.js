// Spruce Notes Web Clipper · configuração
// A base de dados é a mesma da EduSpruce (eduspruce.pt). A chave é a PUBLICÁVEL (pública por natureza,
// como na app): a proteção é feita pelas regras RLS da base de dados e pela cifra dos dados no aparelho.
export const SB_URL = 'https://ssuescpqyhuqkphauwde.supabase.co';
export const SB_KEY = 'sb_publishable_oNNwLRRXJmqDzBqQPlf9jw_N0L29FjV';

// A base de dados só aceita gravações de versões seguras da app (x-es-ver ≥ 0.940).
// A extensão identifica-se com uma versão segura (qualquer valor ≥ 0.940 serve).
export const ES_VER = '1.060';

export const TABELA = 'eduspruce_partes';
export const CHAVE = 'conta-chave';          // chave AES da conta (a mesma que a app usa)
export const PREF_IN = 'ef-f-snin-';         // caixa de entrada: uma linha cifrada por recorte
export const INDICE = 'ef-f-snidx.bin';      // quadros e abertos recentemente (escrita pela app)
export const GERAL = 'ef-geral.bin';         // só se lê se a app ainda não tiver escrito o índice

// onde abrir a EduSpruce («Abrir quadro»)
export const APPS = {pt: 'https://eduspruce.pt/', gh: 'https://eduspruce.github.io/'};
