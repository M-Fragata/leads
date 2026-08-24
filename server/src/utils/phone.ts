/**
 * Utilitários para normalização e validação de números de telefone no padrão brasileiro e E.164 (+55...)
 */

// Lista de DDDs válidos no Brasil
const VALID_DDDS = new Set([
  '11', '12', '13', '14', '15', '16', '17', '18', '19', // SP
  '21', '22', '24', // RJ
  '27', '28', // ES
  '31', '32', '33', '34', '35', '37', '38', // MG
  '41', '42', '43', '44', '45', '46', // PR
  '47', '48', '49', // SC
  '51', '53', '54', '55', // RS
  '61', // DF
  '62', '64', // GO
  '63', // TO
  '65', '66', // MT
  '67', // MS
  '68', // AC
  '69', // RO
  '71', '73', '74', '75', '77', // BA
  '79', // SE
  '81', '87', // PE
  '82', // AL
  '83', // PB
  '84', // RN
  '85', '88', // CE
  '86', '89', // PI
  '91', '93', '94', // PA
  '92', '97', // AM
  '95', // RR
  '96', // AP
  '98', '99', // MA
]);

/**
 * Normaliza um número de telefone bruto para o formato E.164 internacional (+55...)
 * Exemplo de entrada: "(11) 98765-4321", "011 98765 4321", "+55 11 98765-4321", "11987654321"
 * Exemplo de saída: "+5511987654321"
 *
 * @param rawPhone Telefone em formato texto arbitrário
 * @param defaultDdd DDD padrão para preencher caso o número venha sem DDD (ex: "11")
 * @returns Telefone formatado em E.164 ou null se for inválido
 */
export function normalizeBrazilianPhone(rawPhone?: string | null, defaultDdd: string = '11'): string | null {
  if (!rawPhone || typeof rawPhone !== 'string') {
    return null;
  }

  // Remove todos os caracteres não numéricos exceto '+' inicial
  let cleaned = rawPhone.trim();
  const hasPlus = cleaned.startsWith('+');
  
  // Remove tudo que não for dígito
  let digits = cleaned.replace(/\D/g, '');

  if (!digits) {
    return null;
  }

  // Remove zero à esquerda caso venha no formato "011987654321" ou "0XX11..."
  if (digits.startsWith('0')) {
    digits = digits.replace(/^0+/, '');
  }

  // Se já tiver o código do país 55 no início
  if (digits.startsWith('55') && (digits.length === 12 || digits.length === 13)) {
    digits = digits.substring(2);
  }

  // Se o número tem apenas 8 ou 9 dígitos (sem DDD), anexa o DDD padrão
  if (digits.length === 8 || digits.length === 9) {
    digits = `${defaultDdd}${digits}`;
  }

  // Um telefone válido no Brasil tem 10 dígitos (fixo: DDD + 8 dígitos) ou 11 dígitos (celular: DDD + 9 dígitos)
  if (digits.length !== 10 && digits.length !== 11) {
    return null;
  }

  const ddd = digits.substring(0, 2);
  if (!VALID_DDDS.has(ddd)) {
    return null;
  }

  const numberPart = digits.substring(2);

  // Celulares no Brasil iniciam com 9 e têm 9 dígitos
  // Fixos no Brasil iniciam com 2, 3, 4 ou 5 e têm 8 dígitos
  if (digits.length === 11 && !numberPart.startsWith('9')) {
    // Alguns números antigos de 11 dígitos que não começam com 9 podem ser inválidos
    return null;
  }

  return `+55${digits}`;
}

/**
 * Formata um número E.164 para exibição amigável no padrão brasileiro:
 * Ex: "+5511987654321" -> "(11) 98765-4321"
 * Ex: "+551134567890"  -> "(11) 3456-7890"
 */
export function formatPhoneForDisplay(e164Phone?: string | null): string {
  if (!e164Phone) return 'Sem telefone';

  const digits = e164Phone.replace(/\D/g, '');
  let localDigits = digits;

  if (localDigits.startsWith('55') && localDigits.length >= 12) {
    localDigits = localDigits.substring(2);
  }

  if (localDigits.length === 11) {
    return `(${localDigits.substring(0, 2)}) ${localDigits.substring(2, 7)}-${localDigits.substring(7)}`;
  }

  if (localDigits.length === 10) {
    return `(${localDigits.substring(0, 2)}) ${localDigits.substring(2, 6)}-${localDigits.substring(6)}`;
  }

  return e164Phone;
}

/**
 * Retorna o número puro sem o símbolo '+' para links do WhatsApp (wa.me/{phoneDigits})
 * Ex: "+5511987654321" -> "5511987654321"
 */
export function getWhatsAppPhoneDigits(e164Phone: string): string {
  return e164Phone.replace(/\D/g, '');
}
