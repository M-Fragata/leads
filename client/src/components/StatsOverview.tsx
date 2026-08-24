import React from 'react';
import { Users, UserPlus, Send, CalendarCheck, CheckCircle2, TrendingUp } from 'lucide-react';
import { StatsResponse } from '../types/lead';

interface StatsOverviewProps {
  stats: StatsResponse | null;
  loading: boolean;
  onFilterByStatus?: (status: string) => void;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ stats, loading, onFilterByStatus }) => {
  if (loading && !stats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="glass-card rounded-xl p-4 animate-pulse h-24 bg-slate-900/50">
            <div className="h-3 w-16 bg-slate-800 rounded mb-3"></div>
            <div className="h-6 w-10 bg-slate-700 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  const newCount = stats?.status.NEW || 0;
  const contactedCount = stats?.status.CONTACTED || 0;
  const inPipelineCount = (stats?.status.DEMO_SCHEDULED || 0) + (stats?.status.TRIAL_ACTIVE || 0);
  const convertedCount = stats?.status.CONVERTED || 0;
  const total = stats?.total || 0;
  const conversionRate = stats?.conversionRate || '0.0%';

  const cards = [
    {
      title: 'Total de Leads',
      value: total,
      icon: Users,
      color: 'text-slate-200',
      bgIcon: 'bg-slate-800/80 text-slate-300',
      sub: 'Base cadastrada',
      statusKey: 'ALL'
    },
    {
      title: 'Novos',
      value: newCount,
      icon: UserPlus,
      color: 'text-blue-400',
      bgIcon: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
      sub: 'Sem contato prévio',
      statusKey: 'NEW'
    },
    {
      title: 'Contatados',
      value: contactedCount,
      icon: Send,
      color: 'text-amber-400',
      bgIcon: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
      sub: 'Ação via WhatsApp',
      statusKey: 'CONTACTED'
    },
    {
      title: 'Em Negociação',
      value: inPipelineCount,
      icon: CalendarCheck,
      color: 'text-purple-400',
      bgIcon: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
      sub: 'Demo ou Teste',
      statusKey: 'DEMO_SCHEDULED'
    },
    {
      title: 'Convertidos',
      value: convertedCount,
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bgIcon: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
      sub: 'Fechados / Clientes',
      statusKey: 'CONVERTED'
    },
    {
      title: 'Conversão',
      value: conversionRate,
      icon: TrendingUp,
      color: 'text-teal-400',
      bgIcon: 'bg-teal-500/10 text-teal-400 border border-teal-500/20',
      sub: `${stats?.contactRate || '0%'} contatados`,
      statusKey: 'ALL'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            onClick={() => onFilterByStatus && card.statusKey !== 'ALL' && onFilterByStatus(card.statusKey)}
            className="glass-card rounded-xl p-4 cursor-pointer hover:translate-y-[-2px] transition-all flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400 group-hover:text-slate-300 transition-colors">
                {card.title}
              </span>
              <div className={`p-1.5 rounded-lg ${card.bgIcon}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>
            <div>
              <div className={`text-2xl font-bold ${card.color} tracking-tight`}>
                {card.value}
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5 truncate font-medium">
                {card.sub}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
