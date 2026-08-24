import axios from 'axios';
import { prisma } from '../config/prisma.js';
import { cleanCNPJ, formatCNPJ, isValidCNPJ } from '../utils/cnpj.js';
import { normalizeBrazilianPhone } from '../utils/phone.js';

export interface BrasilApiQSA {
  pais?: string | null;
  nome_socio: string;
  codigo_pais?: string | null;
  faixa_etaria?: string | null;
  cnpj_cpf_do_socio?: string | null;
  qualificacao_socio: string;
  codigo_faixa_etaria?: number;
  data_entrada_sociedade?: string;
  identificador_de_socio?: number;
  cpf_representante_legal?: string | null;
  nome_representante_legal?: string | null;
  codigo_qualificacao_socio?: number;
  qualificacao_representante_legal?: string | null;
  codigo_qualificacao_representante_legal?: number;
}

export interface BrasilApiCNPJResponse {
  cnpj: string;
  identificador_matriz_filial: number;
  descricao_matriz_filial: string;
  razao_social: string;
  nome_fantasia: string;
  situacao_cadastral: number;
  descricao_situacao_cadastral: string;
  data_situacao_cadastral: string;
  motivo_situacao_cadastral: number;
  nome_cidade_no_exterior?: string;
  codigo_natureza_juridica: number;
  data_inicio_atividade: string;
  cnae_fiscal: number;
  cnae_fiscal_descricao: string;
  descricao_tipo_de_logradouro: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cep: number | string;
  uf: string;
  codigo_municipio: number;
  municipio: string;
  ddd_telefone_1?: string;
  ddd_telefone_2?: string;
  ddd_fax?: string;
  email?: string | null;
  qualificacao_do_responsavel?: number;
  capital_social: number;
  porte: string;
  descricao_porte: string;
  opcao_pelo_simples?: boolean | null;
  data_opcao_pelo_simples?: string | null;
  data_exclusao_do_simples?: string | null;
  opcao_pelo_mei?: boolean | null;
  situacao_especial?: string | null;
  data_situacao_especial?: string | null;
  qsa: BrasilApiQSA[];
}

export interface EnrichedData {
  companyName: string;
  decisionMaker: string | null;
  cnpj: string;
  formattedCnpj: string;
  statusCadastral: string;
  cnae: string;
  capitalSocial: number;
  address: string;
  city: string;
  state: string;
  phone?: string | null;
  secondaryPhone?: string | null;
  email?: string | null;
  qsaList: BrasilApiQSA[];
}

/**
 * Consulta a BrasilAPI para obter dados cadastrais e o QSA da empresa
 * Endpoint: https://brasilapi.com.br/api/cnpj/v1/{cnpj}
 */
export async function fetchBrasilApiCNPJ(cnpj: string): Promise<BrasilApiCNPJResponse> {
  const clean = cleanCNPJ(cnpj);

  if (clean.length !== 14) {
    throw new Error(`CNPJ inválido: ${cnpj}. Um CNPJ deve conter exatamente 14 dígitos numéricos.`);
  }

  try {
    const response = await axios.get<BrasilApiCNPJResponse>(
      `https://brasilapi.com.br/api/cnpj/v1/${clean}`,
      {
        timeout: 10000,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Viggo-CRM/1.0'
        }
      }
    );

    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        throw new Error(`CNPJ ${formatCNPJ(clean)} não encontrado na base da Receita Federal.`);
      }
      if (error.response?.status === 429) {
        throw new Error('Limite de requisições excedido na BrasilAPI. Tente novamente em instantes.');
      }
      if (error.code === 'ECONNABORTED') {
        throw new Error('Tempo limite excedido na consulta da BrasilAPI.');
      }
    }
    const message = error instanceof Error ? error.message : 'Falha desconhecida';
    throw new Error(`Erro ao consultar BrasilAPI: ${message}`);
  }
}

/**
 * Extrai o sócio principal / decisor prioritário a partir do QSA
 * Prioriza: Sócio-Administrador > Administrador > Diretor > Presidente > Sócio
 */
export function extractDecisionMaker(qsa?: BrasilApiQSA[]): string | null {
  if (!qsa || qsa.length === 0) {
    return null;
  }

  // Ordenação por relevância do cargo societário
  const priorityTerms = [
    'administrador',
    'sócio-administrador',
    'socio-administrador',
    'diretor',
    'presidente',
    'titular',
    'sócio',
    'socio'
  ];

  for (const term of priorityTerms) {
    const match = qsa.find(s => 
      s.qualificacao_socio && 
      s.qualificacao_socio.toLowerCase().includes(term) &&
      s.nome_socio
    );
    if (match) {
      return formatPersonName(match.nome_socio);
    }
  }

  // Se nenhum corresponder aos prioritários, retorna o primeiro sócio com nome
  const firstSocio = qsa.find(s => !!s.nome_socio);
  return firstSocio ? formatPersonName(firstSocio.nome_socio) : null;
}

/**
 * Formata nomes próprios para Capital Case (ex: "JOAO CARLOS SILVA" -> "João Carlos Silva")
 */
export function formatPersonName(name: string): string {
  if (!name) return '';
  const prepositions = new Set(['de', 'da', 'do', 'das', 'dos', 'e']);
  
  return name
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map((word, index) => {
      if (index > 0 && prepositions.has(word)) {
        return word;
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

/**
 * Enriquece um lead com dados de CNPJ consultando a BrasilAPI
 * Atualiza os campos `companyName`, `decisionMaker`, `cnpj` e outros no banco de dados
 */
export async function enrichLeadWithCNPJ(cnpj: string): Promise<EnrichedData> {
  const data = await fetchBrasilApiCNPJ(cnpj);
  const decisionMaker = extractDecisionMaker(data.qsa);

  const clean = cleanCNPJ(cnpj);
  const addressParts = [
    data.descricao_tipo_de_logradouro ? `${data.descricao_tipo_de_logradouro} ${data.logradouro}` : data.logradouro,
    data.numero ? `Nº ${data.numero}` : '',
    data.complemento,
    data.bairro,
    data.municipio ? `${data.municipio} - ${data.uf}` : '',
    data.cep ? `CEP: ${data.cep}` : ''
  ].filter(Boolean);

  const fullAddress = addressParts.join(', ');

  const phoneCandidate = data.ddd_telefone_1 ? normalizeBrazilianPhone(data.ddd_telefone_1) : null;
  const secondaryPhoneCandidate = data.ddd_telefone_2 ? normalizeBrazilianPhone(data.ddd_telefone_2) : null;
  const emailCandidate = data.email ? data.email.toLowerCase() : null;

  return {
    companyName: data.razao_social,
    decisionMaker,
    cnpj: clean,
    formattedCnpj: formatCNPJ(clean),
    statusCadastral: data.descricao_situacao_cadastral,
    cnae: data.cnae_fiscal_descricao,
    capitalSocial: data.capital_social,
    address: fullAddress,
    city: data.municipio,
    state: data.uf,
    phone: phoneCandidate,
    secondaryPhone: secondaryPhoneCandidate,
    email: emailCandidate,
    qsaList: data.qsa || []
  };
}

/**
 * Encontra um lead no banco pelo ID e o enriquece utilizando o CNPJ fornecido ou já cadastrado
 */
export async function enrichLeadById(leadId: string, cnpjInput?: string) {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId }
  });

  if (!lead) {
    throw new Error(`Lead com ID ${leadId} não encontrado.`);
  }

  const cnpjToUse = cleanCNPJ(cnpjInput || lead.cnpj);

  if (!cnpjToUse) {
    throw new Error('Nenhum CNPJ informado ou cadastrado para este lead.');
  }

  const enriched = await enrichLeadWithCNPJ(cnpjToUse);

  const updatedLead = await prisma.lead.update({
    where: { id: leadId },
    data: {
      cnpj: enriched.cnpj,
      companyName: enriched.companyName || lead.companyName,
      decisionMaker: enriched.decisionMaker || lead.decisionMaker,
      address: lead.address || enriched.address,
      city: lead.city || enriched.city,
      state: lead.state || enriched.state,
      secondaryPhone: lead.secondaryPhone || enriched.secondaryPhone,
      email: lead.email || enriched.email,
      notes: lead.notes 
        ? `${lead.notes}\n[Enriquecimento BrasilAPI]: Razão Social: ${enriched.companyName} | Decisor: ${enriched.decisionMaker || 'N/A'} | CNAE: ${enriched.cnae} | Situação: ${enriched.statusCadastral}`
        : `[Enriquecimento BrasilAPI]: Razão Social: ${enriched.companyName} | Decisor: ${enriched.decisionMaker || 'N/A'} | CNAE: ${enriched.cnae} | Situação: ${enriched.statusCadastral}`
    }
  });

  return {
    lead: updatedLead,
    enriched
  };
}
