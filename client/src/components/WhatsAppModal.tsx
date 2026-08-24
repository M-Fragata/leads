import React, { useState, useEffect } from 'react';
import { X, Send, Copy, Check, MessageSquare, ExternalLink, User, Building, Sparkles, Globe, CalendarCheck } from 'lucide-react';
import { Lead, getWebsiteType } from '../types/lead';

interface WhatsAppModalProps {
  isOpen: boolean;
  lead: Lead | null;
  onClose: () => void;
  onStatusUpdated?: (leadId: string, newStatus: string) => void;
}

type ActiveService = 'viggo' | 'website';

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({
  isOpen,
  lead,
  onClose,
  onStatusUpdated
}) => {
  const [activeService, setActiveService] = useState<ActiveService>('viggo');
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [autoUpdateStatus, setAutoUpdateStatus] = useState(true);

  // Auto-seleciona o serviço sugerido com base na presença de website real
  useEffect(() => {
    if (lead) {
      const webType = getWebsiteType(lead.website);
      if (webType === 'website') {
        setActiveService('viggo'); // Com site real: sugere oferecer o Viggo
      } else {
        setActiveService('website'); // Sem site ou apenas rede social: sugere criar site
      }
    }
  }, [lead]);

  // Gera o template conforme o serviço ativo e dados do lead
  useEffect(() => {
    if (!lead) return;

    const companyName = lead.companyName || lead.name;
    const region = lead.city || 'da região';
    const webType = getWebsiteType(lead.website);
    const hasRealWebsite = webType === 'website';
    const isSocialMedia = webType === 'social';

    let initialMessage = '';

    if (activeService === 'viggo') {
      if (lead.decisionMaker && lead.decisionMaker.trim() !== '') {
        initialMessage = `Olá ${lead.decisionMaker}, tudo bem? Vi que você está à frente da ${companyName}.\n\nDesenvolvemos uma tecnologia de ponto digital com biometria facial para empresas da região de ${region} que elimina fraudes, evita passivos trabalhistas com horas extras e automatiza o fechamento da folha.\n\nTeria 5 minutos para ver uma demonstração rápida de como a biometria facial se aplica no seu segmento?`;
      } else {
        initialMessage = `Olá! Gostaria de falar com o responsável pela equipe e controle de ponto da ${companyName}.\n\nDesenvolvemos uma solução moderna de registro de ponto por reconhecimento facial e escalas de equipe para empresas de ${region}. Poderia me indicar o contato do gerente ou do DP, por gentileza?`;
      }
    } else {
      // Criação ou Redesign de Site
      if (!lead.website || lead.website.trim() === '') {
        // Criação de Site (Absolutamente Sem site cadastrado)
        if (lead.decisionMaker && lead.decisionMaker.trim() !== '') {
          initialMessage = `Olá ${lead.decisionMaker}, tudo bem? Vi que você está à frente da ${companyName}.\n\nSomos especialistas em desenvolvimento web e notei que a sua empresa é super recomendada no Google em ${region}, mas vocês ainda não possuem um site institucional próprio para captar clientes online e transmitir mais profissionalismo.\n\nDesenvolvemos páginas de alta conversão prontas para celular. Vamos bater um papo rápido de 5 minutos sobre como um site moderno pode trazer mais vendas para a ${companyName}?`;
        } else {
          initialMessage = `Olá! Gostaria de falar com o responsável pela parte de marketing ou vendas da ${companyName}.\n\nNotei que vocês são super recomendados no Google, mas não encontrei o site oficial da empresa de vocês na internet. Desenvolvemos sites profissionais de alto desempenho para o segmento de ${lead.category}.\n\nQuem seria a melhor pessoa para eu apresentar uma proposta rápida de posicionamento digital?`;
        }
      } else if (isSocialMedia) {
        // Oferecer Site (Tem apenas Instagram/Facebook link)
        if (lead.decisionMaker && lead.decisionMaker.trim() !== '') {
          initialMessage = `Olá ${lead.decisionMaker}, tudo bem? Vi que você está à frente da ${companyName}.\n\nEstava analisando a presença digital de vocês nas redes sociais (${lead.website}) e achei excelente a comunicação. Mas notei que a empresa ainda não possui um site oficial próprio para organizar seus serviços e captar novos clientes de forma automatizada.\n\nDesenvolvemos sites profissionais de alta performance. Teria 5 minutos para conversarmos sobre como transformar seus seguidores das redes em clientes ativos com um site moderno para a ${companyName}?`;
        } else {
          initialMessage = `Olá! Gostaria de falar com o responsável pelo marketing ou vendas da ${companyName}.\n\nVi a página de vocês nas redes sociais (${lead.website}), mas notei que a empresa ainda não possui um site oficial estruturado na web. Desenvolvemos sites profissionais e otimizados para o seu segmento.\n\nCom quem eu poderia conversar para apresentar uma proposta rápida de posicionamento digital para vocês?`;
        }
      } else {
        // Redesign de Site (Tem site real cadastrado)
        if (lead.decisionMaker && lead.decisionMaker.trim() !== '') {
          initialMessage = `Olá ${lead.decisionMaker}, tudo bem? Vi que você está à frente da ${companyName}.\n\nEstava analisando o site de vocês (${lead.website}) e notei algumas ótimas oportunidades para modernizar o visual, deixá-lo mais rápido no celular e otimizar para receber mais contatos.\n\nTrabalhamos com o redesign completo e otimização de páginas de vendas. Teria 5 minutos para eu te mostrar alguns exemplos de projetos de alta conversão que criamos recentemente?`;
        } else {
          initialMessage = `Olá! Gostaria de falar com o responsável pelo site ou marketing da ${companyName}.\n\nEstava navegando no site oficial de vocês (${lead.website}) e identifiquei alguns pontos de melhoria no design e no carregamento mobile que podem estar fazendo vocês perderem clientes para a concorrência.\n\nPoderia me indicar o contato da pessoa responsável para eu apresentar uma proposta rápida de redesign sem compromisso?`;
        }
      }
    }

    setMessage(initialMessage);
    setCopied(false);
  }, [lead, activeService]);

  if (!isOpen || !lead) return null;

  const cleanPhone = lead.phone.replace(/\D/g, '');
  const encodedText = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedText}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenWhatsApp = () => {
    window.open(whatsappUrl, '_blank');

    if (autoUpdateStatus && lead.status === 'NEW' && onStatusUpdated) {
      onStatusUpdated(lead.id, 'CONTACTED');
    }
  };

  const hasRealWebsite = getWebsiteType(lead.website) === 'website';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#0f172a] border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/40">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                Proposta Comercial (WhatsApp)
              </h3>
              <p className="text-[11px] text-slate-400">
                Destinatário: <span className="text-slate-200 font-medium">{lead.name}</span> ({lead.phone})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="bg-slate-950/40 border-b border-slate-800 p-2.5 flex items-center justify-between gap-2">
          <div className="flex items-center bg-slate-900 p-0.5 rounded-xl border border-slate-800 flex-1">
            <button
              onClick={() => setActiveService('viggo')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
                activeService === 'viggo'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <CalendarCheck className="w-3.5 h-3.5" />
              <span>Oferecer Viggo (Ponto)</span>
            </button>
            <button
              onClick={() => setActiveService('website')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
                activeService === 'website'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{hasRealWebsite ? 'Redesign de Site' : 'Criar Site'}</span>
            </button>
          </div>

          <div className="flex-shrink-0">
            {(() => {
              const webType = getWebsiteType(lead.website);
              if (webType === 'website') {
                return (
                  <span className="text-[10px] bg-indigo-500/10 text-indigo-300 px-2.5 py-1.5 rounded-xl font-bold border border-indigo-500/20">
                    Tem Site (Sugerido Viggo)
                  </span>
                );
              }
              if (webType === 'social') {
                return (
                  <span className="text-[10px] bg-amber-500/10 text-amber-300 px-2.5 py-1.5 rounded-xl font-bold border border-amber-500/20">
                    Rede Social (Sugerido Criar)
                  </span>
                );
              }
              return (
                <span className="text-[10px] bg-rose-500/10 text-rose-300 px-2.5 py-1.5 rounded-xl font-bold border border-rose-500/20">
                  Sem Site (Sugerido Criar)
                </span>
              );
            })()}
          </div>
        </div>

        {/* Body Content */}
        <div className="p-5 space-y-4 flex-1 overflow-y-auto">
          {/* Target Info Pill */}
          <div className="grid grid-cols-2 gap-2 text-xs bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
            <div className="flex items-center space-x-1.5 text-slate-300">
              <Building className="w-3.5 h-3.5 text-slate-500" />
              <span className="truncate">{lead.companyName || lead.name}</span>
            </div>
            <div className="flex items-center space-x-1.5 text-slate-300">
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span className="truncate">
                {lead.decisionMaker ? (
                  <strong className="text-emerald-400 font-semibold">{lead.decisionMaker}</strong>
                ) : (
                  <span className="text-slate-400 italic">Responsável Geral</span>
                )}
              </span>
            </div>
          </div>

          {/* Editable Textarea */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Texto da Mensagem (Personalizável)</span>
              <button
                type="button"
                onClick={handleCopy}
                className="text-[11px] text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copiado!' : 'Copiar Texto'}
              </button>
            </label>
            <textarea
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-3 bg-slate-900 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all font-sans leading-relaxed"
            />
          </div>

          {/* WhatsApp Preview Bubble */}
          <div className="bg-[#0b141a] p-3 rounded-xl border border-slate-800/80 relative">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-2">
              Preview no WhatsApp:
            </span>
            <div className="bg-[#005c4b] text-white p-3 rounded-2xl rounded-tr-sm text-xs leading-relaxed max-w-[90%] ml-auto shadow-md relative">
              <p className="whitespace-pre-wrap">{message}</p>
              <div className="flex items-center justify-end space-x-1 text-[10px] text-emerald-200/70 mt-1.5">
                <span>Agora</span>
                <span>✓✓</span>
              </div>
            </div>
          </div>

          {/* Auto status update checkbox */}
          <label className="flex items-center space-x-2 cursor-pointer text-xs text-slate-300">
            <input
              type="checkbox"
              checked={autoUpdateStatus}
              onChange={(e) => setAutoUpdateStatus(e.target.checked)}
              className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-emerald-600 focus:ring-emerald-500"
            />
            <span>Mudar status automaticamente para <strong>"Contatado"</strong> ao disparar</span>
          </label>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-900/60 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
          >
            Cancelar
          </button>

          <div className="flex space-x-2">
            <button
              type="button"
              onClick={handleCopy}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all flex items-center space-x-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado' : 'Copiar'}</span>
            </button>

            <button
              type="button"
              onClick={handleOpenWhatsApp}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition-all flex items-center space-x-1.5 active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Abrir WhatsApp (1-Click)</span>
              <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
