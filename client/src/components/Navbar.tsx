import React from 'react';
import { Sparkles, Plus, Download } from 'lucide-react';

interface NavbarProps {
  onOpenNewLead: () => void;
  onExportCSV: () => void;
  totalLeads: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenNewLead,
  onExportCSV,
  totalLeads
}) => {
  return (
    <header className="border-b border-slate-800 bg-[#0d1322]/80 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Logo */}
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-400/30">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold tracking-tight text-white font-sans">
                Viggo<span className="text-emerald-400 font-black">.</span>
              </span>
              <span className="text-xs uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Leads CRM
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Prospecção Google Maps + Enriquecimento QSA BrasilAPI
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          {/* Export CSV button */}
          <button
            onClick={onExportCSV}
            disabled={totalLeads === 0}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            title="Exportar leads filtrados para CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>

          {/* New Lead button */}
          <button
            onClick={onOpenNewLead}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Lead</span>
          </button>
        </div>
      </div>
    </header>
  );
};
