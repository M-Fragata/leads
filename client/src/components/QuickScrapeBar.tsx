import React, { useState } from 'react';
import { Search, MapPin, Layers, Loader2, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { ScrapeResult } from '../types/lead';

interface QuickScrapeBarProps {
  onScrape: (niche: string, city: string, maxResults: number) => Promise<ScrapeResult | null>;
  isScraping: boolean;
  apifyConfigured: boolean;
  onOpenSettings: () => void;
}

const QUICK_NICHES = [
  'Academia',
  'Clínica Médica',
  'Restaurante',
  'Escritório de Advocacia',
  'Clínica Odontológica',
  'Pet Shop & Veterinária',
  'Salão de Beleza & Estética',
  'Contabilidade',
  'Escola Particular'
];

const QUICK_CITIES = [
  'Maricá, RJ',
  'Rio de Janeiro, RJ',
];

export const QuickScrapeBar: React.FC<QuickScrapeBarProps> = ({
  onScrape,
  isScraping,
  apifyConfigured,
  onOpenSettings
}) => {
  const [niche, setNiche] = useState('Academia');
  const [city, setCity] = useState('São Paulo, SP');
  const [maxResults, setMaxResults] = useState(25);
  const [lastResult, setLastResult] = useState<ScrapeResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!niche.trim() || !city.trim() || isScraping) return;

    const result = await onScrape(niche.trim(), city.trim(), maxResults);
    if (result) {
      setLastResult(result);
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-5 mb-6 shadow-xl relative overflow-hidden border-slate-800/80">
      {/* Background subtle glow */}
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2 flex-wrap">
                Prospecção de Estabelecimentos (Google Maps)
                {!apifyConfigured && (
                  <span className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20">
                    Token Apify Pendente
                    <button
                      type="button"
                      onClick={onOpenSettings}
                      className="underline hover:text-white font-bold ml-1 transition-colors"
                    >
                      Configurar
                    </button>
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400">
                Extração em tempo real com Apify, normalização E.164 e deduplicação no banco de dados.
              </p>
            </div>
          </div>

          {apifyConfigured && (
            <button
              type="button"
              onClick={onOpenSettings}
              className="text-[11px] text-slate-400 hover:text-slate-200 hover:underline transition-colors"
            >
              Configurar Token
            </button>
          )}
        </div>

        {/* Search Inputs Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Niche Input */}
            <div className="md:col-span-5 relative">
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Nicho / Segmento
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  placeholder="Ex: Academia, Restaurante, Clínica..."
                  required
                  disabled={isScraping}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-900/90 border border-slate-700/70 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all disabled:opacity-50"
                />
              </div>
            </div>

            {/* City Input */}
            <div className="md:col-span-4 relative">
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Cidade / Região
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Ex: Maricá, Rio de Janeiro..."
                  required
                  disabled={isScraping}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-900/90 border border-slate-700/70 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all disabled:opacity-50"
                />
              </div>
            </div>

            {/* Max Results Selector */}
            <div className="md:col-span-3 relative">
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Limite de Leads
              </label>
              <div className="flex space-x-2">
                <select
                  value={maxResults}
                  onChange={(e) => setMaxResults(Number(e.target.value))}
                  disabled={isScraping}
                  className="flex-1 px-3 py-2.5 bg-slate-900/90 border border-slate-700/70 rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all disabled:opacity-50"
                >
                  <option value={10}>10 leads</option>
                  <option value={25}>25 leads</option>
                  <option value={50}>50 leads</option>
                  <option value={100}>100 leads</option>
                </select>

                <button
                  type="submit"
                  disabled={isScraping || !niche.trim() || !city.trim()}
                  className="px-5 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-lg shadow-emerald-600/25 flex items-center justify-center space-x-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px]"
                >
                  {isScraping ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Buscando...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      <span>Prospectar</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Quick Filter Tags */}
          <div className="pt-2 border-t border-slate-800/60 flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs">
            <div className="flex items-center flex-wrap gap-1.5">
              <span className="text-slate-400 text-[11px] font-medium mr-1 flex items-center">
                <Layers className="w-3 h-3 mr-1" /> Sugestões:
              </span>
              {QUICK_NICHES.slice(0, 5).map((quickNiche) => (
                <button
                  key={quickNiche}
                  type="button"
                  onClick={() => setNiche(quickNiche)}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-medium border transition-colors ${
                    niche === quickNiche
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-800/60 text-slate-400 border-slate-700/50 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {quickNiche}
                </button>
              ))}
            </div>

            <div className="flex items-center flex-wrap gap-1.5">
              <span className="text-slate-400 text-[11px] font-medium mr-1 flex items-center">
                <MapPin className="w-3 h-3 mr-1" /> Cidades:
              </span>
              {QUICK_CITIES.slice(0, 4).map((quickCity) => (
                <button
                  key={quickCity}
                  type="button"
                  onClick={() => setCity(quickCity)}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-medium border transition-colors ${
                    city === quickCity
                      ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                      : 'bg-slate-800/60 text-slate-400 border-slate-700/50 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {quickCity}
                </button>
              ))}
            </div>
          </div>
        </form>

        {/* Live Feedback / Result banner */}
        {lastResult && (
          <div className="mt-4 p-3 rounded-xl bg-slate-900/90 border border-emerald-500/30 flex items-center justify-between text-xs animate-fadeIn">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span className="text-slate-200">
                Resultado para <strong>"{lastResult.query}"</strong>:{' '}
                <span className="text-emerald-400 font-semibold">{lastResult.insertedCount} novos</span> inseridos,{' '}
                <span className="text-blue-400 font-semibold">{lastResult.updatedCount} atualizados</span>,{' '}
                <span className="text-slate-400">{lastResult.skippedCount} sem telefone ignorados</span>.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
