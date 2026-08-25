import React, { useState } from 'react';
import {
  Phone,
  Send,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Building,
  CheckCircle2,
  Trash2,
  Eye,
  ExternalLink,
  Copy,
  Check,
  Star,
  Users
} from 'lucide-react';
import { Lead, LeadStatus, STATUS_CONFIG, Pagination, getWebsiteType } from '../types/lead';

interface LeadsTableProps {
  leads: Lead[];
  pagination: Pagination;
  loading: boolean;
  onStatusChange: (leadId: string, newStatus: LeadStatus) => void;
  onPageChange: (page: number) => void;
  onOpenWhatsApp: (lead: Lead) => void;
  onOpenDrawer: (lead: Lead) => void;
  onDeleteLead: (leadId: string) => void;
}

export const LeadsTable: React.FC<LeadsTableProps> = ({
  leads,
  pagination,
  loading,
  onStatusChange,
  onPageChange,
  onOpenWhatsApp,
  onOpenDrawer,
  onDeleteLead
}) => {
  const [copiedPhoneId, setCopiedPhoneId] = useState<string | null>(null);

  const handleCopyPhone = (leadId: string, phone: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(phone);
    setCopiedPhoneId(leadId);
    setTimeout(() => setCopiedPhoneId(null), 2000);
  };

  return (
    <>
      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/40 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
              <th className="py-3.5 px-4">Estabelecimento / Empresa</th>
              <th className="py-3.5 px-4">Nicho / Categoria</th>
              <th className="py-3.5 px-4">Telefone (E.164)</th>
              <th className="py-3.5 px-4">Decisor / Sócio (QSA)</th>
              <th className="py-3.5 px-4">Status no Funil</th>
              <th className="py-3.5 px-4 text-center">Ação WhatsApp</th>
              <th className="py-3.5 px-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {loading ? (
              [...Array(6)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={7} className="py-4 px-4">
                    <div className="h-4 bg-slate-800/60 rounded w-full"></div>
                  </td>
                </tr>
              ))
            ) : leads.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 px-4 text-center">
                  <div className="max-w-xs mx-auto text-slate-400 space-y-2">
                    <Building className="w-8 h-8 text-slate-600 mx-auto" />
                    <p className="font-semibold text-slate-300">Nenhum lead encontrado</p>
                    <p className="text-xs text-slate-500">
                      Tente alterar os filtros ou faça uma nova busca na barra de prospecção acima.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              leads.map((lead) => {
                const statusConf = STATUS_CONFIG[lead.status] || STATUS_CONFIG.NEW;
                const isCopied = copiedPhoneId === lead.id;

                return (
                  <tr
                    key={lead.id}
                    onClick={() => onOpenDrawer(lead)}
                    className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                  >
                    {/* Name & Company */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-500/10 group-hover:text-emerald-400 group-hover:border-emerald-500/30 border border-slate-700/60 transition-colors">
                          <Building className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-100 truncate group-hover:text-emerald-300 transition-colors flex items-center gap-1.5">
                            <span className="truncate">{lead.name}</span>
                            {lead.rating && (
                              <span
                                className="inline-flex items-center text-[10px] text-amber-400 font-normal flex-shrink-0"
                                title={
                                  lead.reviewsCount != null
                                    ? `${lead.reviewsCount.toLocaleString('pt-BR')} avaliações no Google Maps`
                                    : undefined
                                }
                              >
                                <Star className="w-2.5 h-2.5 fill-amber-400 mr-0.5" />
                                {lead.rating}
                                {lead.reviewsCount != null && (
                                  <span className="text-slate-500 ml-1 font-normal">
                                    ({lead.reviewsCount.toLocaleString('pt-BR')})
                                  </span>
                                )}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate flex items-center gap-1">
                            {lead.companyName ? (
                              <span className="text-slate-300">{lead.companyName}</span>
                            ) : (
                              <span className="text-slate-500">{lead.city || 'Local não informado'}</span>
                            )}
                            {lead.source === 'APIFY_GMAPS' && (
                              <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded border border-slate-700">
                                Maps
                              </span>
                            )}
                            {(() => {
                              const webType = getWebsiteType(lead.website);
                              if (webType === 'website') {
                                return (
                                  <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.2 rounded border border-emerald-500/20 font-medium">
                                    Com Site
                                  </span>
                                );
                              }
                              if (webType === 'social') {
                                return (
                                  <span className="text-[9px] bg-amber-500/10 text-amber-400 px-1.5 py-0.2 rounded border border-amber-500/20 font-medium" title="Link de Rede Social ou Formulário">
                                    Rede Social
                                  </span>
                                );
                              }
                              return (
                                <span className="text-[9px] bg-rose-500/10 text-rose-400 px-1.5 py-0.2 rounded border border-rose-500/20 font-medium">
                                  Sem Site
                                </span>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-800/90 text-slate-300 border border-slate-700/60 text-[11px] font-medium truncate max-w-[140px]">
                        {lead.category}
                      </span>
                    </td>

                    {/* Phone */}
                    <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={(e) => handleCopyPhone(lead.id, lead.phone, e)}
                        className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-900 text-slate-200 border border-slate-700 hover:border-emerald-500/50 transition-colors text-xs font-mono"
                        title="Clique para copiar telefone"
                      >
                        <Phone className="w-3 h-3 text-emerald-400" />
                        <span>{lead.phone}</span>
                        {isCopied ? (
                          <Check className="w-3 h-3 text-emerald-400 ml-1" />
                        ) : (
                          <Copy className="w-2.5 h-2.5 text-slate-500 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </button>
                    </td>

                    {/* Decision Maker (QSA) */}
                    <td className="py-3.5 px-4">
                      {lead.decisionMaker ? (
                        <div className="flex items-center space-x-1.5">
                          <div className="p-1 rounded bg-indigo-500/10 text-indigo-400">
                            <Users className="w-3 h-3" />
                          </div>
                          <div>
                            <span className="font-semibold text-slate-200 block truncate max-w-[160px]">
                              {lead.decisionMaker}
                            </span>
                            <span className="text-[10px] text-indigo-400 font-medium">Sócio / Decisor</span>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenDrawer(lead);
                          }}
                          className="text-[11px] text-slate-400 hover:text-indigo-300 bg-slate-900/60 hover:bg-indigo-950/30 px-2 py-1 rounded-lg border border-dashed border-slate-700 hover:border-indigo-500/40 transition-colors flex items-center gap-1"
                        >
                          <Sparkles className="w-3 h-3 text-indigo-400" />
                          <span>Consultar QSA</span>
                        </button>
                      )}
                    </td>

                    {/* Status Dropdown */}
                    <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                      <div className="relative inline-block">
                        <select
                          value={lead.status}
                          onChange={(e) => onStatusChange(lead.id, e.target.value as LeadStatus)}
                          className={`appearance-none px-3 py-1.5 pr-6 rounded-xl text-xs font-semibold border cursor-pointer focus:outline-none transition-all ${statusConf.bg} ${statusConf.text} ${statusConf.border}`}
                        >
                          {Object.entries(STATUS_CONFIG).map(([key, conf]) => (
                            <option key={key} value={key} className="bg-slate-900 text-slate-100">
                              {conf.label}
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${statusConf.dot}`} />
                        </div>
                      </div>
                    </td>

                    {/* 1-Click WhatsApp Action */}
                    <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => onOpenWhatsApp(lead)}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600/90 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
                        title="Disparar mensagem no WhatsApp"
                      >
                        <Send className="w-3 h-3" />
                        <span>WhatsApp</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          type="button"
                          onClick={() => onOpenDrawer(lead)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                          title="Ver detalhes completos"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteLead(lead.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Excluir lead"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
        <div>
          Mostrando{' '}
          <strong className="text-slate-200">
            {leads.length > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0}
          </strong>{' '}
          a{' '}
          <strong className="text-slate-200">
            {Math.min(pagination.page * pagination.limit, pagination.totalCount)}
          </strong>{' '}
          de <strong className="text-slate-200">{pagination.totalCount}</strong> leads
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={!pagination.hasPrevPage}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-700 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-2 font-medium text-slate-300">
            Página {pagination.page} de {pagination.totalPages || 1}
          </span>
          <button
            type="button"
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={!pagination.hasNextPage}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-700 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );
};
