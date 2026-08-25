import React, { useState, useEffect } from 'react';
import {
  X,
  Building,
  Phone,
  MapPin,
  Globe,
  Star,
  Users,
  Search,
  CheckCircle2,
  AlertTriangle,
  Send,
  Save,
  Loader2,
  FileText,
  ExternalLink,
  ShieldCheck,
  Briefcase,
  Mail,
  PhoneCall,
  Copy,
  Check
} from 'lucide-react';
import { Lead, LeadStatus, STATUS_CONFIG, EnrichedData, BrasilApiQSA } from '../types/lead';
import { api } from '../services/api';

function formatLeadForClipboard(lead: Lead, notes: string, status: LeadStatus): string {
  const ratingLine =
    lead.rating != null
      ? `Avaliação: ${lead.rating} (${(lead.reviewsCount ?? 0).toLocaleString('pt-BR')} avaliações)`
      : null;

  const lines = [
    `Nome: ${lead.name}`,
    `Categoria: ${lead.category}`,
    lead.city ? `Cidade: ${lead.city}` : null,
    `Telefone: ${lead.phone}`,
    lead.secondaryPhone ? `Telefone 2: ${lead.secondaryPhone}` : null,
    lead.email ? `E-mail: ${lead.email}` : null,
    lead.companyName ? `Razão social: ${lead.companyName}` : null,
    lead.cnpj ? `CNPJ: ${lead.cnpj}` : null,
    lead.decisionMaker ? `Decisor: ${lead.decisionMaker}` : null,
    ratingLine,
    lead.address ? `Endereço: ${lead.address}` : null,
    lead.website ? `Site: ${lead.website}` : null,
    lead.googleMapsUrl ? `Maps: ${lead.googleMapsUrl}` : null,
    `Status: ${STATUS_CONFIG[status].label}`,
    notes.trim() ? `Observações: ${notes.trim()}` : null
  ];

  return lines.filter((line): line is string => Boolean(line)).join('\n');
}

interface LeadDrawerProps {
  isOpen: boolean;
  lead: Lead | null;
  onClose: () => void;
  onLeadUpdated: (lead: Lead) => void;
  onOpenWhatsApp: (lead: Lead) => void;
}

export const LeadDrawer: React.FC<LeadDrawerProps> = ({
  isOpen,
  lead,
  onClose,
  onLeadUpdated,
  onOpenWhatsApp
}) => {
  const [cnpjInput, setCnpjInput] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<LeadStatus>('NEW');
  const [isEnriching, setIsEnriching] = useState(false);
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [enrichResult, setEnrichResult] = useState<EnrichedData | null>(null);
  const [enrichError, setEnrichError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (lead) {
      setCnpjInput(lead.cnpj || '');
      setNotes(lead.notes || '');
      setStatus(lead.status);
      setEnrichResult(null);
      setEnrichError(null);
      setCopied(false);
    }
  }, [lead]);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !lead) return null;

  const handleEnrich = async () => {
    if (!cnpjInput.trim()) {
      setEnrichError('Informe um CNPJ válido com 14 dígitos.');
      return;
    }

    setIsEnriching(true);
    setEnrichError(null);

    try {
      const res = await api.enrichLead(lead.id, cnpjInput.trim());
      if (res.success) {
        setEnrichResult(res.data.enriched);
        onLeadUpdated(res.data.lead);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao consultar BrasilAPI.';
      setEnrichError(msg);
    } finally {
      setIsEnriching(false);
    }
  };

  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    try {
      const res = await api.updateStatus(lead.id, status, notes);
      if (res.success) {
        onLeadUpdated(res.lead);
      }
    } catch (err) {
      console.error('Erro ao salvar:', err);
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleCopyLeadInfo = async () => {
    try {
      await navigator.clipboard.writeText(formatLeadForClipboard(lead, notes, status));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const handleStatusChange = async (newStatus: LeadStatus) => {
    setStatus(newStatus);
    try {
      const res = await api.updateStatus(lead.id, newStatus, notes);
      if (res.success) {
        onLeadUpdated(res.lead);
      }
    } catch (err) {
      console.error('Erro ao mudar status:', err);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lead-drawer-title"
      onClick={onClose}
    >
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div
          className="w-screen max-w-xl bg-[#0d1322] border-l border-slate-800 shadow-2xl flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-5 border-b border-slate-800 bg-[#090d16] flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <h2
                  id="lead-drawer-title"
                  className="text-base font-bold text-white tracking-tight leading-tight"
                >
                  {lead.name}
                </h2>
                <div className="flex items-center space-x-2 mt-0.5">
                  <span className="text-xs text-slate-400 font-medium">{lead.category}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-xs text-slate-400">{lead.city || 'Brasil'}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Fechar painel do lead"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Quick Status & WhatsApp Banner */}
            <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Status no Pipeline
                </span>
                <select
                  value={status}
                  onChange={(e) => handleStatusChange(e.target.value as LeadStatus)}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 text-slate-100 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {Object.entries(STATUS_CONFIG).map(([key, conf]) => (
                    <option key={key} value={key}>
                      {conf.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => onOpenWhatsApp(lead)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 flex items-center space-x-1.5 active:scale-95 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Conversar no WhatsApp</span>
              </button>
            </div>

            {/* General Info Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-emerald-400" /> Informações do Estabelecimento
                </h3>
                <button
                  type="button"
                  onClick={handleCopyLeadInfo}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 transition-colors"
                  title="Copiar todas as informações do lead"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copiado' : 'Copiar informações'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {/* Phone */}
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 text-[11px] block">Telefone (E.164)</span>
                  <div className="font-semibold text-slate-200 mt-0.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{lead.phone}</span>
                  </div>
                </div>

                {/* Secondary Phone */}
                {lead.secondaryPhone && (
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-400 text-[11px] block">Telefone Secundário</span>
                    <div className="font-semibold text-slate-200 mt-0.5 flex items-center gap-1.5 font-mono">
                      <PhoneCall className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{lead.secondaryPhone}</span>
                    </div>
                  </div>
                )}

                {/* Email */}
                {lead.email && (
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-400 text-[11px] block">E-mail Cadastrado</span>
                    <a
                      href={`mailto:${lead.email}`}
                      className="font-semibold text-indigo-300 hover:text-indigo-200 mt-0.5 flex items-center gap-1.5 hover:underline truncate"
                      title="Clique para enviar e-mail"
                    >
                      <Mail className="w-3.5 h-3.5 text-indigo-400" />
                      <span className="truncate">{lead.email}</span>
                    </a>
                  </div>
                )}

                {/* Razão Social */}
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 text-[11px] block">Razão Social</span>
                  <div className="font-semibold text-slate-200 mt-0.5 truncate">
                    {lead.companyName || <span className="text-slate-500 italic">Não informada</span>}
                  </div>
                </div>

                {/* Decisor */}
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 text-[11px] block">Decisor / Sócio Principal</span>
                  <div className="font-semibold text-slate-200 mt-0.5 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{lead.decisionMaker || <span className="text-slate-500 italic">Não identificado</span>}</span>
                  </div>
                </div>

                {/* Rating */}
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 text-[11px] block">Avaliação no Google Maps</span>
                  <div className="font-semibold text-slate-200 mt-0.5 flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span>{lead.rating ? `${lead.rating} (${lead.reviewsCount || 0} avaliações)` : 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Address */}
              {lead.address && (
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                  <span className="text-slate-400 text-[11px] block mb-0.5">Endereço Completo</span>
                  <div className="text-slate-200 flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                    <span>{lead.address}</span>
                  </div>
                </div>
              )}

              {/* Links */}
              <div className="flex flex-wrap gap-2 pt-1 text-xs">
                {lead.website && (
                  <a
                    href={lead.website}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-indigo-300 border border-indigo-500/20 transition-colors"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span className="truncate max-w-[200px]">{lead.website}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {lead.googleMapsUrl && (
                  <a
                    href={lead.googleMapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-colors"
                  >
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Ver no Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>

             {/* CNPJ & BrasilAPI QSA Enrichment Section */}
            <div className="p-4 rounded-xl bg-gradient-to-b from-indigo-950/20 to-slate-900/40 border border-indigo-500/30 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Enriquecimento Societário (BrasilAPI / QSA)
                  </h3>
                </div>
                <a
                  href={`https://www.google.com/search?q=${encodeURIComponent(lead.name + ' ' + (lead.city || '') + ' CNPJ')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] text-indigo-400 hover:text-indigo-300 hover:underline flex items-center gap-1 font-semibold bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-800/40"
                  title="Buscar CNPJ no Google para este estabelecimento"
                >
                  <span>Buscar CNPJ no Google</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Consulte o CNPJ da empresa para extrair automaticamente a Razão Social e os nomes dos Sócios Administradores (QSA).
              </p>

              <div className="flex space-x-2">
                <input
                  type="text"
                  value={cnpjInput}
                  onChange={(e) => setCnpjInput(e.target.value)}
                  placeholder="Informe o CNPJ (ex: 00.000.000/0001-91)"
                  className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleEnrich}
                  disabled={isEnriching || !cnpjInput.trim()}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 flex items-center space-x-1.5 transition-all disabled:opacity-50"
                >
                  {isEnriching ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Search className="w-3.5 h-3.5" />
                  )}
                  <span>{isEnriching ? 'Consultando...' : 'Consultar QSA'}</span>
                </button>
              </div>

              {enrichError && (
                <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{enrichError}</span>
                </div>
              )}

              {/* Enriched Result Details */}
              {enrichResult && (
                <div className="mt-3 p-3 rounded-xl bg-slate-900/90 border border-indigo-500/30 space-y-2.5 text-xs animate-fadeIn">
                  <div className="flex items-center space-x-1.5 text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Dados Societários Atualizados no Lead!</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <span className="text-slate-400 text-[10px]">Razão Social</span>
                      <p className="font-semibold text-slate-200">{enrichResult.companyName}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px]">Situação Cadastral</span>
                      <p className="font-semibold text-emerald-400">{enrichResult.statusCadastral}</p>
                    </div>
                  </div>

                  {enrichResult.cnae && (
                    <div>
                      <span className="text-slate-400 text-[10px]">Atividade Principal (CNAE)</span>
                      <p className="text-slate-300 text-[11px]">{enrichResult.cnae}</p>
                    </div>
                  )}

                  {/* QSA List */}
                  {enrichResult.qsaList && enrichResult.qsaList.length > 0 && (
                    <div className="pt-2 border-t border-slate-800">
                      <span className="text-slate-400 text-[10px] font-semibold block mb-1.5">
                        Quadro de Sócios e Administradores (QSA):
                      </span>
                      <div className="space-y-1">
                        {enrichResult.qsaList.map((socio: BrasilApiQSA, idx: number) => (
                          <div
                            key={idx}
                            className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center justify-between text-xs"
                          >
                            <span className="font-medium text-slate-200">{socio.nome_socio}</span>
                            <span className="text-[10px] bg-indigo-500/10 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/20 font-semibold">
                              {socio.qualificacao_socio}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Notes & Comments */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-emerald-400" /> Observações Internas da Prospecção
                </label>
                <button
                  type="button"
                  onClick={handleSaveNotes}
                  disabled={isSavingNotes}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 transition-colors disabled:opacity-50"
                >
                  {isSavingNotes ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                  <span>Salvar Notas</span>
                </button>
              </div>

              <textarea
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Insira detalhes de conversas, preferências do cliente, propostas enviadas, etc..."
                className="w-full p-3 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all font-sans leading-relaxed"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-[#090d16] border-t border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              ID: {lead.id} • Criado em {new Date(lead.createdAt).toLocaleDateString('pt-BR')}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
