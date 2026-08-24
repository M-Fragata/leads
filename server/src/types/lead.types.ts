import { Lead, LeadStatus, LeadSource, Prisma } from '@prisma/client';

export type { Lead, LeadStatus, LeadSource };

// ==========================================
// DTOs & Interfaces de Respostas da API
// ==========================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface ApiErrorResponse {
  error: string;
  message?: string;
  details?: Record<string, unknown>;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface LeadStatusCounts {
  total: number;
  NEW: number;
  CONTACTED: number;
  DEMO_SCHEDULED: number;
  TRIAL_ACTIVE: number;
  CONVERTED: number;
  LOST: number;
}

export interface LeadsListResponseDto {
  leads: Lead[];
  pagination: PaginationMeta;
  counts: LeadStatusCounts;
}

export interface CategoryCountDto {
  category: string;
  count: number;
}

export interface LeadStatsDto {
  total: number;
  status: Record<LeadStatus, number>;
  conversionRate: string;
  contactRate: string;
  topCategories: CategoryCountDto[];
}

export interface LeadConfigDto {
  apifyConfigured: boolean;
  apifyTokenMasked: string | null;
  environment: string;
}

// ==========================================
// Tipos para Enriquecimento e Scraping
// ==========================================

export interface BrasilApiQSASocio {
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

export interface EnrichedCompanyData {
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
  qsaList: BrasilApiQSASocio[];
}

export interface ScrapedLeadPlace {
  title?: string;
  name?: string;
  phone?: string;
  phoneNumber?: string;
  phoneUnformatted?: string;
  address?: string;
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  categoryName?: string;
  categories?: string[];
  website?: string;
  totalScore?: number;
  reviewsCount?: number;
  url?: string;
  placeId?: string;
  cnpj?: string | null;
  taxId?: string | null;
}

export interface ScrapeExecutionResult {
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

// ==========================================
// Utilitários de Tipagem de Erro
// ==========================================

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: unknown }).message);
  }
  return 'Ocorreu um erro desconhecido';
}
