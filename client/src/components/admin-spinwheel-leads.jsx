import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { Gift, Download, RefreshCw, Eye, Search, X } from 'lucide-react';

export default function AdminSpinWheelLeads() {
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState({ total: 0, redeemed: 0, byOffer: [] });
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [offerFilter, setOfferFilter] = useState('');
  const [selectedLead, setSelectedLead] = useState(null);
  const [editStatus, setEditStatus] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.fetchSpinWheelLeads({
        search,
        status: statusFilter,
        offerId: offerFilter,
      });
      if (res.success && res.data) {
        setLeads(res.data.leads || []);
        if (res.data.stats) setStats(res.data.stats);
        if (res.data.offers) setOffers(res.data.offers);
      }
    } catch (err) {
      console.error('Error fetching spin wheel leads:', err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, offerFilter]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleExport = async () => {
    try {
      setExporting(true);
      const blob = await api.downloadSpinWheelLeadsExcel({
        search,
        status: statusFilter,
        offerId: offerFilter,
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const dateStr = new Date().toISOString().slice(0, 10);
      a.download = `spin_wheel_leads_${dateStr}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading excel export:', err);
      alert('Failed to export Excel file. Please ensure exceljs is installed on the server.');
    } finally {
      setExporting(false);
    }
  };

  const openLeadModal = (lead) => {
    setSelectedLead(lead);
    setEditStatus(lead.status || 'ISSUED');
    setEditNotes(lead.notes || '');
    setFeedbackMsg(null);
  };

  const handleSaveLead = async () => {
    if (!selectedLead) return;
    try {
      setSaving(true);
      setFeedbackMsg(null);
      const res = await api.updateSpinWheelLead(selectedLead._id, {
        status: editStatus,
        notes: editNotes,
      });
      if (res.success && res.data) {
        setSelectedLead(res.data);
        setLeads((prev) => prev.map((l) => (l._id === res.data._id ? res.data : l)));
        setFeedbackMsg({ type: 'success', text: 'Lead updated successfully' });
        setTimeout(() => setFeedbackMsg(null), 3000);
      }
    } catch (err) {
      console.error('Error updating spin wheel lead:', err);
      setFeedbackMsg({ type: 'error', text: err?.message || 'Failed to update lead' });
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'REDEEMED':
        return (
          <span className="inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-[#04B8BB]/10 text-[#04B8BB] border border-[#04B8BB]/30">
            Redeemed
          </span>
        );
      case 'CONTACTED':
        return (
          <span className="inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
            Contacted
          </span>
        );
      case 'ISSUED':
      default:
        return (
          <span className="inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Issued
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="font-display text-2xl font-semibold text-[#F1F1F1] uppercase flex items-center gap-3">
          <Gift size={24} className="text-[#04B8BB]" /> Spin Wheel Leads
        </h2>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchLeads}
            disabled={loading}
            className="px-3 py-2 bg-[#0A0A0A] border border-[#242424] text-xs font-semibold uppercase tracking-wider text-[#A3A3A3] hover:text-white hover:border-[#04B8BB] transition-colors flex items-center gap-2"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="px-4 py-2 bg-[#04B8BB] hover:bg-[#039da0] text-[#0A0A0A] text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Download size={14} /> {exporting ? 'Exporting...' : 'Export to Excel'}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="border border-[#242424] bg-[#0A0A0A] p-4">
          <div className="text-[10px] uppercase tracking-wider text-[#A3A3A3]">Total Leads</div>
          <div className="text-2xl font-bold text-[#F1F1F1] mt-1">{stats.total || 0}</div>
        </div>
        <div className="border border-[#242424] bg-[#0A0A0A] p-4">
          <div className="text-[10px] uppercase tracking-wider text-[#A3A3A3]">Redeemed Coupons</div>
          <div className="text-2xl font-bold text-[#04B8BB] mt-1">{stats.redeemed || 0}</div>
        </div>
        <div className="border border-[#242424] bg-[#0A0A0A] p-4 col-span-2">
          <div className="text-[10px] uppercase tracking-wider text-[#A3A3A3] mb-2">Rewards Claimed</div>
          <div className="flex flex-wrap gap-2">
            {stats.byOffer && stats.byOffer.length > 0 ? (
              stats.byOffer.map((item) => (
                <span
                  key={item._id}
                  className="px-2 py-1 bg-white/[0.03] border border-[#242424] text-[11px] text-[#F1F1F1] rounded"
                >
                  <span className="text-[#A3A3A3]">{item.label || item._id}:</span>{' '}
                  <strong className="text-[#04B8BB]">{item.count}</strong>
                </span>
              ))
            ) : (
              <span className="text-xs text-[#666]">No reward breakdown available</span>
            )}
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="border border-[#242424] bg-[#0A0A0A] p-4 flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A3A3A3]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, or coupon..."
            className="w-full pl-9 pr-3 py-2 bg-black/40 border border-[#242424] text-xs text-white placeholder-[#666] focus:outline-none focus:border-[#04B8BB]"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-black/40 border border-[#242424] text-xs text-white px-3 py-2 focus:outline-none focus:border-[#04B8BB]"
        >
          <option value="">All Statuses</option>
          <option value="ISSUED">Issued</option>
          <option value="CONTACTED">Contacted</option>
          <option value="REDEEMED">Redeemed</option>
        </select>
        <select
          value={offerFilter}
          onChange={(e) => setOfferFilter(e.target.value)}
          className="bg-black/40 border border-[#242424] text-xs text-white px-3 py-2 focus:outline-none focus:border-[#04B8BB]"
        >
          <option value="">All Rewards</option>
          {offers.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* Leads Table */}
      <div className="border border-[#242424] bg-[#0A0A0A] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#242424] text-xs uppercase tracking-wider text-[#A3A3A3] bg-black/30">
                <th className="py-4 px-6 font-semibold">Name / Date</th>
                <th className="py-4 px-6 font-semibold">Phone</th>
                <th className="py-4 px-6 font-semibold">Reward Won</th>
                <th className="py-4 px-6 font-semibold">Coupon Code</th>
                <th className="py-4 px-6 font-semibold">Visit Date</th>
                <th className="py-4 px-6 font-semibold">Valid Till</th>
                <th className="py-4 px-6 font-semibold">Status</th>
                <th className="py-4 px-6 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-10 text-center text-[#A3A3A3] animate-pulse">
                    Loading Spin Wheel Leads...
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-10 text-center text-[#A3A3A3]">
                    No spin wheel leads found matching criteria.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-semibold text-[#F1F1F1]">{lead.name}</div>
                      <div className="text-[10px] text-[#A3A3A3] mt-0.5">
                        {new Date(lead.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                      </div>
                    </td>
                    <td className="py-4 px-6 font-mono text-[#b5b1a7]">{lead.phone}</td>
                    <td className="py-4 px-6 text-[#F1F1F1] font-medium">{lead.offerLabel}</td>
                    <td className="py-4 px-6">
                      <span className="font-mono text-xs font-bold text-[#04B8BB] bg-[#04B8BB]/10 px-2 py-1 rounded border border-[#04B8BB]/20">
                        {lead.couponCode}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-[#F1F1F1]">{lead.preferredDate}</td>
                    <td className="py-4 px-6 text-xs text-[#A3A3A3]">
                      {new Date(lead.couponExpiresAt).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}
                    </td>
                    <td className="py-4 px-6">{getStatusBadge(lead.status)}</td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => openLeadModal(lead)}
                        className="text-xs font-bold uppercase tracking-wider text-[#04B8BB] hover:text-white inline-flex items-center gap-1 transition-colors"
                      >
                        <Eye size={14} /> View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View & Edit Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-[#0A0A0A] border border-[#242424] p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedLead(null)}
              className="absolute right-4 top-4 text-[#A3A3A3] hover:text-white"
            >
              <X size={18} />
            </button>
            <h2 className="font-display text-2xl tracking-wider text-white mb-6 border-b border-[#242424] pb-4 flex items-center gap-2">
              <Gift size={20} className="text-[#04B8BB]" /> Lead: {selectedLead.name}
            </h2>

            <div className="space-y-4 text-sm text-[#A3A3A3]">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-[#666]">Phone</div>
                  <div className="text-white font-mono mt-0.5">{selectedLead.phone}</div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-[#666]">Preferred Visit Date</div>
                  <div className="text-white mt-0.5">{selectedLead.preferredDate}</div>
                </div>
              </div>

              <div className="h-px bg-[#242424] my-2" />

              <div>
                <div className="text-[11px] uppercase tracking-wider text-[#666]">Reward Won</div>
                <div className="text-[#04B8BB] font-semibold text-base mt-0.5">{selectedLead.offerLabel}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-[#666]">Coupon Code</div>
                  <div className="text-white font-mono font-bold text-sm mt-0.5">{selectedLead.couponCode}</div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-[#666]">Coupon Valid Till</div>
                  <div className="text-white text-xs mt-0.5">
                    {new Date(selectedLead.couponExpiresAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                  </div>
                </div>
              </div>

              <div className="h-px bg-[#242424] my-2" />

              {/* Status Selector */}
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#666] mb-1.5 font-semibold">
                  Update Lead Status
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full bg-[#141416] border border-[#242424] text-white p-2.5 text-xs focus:outline-none focus:border-[#04B8BB]"
                >
                  <option value="ISSUED">Issued (Not yet redeemed)</option>
                  <option value="CONTACTED">Contacted (Spoken on WhatsApp/call)</option>
                  <option value="REDEEMED">Redeemed (Claimed at front desk)</option>
                </select>
              </div>

              {/* Notes TextArea */}
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#666] mb-1.5 font-semibold">
                  Internal Staff Notes
                </label>
                <textarea
                  rows={3}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="e.g. Visited desk on Monday, redeemed free tour voucher..."
                  className="w-full bg-[#141416] border border-[#242424] text-white p-2.5 text-xs focus:outline-none focus:border-[#04B8BB]"
                />
              </div>

              {selectedLead.redeemedAt && (
                <div className="text-xs text-[#04B8BB]">
                  Redeemed on:{' '}
                  {new Date(selectedLead.redeemedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                </div>
              )}

              {feedbackMsg && (
                <div
                  className={`p-2.5 text-xs rounded border ${
                    feedbackMsg.type === 'success'
                      ? 'bg-[#04B8BB]/10 text-[#04B8BB] border-[#04B8BB]/30'
                      : 'bg-red-500/10 text-red-400 border-red-500/30'
                  }`}
                >
                  {feedbackMsg.text}
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t border-[#242424] pt-4">
              <button
                type="button"
                onClick={() => setSelectedLead(null)}
                className="px-4 py-2 border border-[#242424] text-xs font-semibold uppercase tracking-wider text-[#A3A3A3] hover:text-white hover:border-[#666] transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleSaveLead}
                disabled={saving}
                className="px-5 py-2 bg-[#04B8BB] hover:bg-[#039da0] text-[#0A0A0A] text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
