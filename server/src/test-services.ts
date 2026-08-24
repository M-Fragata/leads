import { normalizeBrazilianPhone, formatPhoneForDisplay } from './utils/phone.js';
import { cleanCNPJ, formatCNPJ, isValidCNPJ } from './utils/cnpj.js';
import { enrichLeadWithCNPJ } from './services/cnpj-enrichment.js';

async function runTests() {
  console.log('--- Testes de Telefonia (E.164) ---');
  const testPhones = [
    '(11) 98765-4321',
    '+55 11 98765-4321',
    '11987654321',
    '011 98765 4321',
    '1134567890',
    '98765-4321', // sem DDD (deve aplicar 11 por default)
    '123' // inválido
  ];

  for (const p of testPhones) {
    const norm = normalizeBrazilianPhone(p);
    const display = formatPhoneForDisplay(norm);
    console.log(`Original: "${p}" -> Normalizado E.164: "${norm}" -> Exibição: "${display}"`);
  }

  console.log('\n--- Testes de CNPJ & BrasilAPI ---');
  // CNPJ da Petrobras ou Ambev ou Natura para teste
  const testCnpj = '33000167000101'; // Petrobras
  console.log(`Testando CNPJ: ${formatCNPJ(testCnpj)} (Válido: ${isValidCNPJ(testCnpj)})`);

  try {
    const enriched = await enrichLeadWithCNPJ(testCnpj);
    console.log('✅ BrasilAPI Retornou com Sucesso:');
    console.log(`- Razão Social: ${enriched.companyName}`);
    console.log(`- Decisor Principal (QSA): ${enriched.decisionMaker}`);
    console.log(`- Situação: ${enriched.statusCadastral}`);
    console.log(`- CNAE: ${enriched.cnae}`);
    console.log(`- Total Sócios no QSA: ${enriched.qsaList.length}`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro';
    console.error('❌ Erro na consulta BrasilAPI:', msg);
  }
}

runTests();
