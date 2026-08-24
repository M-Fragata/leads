export type LeadStatus =
  | 'NEW'
  | 'CONTACTED'
  | 'DEMO_SCHEDULED'
  | 'TRIAL_ACTIVE'
  | 'CONVERTED'
  | 'LOST';

export type LeadSource = 'APIFY_GMAPS' | 'MANUAL';

export interface Lead {
  id: string;
  name: string;
  companyName?: string | null;
  cnpj?: string | null;
  phone: string;
  secondaryPhone?: string | null;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  category: string;
  decisionMaker?: string | null;
  source: LeadSource;
  status: LeadStatus;
  notes?: string | null;
  website?: string | null;
  rating?: number | null;
  reviewsCount?: number | null;
  googleMapsUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BrasilApiQSA {
  nome_socio: string;
  qualificacao_socio: string;
  faixa_etaria?: string | null;
  cnpj_cpf_do_socio?: string | null;
  data_entrada_sociedade?: string;
  nome_representante_legal?: string | null;
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

export interface ScrapeResult {
  niche: string;
  city: string;
  query: string;
  totalFound: number;
  totalWithPhone: number;
  insertedCount: number;
  updatedCount: number;
  skippedCount: number;
  leads: Lead[];
}

export interface LeadsCounts {
  total: number;
  NEW: number;
  CONTACTED: number;
  DEMO_SCHEDULED: number;
  TRIAL_ACTIVE: number;
  CONVERTED: number;
  LOST: number;
}

export interface Pagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface LeadsListResponse {
  leads: Lead[];
  pagination: Pagination;
  counts: LeadsCounts;
}

export interface CategoryCount {
  category: string;
  count: number;
}

export interface StatsResponse {
  total: number;
  status: Record<LeadStatus, number>;
  conversionRate: string;
  contactRate: string;
  topCategories: CategoryCount[];
}

export interface ConfigResponse {
  apifyConfigured: boolean;
  apifyTokenMasked?: string | null;
  environment: string;
}

export const STATUS_CONFIG: Record<
  LeadStatus,
  { label: string; bg: string; text: string; border: string; dot: string; description: string }
> = {
  NEW: {
    label: 'Novo Lead',
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    border: 'border-blue-500/20',
    dot: 'bg-blue-400',
    description: 'Extraído recentemente, sem contato prévio'
  },
  CONTACTED: {
    label: 'Contatado',
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/20',
    dot: 'bg-amber-400',
    description: 'Mensagem enviada no WhatsApp ou telefone'
  },
  DEMO_SCHEDULED: {
    label: 'Demo Agendada',
    bg: 'bg-purple-500/10',
    text: 'text-purple-400',
    border: 'border-purple-500/20',
    dot: 'bg-purple-400',
    description: 'Apresentação ou demonstração agendada'
  },
  TRIAL_ACTIVE: {
    label: 'Em Teste',
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-400',
    border: 'border-cyan-500/20',
    dot: 'bg-cyan-400',
    description: 'Período de teste ativo no Viggo'
  },
  CONVERTED: {
    label: 'Convertido',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/20',
    dot: 'bg-emerald-400',
    description: 'Contrato fechado / Cliente ativo'
  },
  LOST: {
    label: 'Perdido',
    bg: 'bg-rose-500/10',
    text: 'text-rose-400',
    border: 'border-rose-500/20',
    dot: 'bg-rose-400',
    description: 'Sem interesse ou fora do perfil'
  }
};

export function getWebsiteType(url?: string | null): 'none' | 'social' | 'website' {
  if (!url || url.trim() === '') return 'none';
  
  const socialDomains = [
    'instagram.com', 'instagr.am',
    'facebook.com', 'fb.com', 'fb.me',
    'linktr.ee', 'linktr',
    'wa.me', 'whatsapp.com',
    'forms.gle', 'google.com/forms', 'docs.google.com',
    'youtube.com', 'youtu.be',
    'tiktok.com'
  ];
  
  const urlLower = url.toLowerCase();
  const isSocial = socialDomains.some(domain => urlLower.includes(domain));
  
  return isSocial ? 'social' : 'website';
}
