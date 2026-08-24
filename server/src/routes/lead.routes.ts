import { Router } from 'express';
import { leadController } from '../controllers/lead.controller.js';

const router = Router();

// Extração / Scraper
router.post('/leads/scrape', leadController.scrape);

// Listagem, Métricas e Categorias
router.get('/leads', leadController.list);
router.get('/leads/stats', leadController.getStats);
router.get('/leads/categories', leadController.getCategories);

// CRUD de Leads
router.post('/leads', leadController.create);
router.get('/leads/:id', leadController.getById);
router.patch('/leads/:id/status', leadController.updateStatus);
router.patch('/leads/:id', leadController.update);
router.delete('/leads/:id', leadController.delete);

// Enriquecimento CNPJ / BrasilAPI
router.post('/leads/:id/enrich', leadController.enrich);
router.post('/cnpj/lookup', leadController.lookupCNPJ);

// Configuração / Status
router.get('/config', leadController.getConfig);

export default router;
