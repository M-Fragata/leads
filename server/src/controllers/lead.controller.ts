import { Request, Response } from 'express';
import { Prisma, Lead, LeadStatus } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import {
  scrapeLeadsSchema,
  createLeadSchema,
  updateLeadStatusSchema,
  updateLeadSchema,
  enrichLeadSchema,
  queryLeadsSchema
} from '../schemas/lead.schema.js';
import { scrapeLeadsFromGoogleMaps } from '../services/apify-scraper.js';
import { enrichLeadById, enrichLeadWithCNPJ } from '../services/cnpj-enrichment.js';
import { normalizeBrazilianPhone } from '../utils/phone.js';
import { cleanCNPJ, isValidCNPJ } from '../utils/cnpj.js';
import {
  getErrorMessage,
  LeadsListResponseDto,
  LeadStatsDto,
  LeadStatusCounts,
  CategoryCountDto,
  LeadConfigDto
} from '../types/lead.types.js';

export const leadController = {
  /**
   * POST /api/leads/scrape
   * Executa extração de leads via Apify Google Maps Scraper
   */
  async scrape(req: Request, res: Response): Promise<void> {
    try {
      const validation = scrapeLeadsSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({
          error: 'Dados de busca inválidos',
          details: validation.error.format()
        });
        return;
      }

      const { niche, city, maxResults, tokenOverride } = validation.data;

      const result = await scrapeLeadsFromGoogleMaps(niche, city, maxResults, tokenOverride);

      res.status(200).json({
        success: true,
        message: `Busca finalizada para "${niche} em ${city}"`,
        data: result
      });
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      console.error('[leadController.scrape] Erro:', message);
      res.status(500).json({
        error: 'Falha ao processar extração de leads',
        message
      });
    }
  },

  /**
   * GET /api/leads
   * Retorna listagem de leads com paginação, filtros e contagem por status
   */
  async list(req: Request, res: Response): Promise<void> {
    try {
      const validation = queryLeadsSchema.safeParse(req.query);
      if (!validation.success) {
        res.status(400).json({
          error: 'Parâmetros de consulta inválidos',
          details: validation.error.format()
        });
        return;
      }

      const { page, limit, search, status, category, sortBy, sortOrder } = validation.data;
      const skip = (page - 1) * limit;

      const where: Prisma.LeadWhereInput = {};

      if (status) {
        where.status = status;
      }

      if (category && category !== 'ALL') {
        where.category = {
          equals: category,
          mode: 'insensitive'
        };
      }

      if (search && search.trim() !== '') {
        const term = search.trim();
        where.OR = [
          { name: { contains: term, mode: 'insensitive' } },
          { companyName: { contains: term, mode: 'insensitive' } },
          { decisionMaker: { contains: term, mode: 'insensitive' } },
          { phone: { contains: term } },
          { city: { contains: term, mode: 'insensitive' } },
          { address: { contains: term, mode: 'insensitive' } },
          { cnpj: { contains: cleanCNPJ(term) || term } }
        ];
      }

      // Consulta em paralelo: leads, total filtrado, e métricas por status
      const [leads, totalCount, statusCounts] = await Promise.all([
        prisma.lead.findMany({
          where,
          skip,
          take: limit,
          orderBy: {
            [sortBy]: sortOrder
          }
        }),
        prisma.lead.count({ where }),
        prisma.lead.groupBy({
          by: ['status'],
          _count: {
            status: true
          }
        })
      ]);

      const countsMap: LeadStatusCounts = {
        total: 0,
        NEW: 0,
        CONTACTED: 0,
        DEMO_SCHEDULED: 0,
        TRIAL_ACTIVE: 0,
        CONVERTED: 0,
        LOST: 0
      };

      statusCounts.forEach((item) => {
        countsMap[item.status as LeadStatus] = item._count.status;
      });

      const totalLeads = (
        countsMap.NEW +
        countsMap.CONTACTED +
        countsMap.DEMO_SCHEDULED +
        countsMap.TRIAL_ACTIVE +
        countsMap.CONVERTED +
        countsMap.LOST
      );

      countsMap.total = totalLeads;

      const responsePayload: LeadsListResponseDto = {
        leads,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit) || 1,
          hasNextPage: skip + limit < totalCount,
          hasPrevPage: page > 1
        },
        counts: countsMap
      };

      res.status(200).json(responsePayload);
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      console.error('[leadController.list] Erro:', message);
      res.status(500).json({
        error: 'Erro ao listar leads',
        message
      });
    }
  },

  /**
   * GET /api/leads/stats
   * Métricas analíticas do CRM
   */
  async getStats(_req: Request, res: Response): Promise<void> {
    try {
      const [statusCounts, categoryCounts, totalCount] = await Promise.all([
        prisma.lead.groupBy({
          by: ['status'],
          _count: { status: true }
        }),
        prisma.lead.groupBy({
          by: ['category'],
          _count: { category: true },
          orderBy: {
            _count: {
              category: 'desc'
            }
          },
          take: 8
        }),
        prisma.lead.count()
      ]);

      const statusMap: Record<LeadStatus, number> = {
        NEW: 0,
        CONTACTED: 0,
        DEMO_SCHEDULED: 0,
        TRIAL_ACTIVE: 0,
        CONVERTED: 0,
        LOST: 0
      };

      statusCounts.forEach((item) => {
        statusMap[item.status as LeadStatus] = item._count.status;
      });

      const conversionRate = totalCount > 0 
        ? ((statusMap.CONVERTED / totalCount) * 100).toFixed(1) 
        : '0.0';

      const contactedOrBeyond = statusMap.CONTACTED + statusMap.DEMO_SCHEDULED + statusMap.TRIAL_ACTIVE + statusMap.CONVERTED;
      const contactRate = totalCount > 0
        ? ((contactedOrBeyond / totalCount) * 100).toFixed(1)
        : '0.0';

      const topCategories: CategoryCountDto[] = categoryCounts.map((c) => ({
        category: c.category,
        count: c._count.category
      }));

      const statsPayload: LeadStatsDto = {
        total: totalCount,
        status: statusMap,
        conversionRate: `${conversionRate}%`,
        contactRate: `${contactRate}%`,
        topCategories
      };

      res.status(200).json(statsPayload);
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      console.error('[leadController.getStats] Erro:', message);
      res.status(500).json({
        error: 'Erro ao obter estatísticas',
        message
      });
    }
  },

  /**
   * GET /api/leads/categories
   * Lista categorias/nichos únicos para filtros
   */
  async getCategories(_req: Request, res: Response): Promise<void> {
    try {
      const categories = await prisma.lead.groupBy({
        by: ['category'],
        _count: { category: true },
        orderBy: {
          _count: {
            category: 'desc'
          }
        }
      });

      const result: CategoryCountDto[] = categories.map((c) => ({
        name: c.category,
        category: c.category,
        count: c._count.category
      }));

      res.status(200).json(result);
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      console.error('[leadController.getCategories] Erro:', message);
      res.status(500).json({ error: 'Erro ao buscar categorias', message });
    }
  },

  /**
   * GET /api/leads/:id
   * Retorna um único lead
   */
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      const lead = await prisma.lead.findUnique({
        where: { id }
      });

      if (!lead) {
        res.status(404).json({ error: 'Lead não encontrado' });
        return;
      }

      res.status(200).json(lead);
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      res.status(500).json({ error: 'Erro ao buscar lead', message });
    }
  },

  /**
   * POST /api/leads
   * Criação manual de lead
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      const validation = createLeadSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({
          error: 'Dados do lead inválidos',
          details: validation.error.format()
        });
        return;
      }

      const data = validation.data;
      const normalizedPhone = normalizeBrazilianPhone(data.phone);

      if (!normalizedPhone) {
        res.status(400).json({
          error: 'Telefone inválido',
          message: 'Informe um número com DDD válido (ex: 11987654321 ou +5511987654321)'
        });
        return;
      }

      const cleanCnpjVal = data.cnpj ? cleanCNPJ(data.cnpj) : null;
      if (cleanCnpjVal && !isValidCNPJ(cleanCnpjVal)) {
        res.status(400).json({
          error: 'CNPJ inválido',
          message: 'O CNPJ informado possui dígitos verificadores incorretos'
        });
        return;
      }

      // Verifica se o telefone já está cadastrado
      const existingPhone = await prisma.lead.findUnique({
        where: { phone: normalizedPhone }
      });

      if (existingPhone) {
        res.status(409).json({
          error: 'Telefone já cadastrado',
          message: `Já existe um lead (${existingPhone.name}) com este número de telefone.`,
          lead: existingPhone
        });
        return;
      }

      const lead: Lead = await prisma.lead.create({
        data: {
          name: data.name,
          companyName: data.companyName,
          cnpj: cleanCnpjVal,
          phone: normalizedPhone,
          secondaryPhone: data.secondaryPhone,
          email: data.email,
          address: data.address,
          city: data.city,
          state: data.state,
          category: data.category,
          decisionMaker: data.decisionMaker,
          source: data.source || 'MANUAL',
          status: data.status || 'NEW',
          notes: data.notes,
          website: data.website,
          rating: data.rating,
          reviewsCount: data.reviewsCount
        }
      });

      res.status(201).json({
        success: true,
        message: 'Lead criado com sucesso',
        lead
      });
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      console.error('[leadController.create] Erro:', message);
      res.status(500).json({ error: 'Erro ao criar lead', message });
    }
  },

  /**
   * PATCH /api/leads/:id/status
   * Atualização rápida do status do lead e observações
   */
  async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      const validation = updateLeadStatusSchema.safeParse(req.body);

      if (!validation.success) {
        res.status(400).json({
          error: 'Status inválido',
          details: validation.error.format()
        });
        return;
      }

      const { status, notes } = validation.data;

      const existing = await prisma.lead.findUnique({ where: { id } });
      if (!existing) {
        res.status(404).json({ error: 'Lead não encontrado' });
        return;
      }

      const updated: Lead = await prisma.lead.update({
        where: { id },
        data: {
          status,
          notes: notes !== undefined ? notes : existing.notes
        }
      });

      res.status(200).json({
        success: true,
        message: 'Status atualizado com sucesso',
        lead: updated
      });
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      console.error('[leadController.updateStatus] Erro:', message);
      res.status(500).json({ error: 'Erro ao atualizar status', message });
    }
  },

  /**
   * PATCH /api/leads/:id
   * Atualização completa de dados do lead
   */
  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      const validation = updateLeadSchema.safeParse(req.body);

      if (!validation.success) {
        res.status(400).json({
          error: 'Dados de atualização inválidos',
          details: validation.error.format()
        });
        return;
      }

      const data = validation.data;
      const updatePayload: Prisma.LeadUpdateInput = {
        name: data.name,
        companyName: data.companyName,
        secondaryPhone: data.secondaryPhone,
        email: data.email,
        address: data.address,
        city: data.city,
        state: data.state,
        category: data.category,
        decisionMaker: data.decisionMaker,
        status: data.status,
        notes: data.notes,
        website: data.website,
        rating: data.rating,
        reviewsCount: data.reviewsCount
      };

      if (data.phone) {
        const normalized = normalizeBrazilianPhone(data.phone);
        if (!normalized) {
          res.status(400).json({ error: 'Telefone inválido' });
          return;
        }
        updatePayload.phone = normalized;
      }

      if (data.cnpj) {
        const clean = cleanCNPJ(data.cnpj);
        if (clean && !isValidCNPJ(clean)) {
          res.status(400).json({ error: 'CNPJ inválido' });
          return;
        }
        updatePayload.cnpj = clean;
      }

      const updated: Lead = await prisma.lead.update({
        where: { id },
        data: updatePayload
      });

      res.status(200).json({
        success: true,
        message: 'Lead atualizado com sucesso',
        lead: updated
      });
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      console.error('[leadController.update] Erro:', message);
      res.status(500).json({ error: 'Erro ao atualizar lead', message });
    }
  },

  /**
   * POST /api/leads/:id/enrich
   * Enriquece lead existente consultando BrasilAPI
   */
  async enrich(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      const validation = enrichLeadSchema.safeParse(req.body);

      const cnpjInput = validation.success ? validation.data.cnpj : undefined;

      const result = await enrichLeadById(id, cnpjInput);

      res.status(200).json({
        success: true,
        message: 'Lead enriquecido com sucesso via BrasilAPI (QSA)',
        data: result
      });
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      console.error('[leadController.enrich] Erro:', message);
      res.status(400).json({
        error: 'Falha ao enriquecer lead',
        message
      });
    }
  },

  /**
   * POST /api/cnpj/lookup
   * Consulta avulsa de CNPJ na BrasilAPI para visualização de QSA
   */
  async lookupCNPJ(req: Request, res: Response): Promise<void> {
    try {
      const cnpj = String(req.body.cnpj || '');
      if (!cnpj) {
        res.status(400).json({ error: 'CNPJ é obrigatório' });
        return;
      }

      const result = await enrichLeadWithCNPJ(cnpj);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      res.status(400).json({
        error: 'Erro ao consultar CNPJ',
        message
      });
    }
  },

  /**
   * DELETE /api/leads/:id
   * Exclui um lead
   */
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      await prisma.lead.delete({
        where: { id }
      });

      res.status(200).json({
        success: true,
        message: 'Lead excluído com sucesso'
      });
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      res.status(500).json({ error: 'Erro ao excluir lead', message });
    }
  },

  /**
   * GET /api/config
   * Retorna status da configuração do Apify e do sistema
   */
  async getConfig(_req: Request, res: Response): Promise<void> {
    const hasApifyToken = Boolean(process.env.APIFY_TOKEN && process.env.APIFY_TOKEN.trim() !== '');
    const configPayload: LeadConfigDto = {
      apifyConfigured: hasApifyToken,
      apifyTokenMasked: hasApifyToken 
        ? `${process.env.APIFY_TOKEN!.substring(0, 6)}...${process.env.APIFY_TOKEN!.slice(-4)}`
        : null,
      environment: process.env.NODE_ENV || 'development'
    };

    res.status(200).json(configPayload);
  }
};
