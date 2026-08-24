import React from 'react';
import {
  Building,
  Phone,
  Send,
  Users,
  Star,
  MapPin,
  ExternalLink,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { Lead, LeadStatus, STATUS_CONFIG, getWebsiteType } from '../types/lead';

interface LeadsKanbanProps {
  leads: Lead[];
  onStatusChange: (leadId: string, newStatus: LeadStatus) => void;
  onOpenWhatsApp: (lead: Lead) => void;
  onOpenDrawer: (lead: Lead) => void;
}

const COLUMNS: LeadStatus[] = [
  'NEW',
  'CONTACTED',
  'DEMO_SCHEDULED',
  'TRIAL_ACTIVE',
  'CONVERTED',
  'LOST'
];

export const LeadsKanban: React.FC<LeadsKanbanProps> = ({
  leads,
  onStatusChange,
  onOpenWhatsApp,
  onOpenDrawer
}) => {
  const getNextStatus = (current: LeadStatus): LeadStatus | null => {
    const idx = COLUMNS.indexOf(current);
    return idx < COLUMNS.length - 1 ? COLUMNS[idx + 1] : null;
  };

  const getPrevStatus = (current: LeadStatus): LeadStatus | null => {
    const idx = COLUMNS.indexOf(current);
    return idx > 0 ? COLUMNS[idx - 1] : null;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 pb-4 overflow-x-auto">
      {COLUMNS.map((colStatus) => {
        const conf = STATUS_CONFIG[colStatus];
        const colLeads = leads.filter((l) => l.status === colStatus);

        return (
          <div
            key={colStatus}
            className="flex flex-col bg-slate-900/40 rounded-2xl border border-slate-800 p-3 min-h-[500px]"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80">
              <div className="flex items-center space-x-2">
                <span className={`w-2 h-2 rounded-full ${conf.dot}`} />
                <h3 className="text-xs font-bold text-slate-200">{conf.label}</h3>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                {colLeads.length}
              </span>
            </div>

            {/* Cards List */}
            <div className="space-y-2.5 flex-1 overflow-y-auto pr-1">
              {colLeads.length === 0 ? (
                <div className="h-24 flex items-center justify-center border border-dashed border-slate-800 rounded-xl text-[11px] text-slate-600">
                  Nenhum lead
                </div>
              ) : (
                colLeads.map((lead) => {
                  const prev = getPrevStatus(lead.status);
                  const next = getNextStatus(lead.status);

                  return (
                    <div
                      key={lead.id}
                      onClick={() => onOpenDrawer(lead)}
                      className="glass-card rounded-xl p-3 cursor-pointer hover:border-emerald-500/30 transition-all group space-y-2.5 bg-slate-900/80"
                    >
                      {/* Name & Category */}
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="text-xs font-bold text-slate-100 group-hover:text-emerald-300 transition-colors line-clamp-2">
                            {lead.name}
                          </h4>
                          {lead.rating && (
                            <span className="inline-flex items-center text-[10px] text-amber-400 font-semibold flex-shrink-0">
                              <Star className="w-2.5 h-2.5 fill-amber-400 mr-0.5" />
                              {lead.rating}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center flex-wrap gap-1.5 mt-1">
                          <span className="text-[10px] text-slate-400 font-medium bg-slate-800 px-1.5 py-0.2 rounded border border-slate-700/60">
                            {lead.category}
                          </span>
                          {(() => {
                            const webType = getWebsiteType(lead.website);
                            if (webType === 'website') {
                              return (
                                <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.2 rounded border border-emerald-500/20 font-bold">
                                  Com Site
                                </span>
                              );
                            }
                            if (webType === 'social') {
                              return (
                                <span className="text-[9px] bg-amber-500/10 text-amber-400 px-1.5 py-0.2 rounded border border-amber-500/20 font-bold" title="Rede Social ou Formulário">
                                  Rede Social
                                </span>
                              );
                            }
                            return (
                              <span className="text-[9px] bg-rose-500/10 text-rose-400 px-1.5 py-0.2 rounded border border-rose-500/20 font-bold">
                                Sem Site
                              </span>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Decisor or Phone */}
                      <div className="space-y-1 text-[11px]">
                        {lead.decisionMaker ? (
                          <div className="flex items-center space-x-1 text-indigo-300">
                            <Users className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate font-medium">{lead.decisionMaker}</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1 text-slate-400">
                            <Phone className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                            <span className="font-mono">{lead.phone}</span>
                          </div>
                        )}
                        {lead.city && (
                          <div className="flex items-center space-x-1 text-slate-500 text-[10px]">
                            <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
                            <span className="truncate">{lead.city}</span>
                          </div>
                        )}
                      </div>

                      {/* WhatsApp 1-Click Action & Move Buttons */}
                      <div
                        className="pt-2 border-t border-slate-800/60 flex items-center justify-between gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => onOpenWhatsApp(lead)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-600/90 hover:bg-emerald-500 text-white shadow-sm flex items-center space-x-1 active:scale-95 transition-all"
                        >
                          <Send className="w-2.5 h-2.5" />
                          <span>WhatsApp</span>
                        </button>

                        <div className="flex items-center space-x-1">
                          {prev && (
                            <button
                              type="button"
                              onClick={() => onStatusChange(lead.id, prev)}
                              className="p-1 rounded-md bg-slate-800 text-slate-400 hover:text-white transition-colors"
                              title={`Mover para ${STATUS_CONFIG[prev].label}`}
                            >
                              <ChevronLeft className="w-3 h-3" />
                            </button>
                          )}
                          {next && (
                            <button
                              type="button"
                              onClick={() => onStatusChange(lead.id, next)}
                              className="p-1 rounded-md bg-slate-800 text-slate-400 hover:text-white transition-colors"
                              title={`Mover para ${STATUS_CONFIG[next].label}`}
                            >
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
