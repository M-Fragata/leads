import { z } from 'zod';

export const LeadStatusEnum = z.enum([
  'NEW',
  'CONTACTED',
  'DEMO_SCHEDULED',
  'TRIAL_ACTIVE',
  'CONVERTED',
  'LOST'
]);

export const LeadSourceEnum = z.enum([
  'APIFY_GMAPS',
  'MANUAL'
]);

// Schema para disparo de busca e prospecção
export const scrapeLeadsSchema = z.object({
  niche: z.string().min(2, 'O nicho/segmento é obrigatório e deve ter no mínimo 2 caracteres'),
  city: z.string().min(2, 'A cidade é obrigatória e deve ter no mínimo 2 caracteres'),
  maxResults: z.coerce.number().min(1).max(100).default(50),
  tokenOverride: z.string().optional()
});

// Schema para criação manual de Lead
export const createLeadSchema = z.object({
  name: z.string().min(2, 'O nome é obrigatório'),
  companyName: z.string().optional().nullable(),
  cnpj: z.string().optional().nullable(),
  phone: z.string().min(8, 'O telefone é obrigatório'),
  secondaryPhone: z.string().optional().nullable(),
  email: z.string().email('E-mail em formato inválido').or(z.string().length(0)).optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  category: z.string().min(2, 'A categoria/nicho é obrigatória'),
  decisionMaker: z.string().optional().nullable(),
  source: LeadSourceEnum.default('MANUAL'),
  status: LeadStatusEnum.default('NEW'),
  notes: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  rating: z.number().optional().nullable(),
  reviewsCount: z.number().optional().nullable()
});

// Schema para atualização de status e notas
export const updateLeadStatusSchema = z.object({
  status: LeadStatusEnum,
  notes: z.string().optional().nullable()
});

// Schema para atualização geral do Lead
export const updateLeadSchema = z.object({
  name: z.string().min(2).optional(),
  companyName: z.string().optional().nullable(),
  cnpj: z.string().optional().nullable(),
  phone: z.string().min(8).optional(),
  secondaryPhone: z.string().optional().nullable(),
  email: z.string().email('E-mail em formato inválido').or(z.string().length(0)).optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  category: z.string().optional(),
  decisionMaker: z.string().optional().nullable(),
  status: LeadStatusEnum.optional(),
  notes: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  rating: z.number().optional().nullable(),
  reviewsCount: z.number().optional().nullable()
});

// Schema para enriquecimento por CNPJ
export const enrichLeadSchema = z.object({
  cnpj: z.string().optional()
});

// Schema para listagem com filtros e paginação
export const queryLeadsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(200).default(20),
  search: z.string().optional(),
  status: LeadStatusEnum.optional(),
  category: z.string().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'name', 'rating', 'status']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});
