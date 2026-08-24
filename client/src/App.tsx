import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { StatsOverview } from './components/StatsOverview';
import { QuickScrapeBar } from './components/QuickScrapeBar';
import { LeadsTable } from './components/LeadsTable';
import { LeadsKanban } from './components/LeadsKanban';
import { WhatsAppModal } from './components/WhatsAppModal';
import { LeadDrawer } from './components/LeadDrawer';
import { NewLeadModal } from './components/NewLeadModal';
import { SettingsModal } from './components/SettingsModal';
import { api } from './services/api';
import {
  Lead,
  LeadStatus,
  StatsResponse,
  LeadsCounts,
  Pagination,
  ConfigResponse,
  ScrapeResult
} from './types/lead';

export const App: React.FC = () => {
  // State
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [categories, setCategories] = useState<{ name: string; count: number }[]>([]);
  const [config, setConfig] = useState<ConfigResponse | null>(null);
  const [customToken, setCustomToken] = useState<string>(() => localStorage.getItem('apify_token_override') || '');

  const [loading, setLoading] = useState(true);
  const [isScraping, setIsScraping] = useState(false);

  // Filters & Pagination
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');

  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    totalCount: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false
  });

  const [counts, setCounts] = useState<LeadsCounts>({
    total: 0,
    NEW: 0,
    CONTACTED: 0,
    DEMO_SCHEDULED: 0,
    TRIAL_ACTIVE: 0,
    CONVERTED: 0,
    LOST: 0
  });

  // Modals & Drawers
  const [whatsAppModalOpen, setWhatsAppModalOpen] = useState(false);
  const [selectedWhatsAppLead, setSelectedWhatsAppLead] = useState<Lead | null>(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedDrawerLead, setSelectedDrawerLead] = useState<Lead | null>(null);

  const [newLeadModalOpen, setNewLeadModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  // Fetch leads and stats
  const fetchLeadsData = useCallback(async () => {
    setLoading(true);
    try {
      const params: {
        page: number;
        limit: number;
        search?: string;
        status?: LeadStatus;
        category?: string;
      } = {
        page,
        limit: 20,
        search: searchQuery || undefined,
        status: selectedStatus !== 'ALL' ? (selectedStatus as LeadStatus) : undefined,
        category: selectedCategory !== 'ALL' ? selectedCategory : undefined
      };

      const [leadsRes, statsRes, catRes] = await Promise.all([
        api.getLeads(params),
        api.getStats(),
        api.getCategories()
      ]);

      setLeads(leadsRes.leads);
      setPagination(leadsRes.pagination);
      setCounts(leadsRes.counts);
      setStats(statsRes);
      setCategories(catRes);
    } catch (err) {
      console.error('Erro ao carregar dados de leads:', err);
    } finally {
      setLoading(false);
    }
  }, [page, selectedStatus, selectedCategory, searchQuery]);

  // Initial config load
  useEffect(() => {
    api.getConfig().then(setConfig).catch(console.error);
  }, []);

  // Fetch when filters change
  useEffect(() => {
    fetchLeadsData();
  }, [fetchLeadsData]);

  // Handle Scraper Action
  const handleScrape = async (
    niche: string,
    city: string,
    maxResults: number
  ): Promise<ScrapeResult | null> => {
    setIsScraping(true);
    try {
      const res = await api.scrapeLeads({
        niche,
        city,
        maxResults,
        tokenOverride: customToken || undefined
      });

      if (res.success) {
        await fetchLeadsData();
        return res.data;
      }
      return null;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao executar scraper.';
      console.error('Erro no scraper:', msg);
      alert(msg);
      return null;
    } finally {
      setIsScraping(false);
    }
  };

  // Status Change
  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    // Otimistic update
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
    );

    try {
      await api.updateStatus(leadId, newStatus);
      // Refresh stats in background
      api.getStats().then(setStats).catch(console.error);
    } catch (err) {
      console.error('Erro ao alterar status:', err);
      fetchLeadsData(); // rollback
    }
  };

  // Lead Updated in Drawer
  const handleLeadUpdated = (updatedLead: Lead) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === updatedLead.id ? updatedLead : l))
    );
    if (selectedDrawerLead?.id === updatedLead.id) {
      setSelectedDrawerLead(updatedLead);
    }
    api.getStats().then(setStats).catch(console.error);
  };

  // Delete Lead
  const handleDeleteLead = async (leadId: string) => {
    if (!window.confirm('Tem certeza que deseja remover este lead?')) return;

    try {
      await api.deleteLead(leadId);
      setLeads((prev) => prev.filter((l) => l.id !== leadId));
      fetchLeadsData();
    } catch (err) {
      console.error('Erro ao excluir:', err);
    }
  };

  // Open WhatsApp Action
  const handleOpenWhatsApp = (lead: Lead) => {
    setSelectedWhatsAppLead(lead);
    setWhatsAppModalOpen(true);
  };

  // Open Details Drawer
  const handleOpenDrawer = (lead: Lead) => {
    setSelectedDrawerLead(lead);
    setDrawerOpen(true);
  };

  // Save Token in Settings
  const handleSaveToken = (token: string) => {
    setCustomToken(token);
    localStorage.setItem('apify_token_override', token);
    api.getConfig().then(setConfig).catch(console.error);
  };

  // Export CSV
  const handleExportCSV = () => {
    if (leads.length === 0) return;

    const headers = [
      'ID',
      'Nome Fantasia',
      'Razão Social',
      'CNPJ',
      'Telefone',
      'Categoria',
      'Decisor (QSA)',
      'Status',
      'Cidade',
      'Endereço',
      'Website',
      'Origem'
    ];

    const rows = leads.map((l) => [
      `"${l.id}"`,
      `"${(l.name || '').replace(/"/g, '""')}"`,
      `"${(l.companyName || '').replace(/"/g, '""')}"`,
      `"${l.cnpj || ''}"`,
      `"${l.phone}"`,
      `"${(l.category || '').replace(/"/g, '""')}"`,
      `"${(l.decisionMaker || '').replace(/"/g, '""')}"`,
      `"${l.status}"`,
      `"${(l.city || '').replace(/"/g, '""')}"`,
      `"${(l.address || '').replace(/"/g, '""')}"`,
      `"${l.website || ''}"`,
      `"${l.source}"`
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(';'), ...rows.map((e) => e.join(';'))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `viggo-leads-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <Navbar
        onOpenNewLead={() => setNewLeadModalOpen(true)}
        onExportCSV={handleExportCSV}
        totalLeads={counts.total}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* KPI Metrics */}
        <StatsOverview
          stats={stats}
          loading={loading}
          onFilterByStatus={(status) => {
            setSelectedStatus(status);
            setPage(1);
          }}
        />

        {/* Quick Scrape Action Bar */}
        <QuickScrapeBar
          onScrape={handleScrape}
          isScraping={isScraping}
          apifyConfigured={Boolean(config?.apifyConfigured || customToken)}
          onOpenSettings={() => setSettingsModalOpen(true)}
        />

        {/* Leads Table or Kanban */}
        {viewMode === 'table' ? (
          <LeadsTable
            leads={leads}
            pagination={pagination}
            counts={counts}
            categories={categories}
            loading={loading}
            selectedStatus={selectedStatus}
            selectedCategory={selectedCategory}
            searchQuery={searchQuery}
            viewMode={viewMode}
            onStatusChange={handleStatusChange}
            onFilterStatus={(st) => {
              setSelectedStatus(st);
              setPage(1);
            }}
            onFilterCategory={(cat) => {
              setSelectedCategory(cat);
              setPage(1);
            }}
            onSearch={(q) => {
              setSearchQuery(q);
              setPage(1);
            }}
            onPageChange={setPage}
            onToggleViewMode={setViewMode}
            onOpenWhatsApp={handleOpenWhatsApp}
            onOpenDrawer={handleOpenDrawer}
            onDeleteLead={handleDeleteLead}
          />
        ) : (
          <LeadsKanban
            leads={leads}
            onStatusChange={handleStatusChange}
            onOpenWhatsApp={handleOpenWhatsApp}
            onOpenDrawer={handleOpenDrawer}
          />
        )}
      </main>

      {/* Modals & Drawers */}
      <WhatsAppModal
        isOpen={whatsAppModalOpen}
        lead={selectedWhatsAppLead}
        onClose={() => {
          setWhatsAppModalOpen(false);
          setSelectedWhatsAppLead(null);
        }}
        onStatusUpdated={(id, newSt) => {
          handleStatusChange(id, newSt as LeadStatus);
        }}
      />

      <LeadDrawer
        isOpen={drawerOpen}
        lead={selectedDrawerLead}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedDrawerLead(null);
        }}
        onLeadUpdated={handleLeadUpdated}
        onOpenWhatsApp={handleOpenWhatsApp}
      />

      <NewLeadModal
        isOpen={newLeadModalOpen}
        onClose={() => setNewLeadModalOpen(false)}
        onLeadCreated={(newLead) => {
          fetchLeadsData();
        }}
      />

      <SettingsModal
        isOpen={settingsModalOpen}
        config={config}
        customToken={customToken}
        onClose={() => setSettingsModalOpen(false)}
        onSaveToken={handleSaveToken}
      />
    </div>
  );
};

export default App;
