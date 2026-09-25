import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ShieldCheck, Users, Briefcase, Zap, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { trackPixelEvent } from '../lib/metaPixel';

export default function OfficeCostCalculator() {
  useEffect(() => {
    trackPixelEvent('ViewContent', { content_name: 'Calculator' });
  }, []);

  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Selections
  const [teamSize, setTeamSize] = useState('');
  const [fitout, setFitout] = useState('');

  // Form State
  const [form, setForm] = useState({ name: '', phone: '', email: '', companyProjectName: '' });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);

  // Results
  const [results, setResults] = useState(null);

  const loadConfig = () => {
    setLoading(true);
    setError(null);
    api.fetchCalculatorConfig()
      .then(res => {
        if (res.success && res.data && res.data.active) {
          setConfig(res.data);
        } else if (res.success && !res.data?.active) {
          setConfig(null);
        } else {
          setError(res.message || 'Failed to load calculator config');
        }
      })
      .catch(err => {
        setError(err.message || 'Failed to load calculator config');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadConfig();
  }, []);

  useEffect(() => {
    if (!config || !teamSize || !fitout) {
      setResults(null);
      return;
    }

    const selectedTeam = config.teamSizes.find(t => t.label === teamSize);
    const selectedFitout = config.fitoutTiers.find(f => f.name === fitout);

    if (selectedTeam && selectedFitout) {
      const people = selectedTeam.midpoint;

      const getNonZeroTierVal = (tier, ...keys) => {
        if (!tier) return 0;
        for (const k of keys) {
          const val = Number(tier[k]);
          if (!isNaN(val) && val > 0) return val;
        }
        return 0;
      };

      const securityDeposit = getNonZeroTierVal(selectedFitout, 'securityDepositPerPerson', 'securityDeposit') * people;
      const broker = getNonZeroTierVal(selectedFitout, 'brokerCommissionPerPerson', 'brokerCommission') * people;
      const legal = getNonZeroTierVal(selectedFitout, 'legalStampDutyPerPerson', 'legalStampDuty', 'legalStamp') * people;
      const fitoutCost = getNonZeroTierVal(selectedFitout, 'interiorFitoutPerPerson', 'interiorFitout', 'fitout') * people;
      const furniture = getNonZeroTierVal(selectedFitout, 'furniturePerPerson', 'furniture') * people;
      const ac = getNonZeroTierVal(selectedFitout, 'acFansLightingPerPerson', 'acFansLighting', 'acLight') * people;
      const equipment = getNonZeroTierVal(selectedFitout, 'wifiPrinterEquipmentPerPerson', 'wifiPrinterEquipment', 'equipment') * people;
      const security = getNonZeroTierVal(selectedFitout, 'securitySystemPerPerson', 'securitySystem', 'security') * people;
      const govt = getNonZeroTierVal(selectedFitout, 'govtApprovalsLicensesPerPerson', 'govtApprovalsLicenses', 'govtApproval') * people;

      const oneTimeCost = (
        securityDeposit +
        broker +
        legal +
        fitoutCost +
        furniture +
        ac +
        equipment +
        security +
        govt
      );

      const monthlyOfficeCost = (config.rentPerPersonMonth + config.maintenanceAdminPerPersonMonth) * people;
      const officeYear1Cost = oneTimeCost + (monthlyOfficeCost * 12);

      let devenPerSeatPrice = config.devenManualPricePerSeatMonth;
      if (config.devenPriceSource === 'plan' && config.devenPlanId && config.devenPlanId.price) {
        devenPerSeatPrice = config.devenPlanId.price;
      }
      const devenYear1Cost = devenPerSeatPrice * people * 12;

      setResults({
        officeYear1Cost,
        devenYear1Cost,
        savings: officeYear1Cost - devenYear1Cost,
        oneTimeCost,
        monthlyOfficeCost,
        devenMonthly: devenPerSeatPrice * people,
        moveInTimeOffice: selectedTeam.estimatedMoveInTime,
        fitoutCosts: {
          securityDeposit,
          broker,
          legal,
          fitout: fitoutCost,
          furniture,
          ac,
          equipment,
          security,
          govt
        }
      });
    }
  }, [teamSize, fitout, config]);

  const handleUnlock = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.email.trim()) {
      setFormError('Please provide Name, Phone, and Email.');
      return;
    }
    
    // Basic phone validation (rough check for Indian 10 digits)
    const phoneClean = form.phone.replace(/\D/g, '');
    if (phoneClean.length < 10) {
      setFormError('Please provide a valid 10-digit phone number.');
      return;
    }

    setFormError('');
    setFormLoading(true);

    try {
      await api.submitCalculatorLead({
        ...form,
        teamSizeLabel: teamSize,
        fitoutTier: fitout
      });
      setIsUnlocked(true);
      trackPixelEvent('Lead', { content_name: 'Calculator Lead Form' });
    } catch (err) {
      setFormError(err.message || 'Failed to unlock. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const formatINRCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  if (loading) return null;
  if (error) {
    return (
      <section className="bg-[#FCFAF9] py-16 border-b border-[rgba(12,12,12,0.08)] office-cost-calculator">
        <div className="container-wide text-center py-10">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <h3 className="text-xl font-bold text-[#0C0C0C] mb-2">Calculator Unavailable</h3>
          <p className="text-sm text-[#0C0C0C]/60 mb-4">{error}</p>
          <button 
            onClick={loadConfig} 
            className="px-5 py-2.5 bg-[#04B8BB] text-white font-medium rounded-lg hover:bg-[#024E5C] transition-colors"
          >
            Retry Loading
          </button>
        </div>
      </section>
    );
  }
  if (!config) return null;

  return (
    <section className="bg-[#FCFAF9] py-20 border-b border-[rgba(12,12,12,0.08)] office-cost-calculator">
      <div className="container-wide">
        
        {/* Header */}
        <div className="max-w-3xl mb-12">
          <div className="section-label mb-4 text-[#04B8BB] font-semibold tracking-wider text-sm">
            {config.sectionEyebrow}
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-[#0C0C0C] mb-6 tracking-tight">
            {config.mainHeading}
          </h2>
          <p className="text-lg text-[#0C0C0C]/70">
            {config.description}
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-10">
          {/* Left Column: Interactive Inputs */}
          <div className="lg:col-span-5 space-y-10">
            
            {/* Step 1: Team Size */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold flex items-center gap-2 text-[#0C0C0C]">
                <Users className="w-5 h-5 text-[#04B8BB]" />
                1. How many people need seats?
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {config.teamSizes.filter(t => t.active).sort((a,b) => a.order - b.order).map(t => (
                  <button
                    key={t._id || t.label}
                    onClick={() => setTeamSize(t.label)}
                    className={`p-4 text-left border rounded-xl transition-all duration-200 ${
                      teamSize === t.label 
                      ? 'border-[#04B8BB] bg-[#04B8BB]/5 shadow-sm ring-1 ring-[#04B8BB]' 
                      : 'border-[#0C0C0C]/10 hover:border-[#04B8BB]/40 hover:bg-[#0C0C0C]/5 bg-white'
                    }`}
                  >
                    <div className="font-bold text-lg mb-1 text-[#0C0C0C]">{t.label}</div>
                    <div className="text-sm text-[#0C0C0C]/60">{t.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Fitout Quality */}
            <AnimatePresence>
              {teamSize && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-4"
                >
                  <h3 className="text-xl font-semibold flex items-center gap-2 text-[#0C0C0C]">
                    <Briefcase className="w-5 h-5 text-[#04B8BB]" />
                    2. What quality of fit-out?
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                    {config.fitoutTiers.filter(f => f.active).sort((a,b) => a.order - b.order).map(f => (
                      <button
                        key={f._id || f.name}
                        onClick={() => setFitout(f.name)}
                        className={`p-4 text-left border rounded-xl transition-all duration-200 flex flex-col ${
                          fitout === f.name 
                          ? 'border-[#04B8BB] bg-[#04B8BB]/5 shadow-sm ring-1 ring-[#04B8BB]' 
                          : 'border-[#0C0C0C]/10 hover:border-[#04B8BB]/40 hover:bg-[#0C0C0C]/5 bg-white'
                        }`}
                      >
                        <div className="font-bold text-lg mb-1 text-[#0C0C0C]">{f.name}</div>
                        <div className="text-sm text-[#0C0C0C]/60">{f.description}</div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

          {/* Right Column: Results & Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-xl border border-[#0C0C0C]/10 sticky top-24">
              
              {!results ? (
                <div className="h-64 flex flex-col items-center justify-center text-center px-4">
                  <div className="w-16 h-16 rounded-full bg-[#04B8BB]/10 flex items-center justify-center mb-4">
                    <Zap className="w-8 h-8 text-[#04B8BB]" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-[#0C0C0C]">Select your requirements</h3>
                  <p className="text-[#0C0C0C]/60 max-w-sm">
                    Choose your team size and preferred office finish to see exactly how much capital you could save.
                  </p>
                </div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  
                  {/* Headline Savings */}
                  <div className="bg-[#024E5C] text-white rounded-xl p-6 md:p-8 mb-8 text-center relative overflow-hidden">
                    <div className="relative z-10">
                      <p className="text-[#FCFAF9]/80 text-sm md:text-base font-medium mb-2 uppercase tracking-wider">
                        {config.savingsHeading}
                      </p>
                      <h3 className="text-4xl md:text-5xl font-bold text-[#04B8BB] mb-4">
                        {formatINRCurrency(results.savings)}
                      </h3>
                      <p className="text-[#FCFAF9]/90">
                        {config.capitalSavingsMessage}
                      </p>
                    </div>
                  </div>

                  {/* Move-in Time Comparison */}
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="border border-[#0C0C0C]/10 rounded-xl p-4 bg-[#FCFAF9]">
                      <p className="text-sm text-[#0C0C0C]/60 mb-1">{config.moveInTimeLabelOffice}</p>
                      <p className="text-lg font-semibold text-[#0C0C0C]">{results.moveInTimeOffice}</p>
                    </div>
                    <div className="border border-[#04B8BB]/30 rounded-xl p-4 bg-[#04B8BB]/5">
                      <p className="text-sm text-[#04B8BB] font-medium mb-1">{config.moveInTimeLabelDeven}</p>
                      <p className="text-lg font-bold text-[#024E5C]">{config.moveInTimeDevenValue}</p>
                    </div>
                  </div>

                  {/* Lead Capture or Full Breakdown */}
                  {!isUnlocked ? (
                    <div className="border border-[#0C0C0C]/10 rounded-xl p-6 bg-[#FCFAF9]">
                      <div className="text-center mb-6">
                        <ShieldCheck className="w-10 h-10 text-[#04B8BB] mx-auto mb-3" />
                        <h4 className="text-xl font-bold mb-2 text-[#0C0C0C]">{config.formHeading}</h4>
                        <p className="text-[#0C0C0C]/60 text-sm">{config.formDescription}</p>
                      </div>

                      <form onSubmit={handleUnlock} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-1 text-[#0C0C0C]">Name <span className="text-red-500">*</span></label>
                            <input 
                              type="text" required 
                              value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                              className="w-full px-4 py-2.5 rounded-lg border border-[#0C0C0C]/20 focus:outline-none focus:border-[#04B8BB] focus:ring-1 focus:ring-[#04B8BB] bg-white text-[#0C0C0C] placeholder:text-[#0C0C0C]/40"
                              placeholder="Your full name"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1 text-[#0C0C0C]">WhatsApp / Phone <span className="text-red-500">*</span></label>
                            <input 
                              type="tel" required 
                              value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                              className="w-full px-4 py-2.5 rounded-lg border border-[#0C0C0C]/20 focus:outline-none focus:border-[#04B8BB] focus:ring-1 focus:ring-[#04B8BB] bg-white text-[#0C0C0C] placeholder:text-[#0C0C0C]/40"
                              placeholder="10-digit number"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-1 text-[#0C0C0C]">Email <span className="text-red-500">*</span></label>
                            <input 
                              type="email" required 
                              value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                              className="w-full px-4 py-2.5 rounded-lg border border-[#0C0C0C]/20 focus:outline-none focus:border-[#04B8BB] focus:ring-1 focus:ring-[#04B8BB] bg-white text-[#0C0C0C] placeholder:text-[#0C0C0C]/40"
                              placeholder="work@company.com"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1 text-[#0C0C0C]">Company / Project</label>
                            <input 
                              type="text" 
                              value={form.companyProjectName} onChange={e => setForm({...form, companyProjectName: e.target.value})}
                              className="w-full px-4 py-2.5 rounded-lg border border-[#0C0C0C]/20 focus:outline-none focus:border-[#04B8BB] focus:ring-1 focus:ring-[#04B8BB] bg-white text-[#0C0C0C] placeholder:text-[#0C0C0C]/40"
                              placeholder="Optional"
                            />
                          </div>
                        </div>

                        {formError && (
                          <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            {formError}
                          </div>
                        )}

                        <button 
                          type="submit" 
                          disabled={formLoading}
                          className="w-full py-3.5 bg-[#0C0C0C] hover:bg-[#024E5C] text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                        >
                          {formLoading ? 'Unlocking...' : config.buttonText}
                        </button>
                        <p className="text-center text-xs text-[#0C0C0C]/50 mt-4">
                          {config.privacyMessage}
                        </p>
                      </form>
                    </div>
                  ) : (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                      <h4 className="text-lg md:text-xl font-bold mb-1.5 text-[#0C0C0C]">{config.fullBreakdownHeading}</h4>
                      <p className="text-xs md:text-sm text-[#0C0C0C]/60 mb-5">{config.fullBreakdownDescription}</p>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[500px]">
                          <thead>
                            <tr className="border-b border-[#0C0C0C]/10 text-xs md:text-sm text-[#0C0C0C]/60 uppercase tracking-wider font-semibold">
                              <th className="pb-2.5 font-semibold w-1/2">Cost Component</th>
                              <th className="pb-2.5 font-semibold">Private Office</th>
                              <th className="pb-2.5 font-semibold text-[#04B8BB]">Deven Co-Work</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#0C0C0C]/5 text-xs md:text-sm text-[#0C0C0C]">
                            <tr>
                              <td className="py-1.5 md:py-2 font-medium text-[#0C0C0C]">Security Deposit</td>
                              <td className="py-1.5 md:py-2 text-[#0C0C0C]">{formatINRCurrency(results.fitoutCosts.securityDeposit)}</td>
                              <td className="py-1.5 md:py-2 text-[#04B8BB] font-semibold">{formatINRCurrency(0)}</td>
                            </tr>
                            <tr>
                              <td className="py-1.5 md:py-2 font-medium text-[#0C0C0C]">Broker Commission</td>
                              <td className="py-1.5 md:py-2 text-[#0C0C0C]">{formatINRCurrency(results.fitoutCosts.broker)}</td>
                              <td className="py-1.5 md:py-2 text-[#04B8BB] font-semibold">{formatINRCurrency(0)}</td>
                            </tr>
                            <tr>
                              <td className="py-1.5 md:py-2 font-medium text-[#0C0C0C]">Legal / Stamp</td>
                              <td className="py-1.5 md:py-2 text-[#0C0C0C]">{formatINRCurrency(results.fitoutCosts.legal)}</td>
                              <td className="py-1.5 md:py-2 text-[#04B8BB] font-semibold">{formatINRCurrency(0)}</td>
                            </tr>
                            <tr>
                              <td className="py-1.5 md:py-2 font-medium text-[#0C0C0C]">Fit-out</td>
                              <td className="py-1.5 md:py-2 text-[#0C0C0C]">{formatINRCurrency(results.fitoutCosts.fitout)}</td>
                              <td className="py-1.5 md:py-2 text-[#04B8BB] font-semibold">{formatINRCurrency(0)}</td>
                            </tr>
                            <tr>
                              <td className="py-1.5 md:py-2 font-medium text-[#0C0C0C]">Furniture</td>
                              <td className="py-1.5 md:py-2 text-[#0C0C0C]">{formatINRCurrency(results.fitoutCosts.furniture)}</td>
                              <td className="py-1.5 md:py-2 text-[#04B8BB] font-semibold">{formatINRCurrency(0)}</td>
                            </tr>
                            <tr>
                              <td className="py-1.5 md:py-2 font-medium text-[#0C0C0C]">AC / Light</td>
                              <td className="py-1.5 md:py-2 text-[#0C0C0C]">{formatINRCurrency(results.fitoutCosts.ac)}</td>
                              <td className="py-1.5 md:py-2 text-[#04B8BB] font-semibold">{formatINRCurrency(0)}</td>
                            </tr>
                            <tr>
                              <td className="py-1.5 md:py-2 font-medium text-[#0C0C0C]">Equipment</td>
                              <td className="py-1.5 md:py-2 text-[#0C0C0C]">{formatINRCurrency(results.fitoutCosts.equipment)}</td>
                              <td className="py-1.5 md:py-2 text-[#04B8BB] font-semibold">{formatINRCurrency(0)}</td>
                            </tr>
                            <tr>
                              <td className="py-1.5 md:py-2 font-medium text-[#0C0C0C]">Security</td>
                              <td className="py-1.5 md:py-2 text-[#0C0C0C]">{formatINRCurrency(results.fitoutCosts.security)}</td>
                              <td className="py-1.5 md:py-2 text-[#04B8BB] font-semibold">{formatINRCurrency(0)}</td>
                            </tr>
                            <tr>
                              <td className="py-1.5 md:py-2 font-medium text-[#0C0C0C]">Govt Approval</td>
                              <td className="py-1.5 md:py-2 text-[#0C0C0C]">{formatINRCurrency(results.fitoutCosts.govt)}</td>
                              <td className="py-1.5 md:py-2 text-[#04B8BB] font-semibold">{formatINRCurrency(0)}</td>
                            </tr>
                            <tr className="bg-[#0C0C0C]/5 border-t border-b border-[#0C0C0C]/10 text-xs md:text-sm">
                              <td className="py-2.5 px-2 font-bold text-[#0C0C0C]">Total Capital Expense</td>
                              <td className="py-2.5 px-2 font-bold text-[#0C0C0C]">{formatINRCurrency(results.oneTimeCost)}</td>
                              <td className="py-2.5 px-2 font-bold text-[#04B8BB]">{formatINRCurrency(0)}</td>
                            </tr>
                            <tr>
                              <td className="py-2 md:py-2.5 font-medium text-[#0C0C0C]">Monthly Rent & Maintenance</td>
                              <td className="py-2 md:py-2.5 text-[#0C0C0C]">{formatINRCurrency(results.monthlyOfficeCost)} / mo</td>
                              <td className="py-2 md:py-2.5 text-[#04B8BB] font-semibold">{formatINRCurrency(results.devenMonthly)} / mo</td>
                            </tr>
                            <tr className="bg-[#04B8BB]/10 border-t-2 border-[#04B8BB]/20">
                              <td className="py-3 px-2 font-bold text-sm md:text-base text-[#0C0C0C]">Year 1 Total</td>
                              <td className="py-3 px-2 font-bold text-sm md:text-base text-[#0C0C0C]">{formatINRCurrency(results.officeYear1Cost)}</td>
                              <td className="py-3 px-2 font-bold text-sm md:text-base text-[#024E5C]">{formatINRCurrency(results.devenYear1Cost)}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      <div className="mt-8 flex flex-col sm:flex-row gap-4">
                        <a href="#reservation" className="flex-1 py-3 bg-[#04B8BB] hover:bg-[#024E5C] text-white text-center rounded-lg font-medium transition-colors">
                          {config.freeTrialCtaText}
                        </a>
                        <button 
                          onClick={() => {
                            trackPixelEvent('Lead', { content_name: 'WhatsApp' });
                            window.open(`https://wa.me/916260582852?text=Hi, I just calculated my savings of ${formatINRCurrency(results.savings)} on Deven's website. I'd like to know more.`, '_blank');
                          }}
                          className="flex-1 py-3 bg-[#25D366] hover:bg-[#20bd5a] text-[#0C0C0C] font-bold text-center rounded-lg transition-colors flex items-center justify-center gap-2 border border-[#20bd5a]"
                        >
                          {config.whatsappCtaText}
                        </button>
                      </div>
                      
                      <p className="text-xs text-center text-[#0C0C0C]/40 mt-6">
                        {config.disclaimerText}
                      </p>
                    </motion.div>
                  )}

                </motion.div>
              )}

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

