import React, { useState } from 'react';
import { X, Key, Shield, Database, ExternalLink, Save, CheckCircle2, Info } from 'lucide-react';
import { ConfigResponse } from '../types/lead';

interface SettingsModalProps {
  isOpen: boolean;
  config: ConfigResponse | null;
  onClose: () => void;
  onSaveToken: (token: string) => void;
  customToken: string;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  config,
  onClose,
  onSaveToken,
  customToken
}) => {
  const [tokenInput, setTokenInput] = useState(customToken);
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveToken(tokenInput.trim());
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#0f172a] border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Configurações de Integração</h3>
              <p className="text-[11px] text-slate-400">Apify Scraper, BrasilAPI e Banco Neon</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="p-5 space-y-4 text-xs">
          {/* Apify Token Section */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-200 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-emerald-400" /> Token Pessoal do Apify (APIFY_TOKEN)
              </label>
              <a
                href="https://console.apify.com/account/integrations"
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>Obter Token no Apify</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>

            <p className="text-slate-400 leading-relaxed text-[11px]">
              Insira seu token da Apify para realizar a prospecção e extração em tempo real no Google Maps utilizando o actor{' '}
              <code className="text-emerald-300 bg-slate-800 px-1 py-0.5 rounded">
                compass/crawler-google-places
              </code>
              .
            </p>

            <input
              type="password"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="apify_api_..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
            />

            {config?.apifyConfigured && (
              <div className="flex items-center space-x-1.5 text-emerald-400 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Token configurado no arquivo .env do servidor ({config.apifyTokenMasked})</span>
              </div>
            )}
          </div>

          {/* Service Architecture Status */}
          <div className="space-y-2 text-slate-300 text-[11px]">
            <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[10px] flex items-center gap-1">
              <Info className="w-3 h-3 text-indigo-400" /> Arquitetura do Módulo
            </h4>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                <span className="text-slate-500 text-[10px] block">Banco de Dados</span>
                <span className="font-semibold text-indigo-300 flex items-center gap-1 mt-0.5">
                  <Database className="w-3 h-3" /> Neon PostgreSQL
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                <span className="text-slate-500 text-[10px] block">Enriquecimento QSA</span>
                <span className="font-semibold text-emerald-300 flex items-center gap-1 mt-0.5">
                  <Shield className="w-3 h-3" /> BrasilAPI v1
                </span>
              </div>
            </div>
          </div>

          {saved && (
            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4" />
              <span>Configuração salva com sucesso!</span>
            </div>
          )}

          {/* Footer */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
            >
              Fechar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 flex items-center space-x-1.5 transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Salvar Preferências</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
