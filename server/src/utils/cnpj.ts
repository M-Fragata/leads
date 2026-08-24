/**
 * Utilitários para limpeza, validação e formatação de CNPJ
 */

/**
 * Remove todos os caracteres não numéricos do CNPJ
 */
export function cleanCNPJ(cnpj?: string | null): string {
  if (!cnpj) return '';
  return cnpj.replace(/\D/g, '');
}

/**
 * Formata um CNPJ limpo para o padrão legível XX.XXX.XXX/XXXX-XX
 */
export function formatCNPJ(cnpj?: string | null): string {
  const cleaned = cleanCNPJ(cnpj);
  if (cleaned.length !== 14) {
    return cnpj || '';
  }
  return cleaned.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}

/**
 * Validação básica de dígitos do CNPJ
 */
export function isValidCNPJ(cnpj?: string | null): boolean {
  const cleaned = cleanCNPJ(cnpj);
  if (cleaned.length !== 14) return false;

  // Rejeita sequências de números iguais
  if (/^(\d)\1+$/.test(cleaned)) return false;

  // Validação dos dígitos verificadores
  let tamanho = cleaned.length - 2;
  let numeros = cleaned.substring(0, tamanho);
  const digitos = cleaned.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i), 10) * pos--;
    if (pos < 2) pos = 9;
  }

  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(0), 10)) return false;

  tamanho = tamanho + 1;
  numeros = cleaned.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i), 10) * pos--;
    if (pos < 2) pos = 9;
  }

  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(1), 10)) return false;

  return true;
}
