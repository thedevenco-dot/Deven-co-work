import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Save, Plus, Trash2, CheckCircle2 } from 'lucide-react';

export default function AdminCalculatorConfig() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await api.fetchAdminCalculatorConfig();
      if (res.success) setConfig(res.data);
    } catch (err) {
      setMessage('Error loading config: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      await api.updateCalculatorConfig(config);
      setMessage('Configuration saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Error saving config: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => setConfig({ ...config, [field]: value });

  if (loading) return <div className="p-10 text-[#A3A3A3]">Loading Calculator Config...</div>;
  if (!config) return <div className="p-10 text-red-500">Failed to load configuration.</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-display text-2xl font-semibold text-[#F1F1F1] uppercase">Calculator Management</h2>
        <button onClick={handleSave} disabled={saving} className="button button-primary button-small gap-2">
          <Save size={14} /> {saving ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>

      {message && (
        <div className="bg-[#DF9716]/10 text-[#DF9716] border border-[#DF9716]/20 p-3 flex items-center gap-2">
          <CheckCircle2 size={16} /> {message}
        </div>
      )}

      {/* Main Settings */}
      <div className="border border-[#242424] bg-[#0A0A0A] p-6 space-y-4">
        <h3 className="font-semibold text-[#DF9716] border-b border-[#242424] pb-2">Main Content</h3>
        <label className="flex items-center gap-2 cursor-pointer mb-4">
          <input type="checkbox" checked={config.active} onChange={e => handleChange('active', e.target.checked)} />
          <span className="text-sm">Calculator Section Active</span>
        </label>
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block text-sm">
            <span className="text-[#A3A3A3] block mb-1">Section Eyebrow</span>
            <input type="text" className="w-full bg-[#111] border border-[#333] p-2" value={config.sectionEyebrow} onChange={e => handleChange('sectionEyebrow', e.target.value)} />
          </label>
          <label className="block text-sm">
            <span className="text-[#A3A3A3] block mb-1">Main Heading</span>
            <input type="text" className="w-full bg-[#111] border border-[#333] p-2" value={config.mainHeading} onChange={e => handleChange('mainHeading', e.target.value)} />
          </label>
        </div>
        <label className="block text-sm">
          <span className="text-[#A3A3A3] block mb-1">Description</span>
          <textarea className="w-full bg-[#111] border border-[#333] p-2 h-20" value={config.description} onChange={e => handleChange('description', e.target.value)} />
        </label>
      </div>

      {/* Team Sizes */}
      <div className="border border-[#242424] bg-[#0A0A0A] p-6 space-y-4">
        <div className="flex justify-between items-center border-b border-[#242424] pb-2">
          <h3 className="font-semibold text-[#DF9716]">Team Sizes</h3>
          <button onClick={() => {
            const newSizes = [...config.teamSizes, { label: 'New Size', minPeople: 1, maxPeople: 5, midpoint: 3, order: config.teamSizes.length }];
            handleChange('teamSizes', newSizes);
          }} className="text-xs flex items-center gap-1 text-[#A3A3A3] hover:text-white"><Plus size={12}/> Add Option</button>
        </div>
        
        {config.teamSizes.map((t, idx) => (
          <div key={idx} className="bg-[#111] border border-[#333] p-4 flex flex-col sm:flex-row gap-4 relative">
            <button onClick={() => {
              const newSizes = config.teamSizes.filter((_, i) => i !== idx);
              handleChange('teamSizes', newSizes);
            }} className="absolute top-2 right-2 text-red-500 hover:text-red-400"><Trash2 size={14}/></button>
            <div className="flex-1 space-y-3">
              <div className="flex gap-2">
                <input type="text" placeholder="Label (e.g. 1-5)" className="flex-1 bg-black border border-[#333] p-2 text-xs" value={t.label} onChange={e => {
                  const arr = [...config.teamSizes]; arr[idx].label = e.target.value; handleChange('teamSizes', arr);
                }} />
                <input type="text" placeholder="Description" className="flex-1 bg-black border border-[#333] p-2 text-xs" value={t.description} onChange={e => {
                  const arr = [...config.teamSizes]; arr[idx].description = e.target.value; handleChange('teamSizes', arr);
                }} />
              </div>
              <div className="flex gap-2 text-xs items-center text-[#A3A3A3]">
                Min <input type="number" className="w-16 bg-black border border-[#333] p-1" value={t.minPeople} onChange={e => {
                  const arr = [...config.teamSizes]; arr[idx].minPeople = Number(e.target.value); handleChange('teamSizes', arr);
                }} />
                Max <input type="number" className="w-16 bg-black border border-[#333] p-1" value={t.maxPeople} onChange={e => {
                  const arr = [...config.teamSizes]; arr[idx].maxPeople = Number(e.target.value); handleChange('teamSizes', arr);
                }} />
                Mid <input type="number" className="w-16 bg-black border border-[#333] p-1" value={t.midpoint} onChange={e => {
                  const arr = [...config.teamSizes]; arr[idx].midpoint = Number(e.target.value); handleChange('teamSizes', arr);
                }} />
              </div>
              <div className="flex gap-2 text-xs items-center text-[#A3A3A3]">
                Move-in Time <input type="text" className="w-48 bg-black border border-[#333] p-1" value={t.estimatedMoveInTime} onChange={e => {
                  const arr = [...config.teamSizes]; arr[idx].estimatedMoveInTime = e.target.value; handleChange('teamSizes', arr);
                }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Fitout Options */}
      <div className="border border-[#242424] bg-[#0A0A0A] p-6 space-y-4">
        <div className="flex justify-between items-center border-b border-[#242424] pb-2">
          <h3 className="font-semibold text-[#DF9716]">Fitout Tiers & Per-Person Costs</h3>
          <button onClick={() => {
            const newTiers = [...config.fitoutTiers, { name: 'New Tier', securityDepositPerPerson: 0, order: config.fitoutTiers.length }];
            handleChange('fitoutTiers', newTiers);
          }} className="text-xs flex items-center gap-1 text-[#A3A3A3] hover:text-white"><Plus size={12}/> Add Tier</button>
        </div>

        {config.fitoutTiers.map((f, idx) => (
          <div key={idx} className="bg-[#111] border border-[#333] p-4 flex flex-col gap-4 relative">
            <button onClick={() => {
              const newTiers = config.fitoutTiers.filter((_, i) => i !== idx);
              handleChange('fitoutTiers', newTiers);
            }} className="absolute top-2 right-2 text-red-500 hover:text-red-400"><Trash2 size={14}/></button>
            <div className="flex gap-2">
              <input type="text" placeholder="Tier Name (e.g. Basic)" className="w-1/3 bg-black border border-[#333] p-2 text-xs font-bold text-white" value={f.name} onChange={e => {
                const arr = [...config.fitoutTiers]; arr[idx].name = e.target.value; handleChange('fitoutTiers', arr);
              }} />
              <input type="text" placeholder="Description" className="flex-1 bg-black border border-[#333] p-2 text-xs" value={f.description} onChange={e => {
                const arr = [...config.fitoutTiers]; arr[idx].description = e.target.value; handleChange('fitoutTiers', arr);
              }} />
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              {[
                {k: 'securityDepositPerPerson', l: 'Security Dep'},
                {k: 'brokerCommissionPerPerson', l: 'Broker Comm'},
                {k: 'legalStampDutyPerPerson', l: 'Legal / Stamp'},
                {k: 'interiorFitoutPerPerson', l: 'Fitout'},
                {k: 'furniturePerPerson', l: 'Furniture'},
                {k: 'acFansLightingPerPerson', l: 'AC / Light'},
                {k: 'wifiPrinterEquipmentPerPerson', l: 'Equipment'},
                {k: 'securitySystemPerPerson', l: 'Security'},
                {k: 'govtApprovalsLicensesPerPerson', l: 'Govt Appr'}
              ].map(field => (
                <label key={field.k} className="flex flex-col text-[#A3A3A3]">
                  {field.l}
                  <input type="number" className="bg-black border border-[#333] p-1 mt-1 text-white" value={f[field.k]} onChange={e => {
                    const arr = [...config.fitoutTiers]; arr[idx][field.k] = Number(e.target.value); handleChange('fitoutTiers', arr);
                  }} />
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Assumptions */}
      <div className="border border-[#242424] bg-[#0A0A0A] p-6 space-y-4">
        <h3 className="font-semibold text-[#DF9716] border-b border-[#242424] pb-2">Global Cost Assumptions</h3>
        <div className="grid sm:grid-cols-2 gap-4 text-sm text-[#A3A3A3]">
          <label className="block">
            Rent Per Person / Month (Office)
            <input type="number" className="w-full bg-[#111] border border-[#333] p-2 mt-1 text-white" value={config.rentPerPersonMonth} onChange={e => handleChange('rentPerPersonMonth', Number(e.target.value))} />
          </label>
          <label className="block">
            Maintenance Per Person / Month (Office)
            <input type="number" className="w-full bg-[#111] border border-[#333] p-2 mt-1 text-white" value={config.maintenanceAdminPerPersonMonth} onChange={e => handleChange('maintenanceAdminPerPersonMonth', Number(e.target.value))} />
          </label>
          <label className="block">
            Deven Manual Price Per Seat / Month
            <input type="number" className="w-full bg-[#111] border border-[#333] p-2 mt-1 text-white" value={config.devenManualPricePerSeatMonth} onChange={e => handleChange('devenManualPricePerSeatMonth', Number(e.target.value))} />
          </label>
        </div>
      </div>

    </div>
  );
}

