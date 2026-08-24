import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import leadRoutes from './routes/lead.routes.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging simplificado para requisições de desenvolvimento
app.use((req: Request, _res: Response, next: NextFunction) => {
  const start = Date.now();
  next();
  const duration = Date.now() - start;
  if (process.env.NODE_ENV !== 'test') {
    console.log(`[API] ${req.method} ${req.url} - ${duration}ms`);
  }
});

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'Viggo Leads CRM API',
    timestamp: new Date().toISOString()
  });
});

// Rotas da API
app.use('/api', leadRoutes);

// Tratamento de rotas 404
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    error: 'Endpoint não encontrado',
    message: 'Verifique a URL e o método HTTP utilizado.'
  });
});

// Tratamento global de erros
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Global Error Handler]:', err);
  const status = typeof err === 'object' && err !== null && 'status' in err && typeof (err as { status: unknown }).status === 'number'
    ? (err as { status: number }).status
    : 500;
  const message = err instanceof Error ? err.message : 'Ocorreu um erro inesperado';

  res.status(status).json({
    error: 'Erro interno no servidor',
    message
  });
});

// Inicialização do servidor
app.listen(port, () => {
  console.log(`🚀 [Viggo Leads CRM] Backend rodando na porta ${port}`);
  console.log(`📡 URL da API: http://localhost:${port}/api`);
  console.log(`⚡ Health check: http://localhost:${port}/health`);
});

export default app;
