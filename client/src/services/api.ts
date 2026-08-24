import axios from 'axios';
import {
  Lead,
  LeadsListResponse,
  StatsResponse,
  ScrapeResult,
  LeadStatus,
  ConfigResponse,
  EnrichedData
} from '../types/lead';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const api = {
  // Listagem de leads com paginação e filtros
  async getLeads(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: LeadStatus;
    category?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<LeadsListResponse> {
    const response = await apiClient.get<LeadsListResponse>('/leads', { params });
    return response.data;
  },

  // Métricas do CRM
  async getStats(): Promise<StatsResponse> {
    const response = await apiClient.get<StatsResponse>('/leads/stats');
    return response.data;
  },

  // Categorias cadastradas
  async getCategories(): Promise<{ name: string; count: number }[]> {
    const response = await apiClient.get('/leads/categories');
    return response.data;
  },

  // Disparo de scraping Apify Google Maps
  async scrapeLeads(data: {
    niche: string;
    city: string;
    maxResults: number;
    tokenOverride?: string;
  }): Promise<{ success: boolean; message: string; data: ScrapeResult }> {
    const response = await apiClient.post('/leads/scrape', data);
    return response.data;
  },

  // Atualização inline de status e notas
  async updateStatus(
    id: string,
    status: LeadStatus,
    notes?: string | null
  ): Promise<{ success: boolean; lead: Lead }> {
    const response = await apiClient.patch(`/leads/${id}/status`, { status, notes });
    return response.data;
  },

  // Atualização completa do lead
  async updateLead(id: string, data: Partial<Lead>): Promise<{ success: boolean; lead: Lead }> {
    const response = await apiClient.patch(`/leads/${id}`, data);
    return response.data;
  },

  // Cadastro manual de lead
  async createLead(data: Partial<Lead>): Promise<{ success: boolean; lead: Lead }> {
    const response = await apiClient.post('/leads', data);
    return response.data;
  },

  // Enriquecimento por CNPJ (BrasilAPI)
  async enrichLead(
    id: string,
    cnpj?: string
  ): Promise<{ success: boolean; message: string; data: { lead: Lead; enriched: EnrichedData } }> {
    const response = await apiClient.post(`/leads/${id}/enrich`, { cnpj });
    return response.data;
  },

  // Consulta de CNPJ BrasilAPI avulsa
  async lookupCNPJ(cnpj: string): Promise<{ success: boolean; data: EnrichedData }> {
    const response = await apiClient.post('/cnpj/lookup', { cnpj });
    return response.data;
  },

  // Exclusão de lead
  async deleteLead(id: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete(`/leads/${id}`);
    return response.data;
  },

  // Verificação de configuração e token Apify
  async getConfig(): Promise<ConfigResponse> {
    const response = await apiClient.get<ConfigResponse>('/config');
    return response.data;
  }
};
