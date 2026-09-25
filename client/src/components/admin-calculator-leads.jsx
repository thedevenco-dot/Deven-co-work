import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Users, Eye } from 'lucide-react';

export default function AdminCalculatorLeads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState(null);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const res = await api.fetchCalculatorLeads();
      if (res.success) setLeads(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);

  if (loading) return <div className="p-10 text-[#A3A3A3] animate-pulse">Loading Leads...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-display text-2xl font-semibold text-[#F1F1F1] uppercase flex items-center gap-3">
          <Users size={24} className="text-[#04B8BB]" /> Calculator Leads
        </h2>
      </div>

      <div className="border border-[#242424] bg-[#0A0A0A] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#242424] text-xs uppercase tracking-wider text-[#A3A3A3] bg-black/30">
                <th className="py-4 px-6 font-semibold">Name / Date</th>
                <th className="py-4 px-6 font-semibold">Contact</th>
                <th className="py-4 px-6 font-semibold">Team Size</th>
                <th className="py-4 px-6 font-semibold">Fitout</th>
                <th className="py-4 px-6 font-semibold">Est. Savings</th>
                <th className="py-4 px-6 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {leads.length === 0 ? (
                <tr><td colSpan="6" className="py-10 text-center text-[#A3A3A3]">No calculator leads yet.</td></tr>
              ) : (
                leads.map(lead => (
                  <tr key={lead._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-semibold text-[#F1F1F1]">{lead.name}</div>
                      <div className="text-[10px] text-[#A3A3A3] mt-0.5">{new Date(lead.createdAt).toLocaleString()}</div>
                      {lead.companyProjectName && <div className="text-xs text-[#04B8BB] mt-1">{lead.companyProjectName}</div>}
                    </td>
                    <td className="py-4 px-6 text-[#b5b1a7]">
                      <div>{lead.phone}</div>
                      <div className="text-xs text-[#A3A3A3]">{lead.email}</div>
                    </td>
                    <td className="py-4 px-6 text-[#F1F1F1] font-medium">{lead.teamSizeLabel}</td>
                    <td className="py-4 px-6 text-[#F1F1F1]">{lead.fitoutTier}</td>
                    <td className="py-4 px-6 text-[#04B8BB] font-bold">{formatCurrency(lead.estimatedSavings)}</td>
                    <td className="py-4 px-6 text-right">
                      <button onClick={() => setSelectedLead(lead)} className="text-xs font-bold uppercase tracking-wider text-[#04B8BB] hover:text-white flex items-center justify-end gap-1 w-full">
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

      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-[#0A0A0A] border border-[#242424] p-6 relative">
            <button onClick={() => setSelectedLead(null)} className="absolute right-4 top-4 text-[#A3A3A3] hover:text-white">âœ•</button>
            <h2 className="font-display text-2xl tracking-wider text-white mb-6 border-b border-[#242424] pb-4">
              Lead: {selectedLead.name}
            </h2>
            <div className="space-y-4 text-sm text-[#A3A3A3]">
              <p><strong>Phone:</strong> <span className="text-white">{selectedLead.phone}</span></p>
              <p><strong>Email:</strong> <span className="text-white">{selectedLead.email}</span></p>
              <p><strong>Company:</strong> <span className="text-white">{selectedLead.companyProjectName || '-'}</span></p>
              <div className="h-px bg-[#242424] my-2" />
              <p><strong>Team Size:</strong> <span className="text-white">{selectedLead.teamSizeLabel} ({selectedLead.teamSizeMin}-{selectedLead.teamSizeMax} people)</span></p>
              <p><strong>Fitout Tier:</strong> <span className="text-white">{selectedLead.fitoutTier} - {selectedLead.fitoutLabel}</span></p>
              <div className="h-px bg-[#242424] my-2" />
              <p><strong>Private Office Year 1:</strong> <span className="text-[#ef4444] font-bold">{formatCurrency(selectedLead.estimatedOfficeYear1Cost)}</span></p>
              <p><strong>Deven Year 1:</strong> <span className="text-[#04B8BB] font-bold">{formatCurrency(selectedLead.estimatedDevenYear1Cost)}</span></p>
              <p><strong>Estimated Savings:</strong> <span className="text-white font-bold">{formatCurrency(selectedLead.estimatedSavings)}</span></p>
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={() => setSelectedLead(null)} className="button button-primary button-small">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

