import { ApifyClient } from 'apify-client';
import { Lead } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { normalizeBrazilianPhone } from '../utils/phone.js';
import { cleanCNPJ, isValidCNPJ } from '../utils/cnpj.js';
import {
  ScrapedLeadPlace,
  ScrapeExecutionResult,
  getErrorMessage
} from '../types/lead.types.js';

export interface ScrapeOptions {
  niche: string;
  city: string;
  maxResults?: number;
  autoEnrichCnpj?: boolean;
  token?: string;
}

export type ScrapedPlaceItem = ScrapedLeadPlace;
export type ScrapeResult = ScrapeExecutionResult;

interface ApifyRawDatasetItem {
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
  urlWebsite?: string;
  totalScore?: number;
  reviewsCount?: number;
  url?: string;
  googleMapsUrl?: string;
  placeId?: string;
  description?: string;
}

/**
 * Executa a extração real de estabelecimentos comerciais no Google Maps via Apify
 * Utiliza o actor `compass/crawler-google-places`
 */
export async function scrapeLeadsFromGoogleMaps(
  niche: string,
  city: string,
  maxResults: number = 50,
  tokenOverride?: string
): Promise<ScrapeExecutionResult> {
  const token = tokenOverride || process.env.APIFY_TOKEN;

  if (!token || token.trim() === '') {
    throw new Error(
      'APIFY_TOKEN não configurado. Por favor, adicione seu token no arquivo .env (servidor) ou insira nas Configurações da barra superior.'
    );
  }

  const searchQuery = `${niche} em ${city}`;
  console.log(`[Apify Scraper] Iniciando extração REAL para: "${searchQuery}" (Limite: ${maxResults})`);

  let items: ScrapedLeadPlace[] = [];

  try {
    const client = new ApifyClient({ token: token.trim() });

    console.log(`[Apify Scraper] Disparando actor compass/crawler-google-places...`);

    // Configuração para o crawler compass/crawler-google-places
    const run = await client.actor('compass/crawler-google-places').call(
      {
        searchStringsArray: [searchQuery],
        locationQuery: city,
        maxCrawledPlacesPerSearch: Math.min(maxResults, 100),
        language: 'pt-BR',
        countryCode: 'br',
        allPlacesNoSearchAction: '',
        skipClosedPlaces: true,
        includeReviews: false,
        includeImages: false,
        includeHistogram: false,
        includeOpeningHours: false
      },
      {
        waitSecs: 180
      }
    );

    console.log(`[Apify Scraper] Run concluído com sucesso. Dataset ID: ${run.defaultDatasetId}`);

    // Obtenção dos resultados do dataset real
    const dataset = await client.dataset(run.defaultDatasetId).listItems({
      limit: maxResults
    });

    const datasetItems = dataset.items as unknown as ApifyRawDatasetItem[];

    items = datasetItems.map((item) => ({
      title: item.title || item.name,
      name: item.title || item.name,
      phone: item.phone || item.phoneNumber || item.phoneUnformatted,
      address: item.address || item.street,
      city: item.city || city,
      state: item.state,
      postalCode: item.postalCode,
      categoryName: item.categoryName || (Array.isArray(item.categories) ? item.categories[0] : niche),
      website: item.website || item.urlWebsite,
      totalScore: typeof item.totalScore === 'number' ? item.totalScore : undefined,
      reviewsCount: typeof item.reviewsCount === 'number' ? item.reviewsCount : undefined,
      url: item.url || item.googleMapsUrl,
      placeId: item.placeId,
      cnpj: extractCnpjFromText(item.address || '') || extractCnpjFromText(item.description || '')
    }));

    console.log(`[Apify Scraper] ${items.length} estabelecimentos reais retornados.`);
  } catch (apiError: unknown) {
    const errMessage = getErrorMessage(apiError);
    console.error(`[Apify Scraper] Erro ao executar Apify: ${errMessage}`);
    throw new Error(`Falha na extração com Apify: ${errMessage}`);
  }

  // Higienização, validação de telefone E.164 e deduplicação / upsert no banco
  let insertedCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;
  let totalWithPhone = 0;
  const processedLeads: Lead[] = [];

  for (const item of items) {
    const rawName = (item.title || item.name || '').trim();
    if (!rawName) {
      skippedCount++;
      continue;
    }

    const rawPhone = item.phone || item.phoneNumber || item.phoneUnformatted;
    const normalizedPhone = normalizeBrazilianPhone(rawPhone);

    // Rejeita estabelecimentos sem telefone válido no padrão E.164 (+55...)
    if (!normalizedPhone) {
      skippedCount++;
      continue;
    }

    totalWithPhone++;

    const category = item.categoryName || niche;
    const address = item.address || `${item.street || ''} ${item.city || city}`.trim() || undefined;
    const website = item.website || undefined;
    const rating = item.totalScore ? Number(item.totalScore.toFixed(1)) : null;
    const reviewsCount = item.reviewsCount ? Number(item.reviewsCount) : null;
    const googleMapsUrl = item.url || undefined;
    const rawCnpj = item.cnpj ? cleanCNPJ(item.cnpj) : null;
    const validCnpj = rawCnpj && isValidCNPJ(rawCnpj) ? rawCnpj : null;

    try {
      // Upsert garantindo deduplicação por telefone único
      const existing = await prisma.lead.findUnique({
        where: { phone: normalizedPhone }
      });

      if (existing) {
        // Atualiza dados cadastrais mantendo notas e status existentes
        const updated = await prisma.lead.update({
          where: { phone: normalizedPhone },
          data: {
            name: rawName,
            address: existing.address || address,
            city: existing.city || city,
            category: existing.category || category,
            website: existing.website || website,
            rating: rating || existing.rating,
            reviewsCount: reviewsCount || existing.reviewsCount,
            googleMapsUrl: googleMapsUrl || existing.googleMapsUrl,
            cnpj: existing.cnpj || validCnpj
          }
        });

        updatedCount++;
        processedLeads.push(updated);
      } else {
        // Criação de novo Lead real
        const created = await prisma.lead.create({
          data: {
            name: rawName,
            phone: normalizedPhone,
            address: address,
            city: city,
            category: category,
            source: 'APIFY_GMAPS',
            status: 'NEW',
            website: website,
            rating: rating,
            reviewsCount: reviewsCount,
            googleMapsUrl: googleMapsUrl,
            cnpj: validCnpj
          }
        });

        insertedCount++;
        processedLeads.push(created);
      }
    } catch (dbError: unknown) {
      const dbMsg = getErrorMessage(dbError);
      console.error(`[Apify Scraper] Erro ao persistir lead (${rawName}):`, dbMsg);
      skippedCount++;
    }
  }

  return {
    niche,
    city,
    query: searchQuery,
    totalFound: items.length,
    totalWithPhone,
    insertedCount,
    updatedCount,
    skippedCount,
    leads: processedLeads
  };
}

/**
 * Tenta extrair padrões de CNPJ (XX.XXX.XXX/XXXX-XX ou 14 dígitos) de textos de endereço ou descrição
 */
function extractCnpjFromText(text: string): string | null {
  if (!text) return null;
  const match = text.match(/\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}/);
  return match ? match[0] : null;
}
