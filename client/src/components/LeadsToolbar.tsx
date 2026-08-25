import React from 'react';
import { Search, LayoutGrid, List } from 'lucide-react';
import { LeadsCounts } from '../types/lead';

interface LeadsToolbarProps {
  counts: LeadsCounts;
  categories: { name: string; count: number }[];
  selectedStatus: string;
  selectedCategory: string;
  searchQuery: string;
  viewMode: 'table' | 'kanban';
  onFilterStatus: (status: string) => void;
  onFilterCategory: (category: string) => void;
  onSearch: (query: string) => void;
  onToggleViewMode: (mode: 'table' | 'kanban') => void;
}

export const LeadsToolbar: React.FC<LeadsToolbarProps> = ({
  counts,
  categories,
  selectedStatus,
  selectedCategory,
  searchQuery,
  viewMode,
  onFilterStatus,
  onFilterCategory,
  onSearch,
  onToggleViewMode
}) => {
  const statusTabs = [
    { key: 'ALL', label: 'Todos', count: counts.total },
    { key: 'NEW', label: 'Novos', count: counts.NEW },
    { key: 'CONTACTED', label: 'Contatados', count: counts.CONTACTED },
    { key: 'DEMO_SCHEDULED', label: 'Demo Agendada', count: counts.DEMO_SCHEDULED },
    { key: 'TRIAL_ACTIVE', label: 'Em Teste', count: counts.TRIAL_ACTIVE },
    { key: 'CONVERTED', label: 'Convertidos', count: counts.CONVERTED },
    { key: 'LOST', label: 'Perdidos', count: counts.LOST }
  ];

  return (
    <div className="p-4 border-b border-slate-800/80 bg-slate-900/60 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
      <div className="flex items-center space-x-1 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
        {statusTabs.map((tab) => {
          const isActive = selectedStatus === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onFilterStatus(tab.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center space-x-1.5 ${
                isActive
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-transparent'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-emerald-500/30 text-emerald-200' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center space-x-2 flex-wrap sm:flex-nowrap">
        <div className="relative flex-1 sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Buscar por nome, sócio, telefone..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-950/80 border border-slate-700/70 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
          />
        </div>

        <div className="relative">
          <select
            value={selectedCategory}
            onChange={(e) => onFilterCategory(e.target.value)}
            className="px-3 py-1.5 bg-slate-950/80 border border-slate-700/70 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
          >
            <option value="ALL">Todas Categorias</option>
            {categories.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name} ({c.count})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center bg-slate-950/80 p-0.5 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => onToggleViewMode('table')}
            className={`p-1.5 rounded-lg transition-colors ${
              viewMode === 'table'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Visualização em Tabela"
            aria-pressed={viewMode === 'table'}
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onToggleViewMode('kanban')}
            className={`p-1.5 rounded-lg transition-colors ${
              viewMode === 'kanban'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Visualização em Kanban / Funil"
            aria-pressed={viewMode === 'kanban'}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
