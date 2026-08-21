import { useEffect, useState } from 'react';
import { Armchair, MessageCircle, RefreshCw, Lock } from 'lucide-react';
import { api } from '@/services/api';

const WHATSAPP_HREF = 'https://wa.me/916260582852?text=Hi%2C%20I%27d%20like%20to%20pre-book%20more%20than%207%20founding%20seats%20at%20Deven%20Cowork.';

export default function SeatSelection({ selectedSeats, onSeatsChange, preferredPlan, onPlanChange, bookingAmount }) {
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [zoomView, setZoomView] = useState('all'); // 'all', 't2-t3', 't4-t6', 't7', 'cabins'

  const loadSeats = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.fetchSeats();
      setSeats(res.data || []);
    } catch (err) {
      setError('Failed to fetch seat layout map. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSeats();

    // Setup WebSocket live sync connection
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const ws = new WebSocket(`${protocol}//${host}`);

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'SEAT_UPDATE') {
          setSeats((prev) => {
            const updated = [...prev];
            message.seats.forEach((newSeat) => {
              const idx = updated.findIndex((s) => s.zone === newSeat.zone && s.label === newSeat.label);
              if (idx !== -1) {
                updated[idx] = newSeat;
              }
            });
            return updated;
          });
        }
      } catch (err) {
        console.error('Error handling WebSocket message in seat-selection:', err);
      }
    };

    return () => ws.close();
  }, []);

  const handleSeatClick = (seat) => {
    if (seat.status === 'reserved' || seat.status === 'held' || seat.isStaff) return;

    const seatId = `${seat.zone}-${seat.label}`;
    const isSelected = selectedSeats.includes(seatId);

    if (isSelected) {
      const updated = selectedSeats.filter((s) => s !== seatId);
      onSeatsChange(updated);
      if (updated.length === 0) {
        onPlanChange('');
      }
    } else {
      if (selectedSeats.length >= 7) {
        return; // limit reached
      }
      const updated = [...selectedSeats, seatId].sort();
      onSeatsChange(updated);

      // Auto-set pricing tier based on selected seat's zone type
      if (seat.type === 'Hot Desk') {
        onPlanChange('Hot Desk');
      } else {
        onPlanChange('Dedicated Desk');
      }
    }
  };

  const getZoneBaseStyle = (zoneName, label, isStaff) => {
    if (zoneName.startsWith('C')) {
      return 'bg-amber-950/20 text-[#FFC400] border-[#FFC400]/40 hover:border-[#FFC400]';
    }

    switch (zoneName) {
      case 'T2':
        return 'bg-slate-900/40 text-slate-300 border-slate-700 hover:border-slate-500';
      case 'T3':
        return 'bg-pink-950/20 text-pink-300 border-pink-900/45 hover:border-pink-500';
      case 'T4':
        return 'bg-emerald-950/20 text-emerald-300 border-emerald-900/45 hover:border-emerald-500';
      case 'T5':
        return 'bg-blue-950/20 text-blue-300 border-blue-900/45 hover:border-blue-500';
      case 'T6':
        return 'bg-orange-950/20 text-orange-300 border-orange-900/45 hover:border-orange-500';
      case 'T7':
        return 'bg-stone-900/40 text-stone-300 border-stone-750 hover:border-stone-500';
      default:
        return 'bg-slate-900/40 text-slate-300 border-slate-800';
    }
  };

  const getSeatClass = (seat) => {
    const seatId = `${seat.zone}-${seat.label}`;
    const isSelected = selectedSeats.includes(seatId);
    const baseStyle = getZoneBaseStyle(seat.zone, seat.label, seat.isStaff);

    if (seat.isStaff) {
      return `bg-[#151515] border-[#222] text-[#444] cursor-not-allowed select-none`;
    }
    if (seat.status === 'reserved' || seat.status === 'held') {
      return `bg-[#101010] border-red-950/20 text-[#ef4444]/30 cursor-not-allowed select-none`;
    }
    if (isSelected) {
      return `${baseStyle} ring-2 ring-[#FFC400] bg-[#FFC400]/20 text-[#FFC400] border-[#FFC400] scale-[1.03] z-10 font-bold`;
    }
    const isCapReached = selectedSeats.length >= 7 && !isSelected;
    if (isCapReached) {
      return `bg-[#0B0B0B] text-[#555] border-[#1A1A1A] cursor-not-allowed select-none`;
    }
    // Available
    return `${baseStyle} cursor-pointer transition-all`;
  };

  const findSeat = (zoneName, deskLabel) => {
    return seats.find((s) => s.zone === zoneName && s.label === deskLabel);
  };


  // Hot Desks (T2 / T3)
  const renderSharedTableZone = (zoneName) => {
    const rows = ['R1', 'R2', 'R3', 'R4'];
    const cols = ['L1', 'L2', 'L3', 'L4'];

    const getAvailableInZone = () => {
      const zoneSeats = seats.filter((s) => s.zone === zoneName);
      return zoneSeats.filter((s) => s.status === 'available' && !s.isStaff).length;
    };

    return (
      <div className="border border-[#1E1E1E] bg-[#0A0A0A]/40 p-2.5 rounded space-y-2">
        <div className="flex justify-between items-center text-[9px] uppercase tracking-wider text-[#A3A3A3] font-bold">
          <span>Zone {zoneName}</span>
          <span className="text-[#FFC400] font-semibold">{getAvailableInZone()} Open</span>
        </div>

        <div className="flex items-center justify-center gap-1.5 py-1">
          {/* Left Column (R1-R4) */}
          <div className="flex flex-col gap-1">
            {rows.map((lbl) => {
              const seat = findSeat(zoneName, lbl);
              if (!seat) return <div key={lbl} className="h-7 w-7 bg-white/5" />;
              return (
                <button
                  key={lbl}
                  type="button"
                  disabled={seat.status === 'reserved' || seat.status === 'held' || seat.isStaff || (selectedSeats.length >= 7 && !selectedSeats.includes(seat.zone + '-' + seat.label))}
                  onClick={() => handleSeatClick(seat)}
                  className={`h-7 w-7 rounded border text-[8px] flex items-center justify-center transition-all ${getSeatClass(seat)}`}
                  title={`${zoneName}-${lbl} (${seat.status})`}
                >
                  {lbl}
                </button>
              );
            })}
          </div>

          {/* Table Divider */}
          <div className="w-1.5 h-32 bg-white/10 border-x border-[#1A1A1A] flex items-center justify-center text-[6px] font-bold uppercase tracking-wider text-[#444] [writing-mode:vertical-lr] text-center select-none py-1 rounded-sm">
            Table
          </div>

          {/* Right Column (L1-L4) */}
          <div className="flex flex-col gap-1">
            {cols.map((lbl) => {
              const seat = findSeat(zoneName, lbl);
              if (!seat) return <div key={lbl} className="h-7 w-7 bg-white/5" />;
              return (
                <button
                  key={lbl}
                  type="button"
                  disabled={seat.status === 'reserved' || seat.status === 'held' || seat.isStaff || (selectedSeats.length >= 7 && !selectedSeats.includes(seat.zone + '-' + seat.label))}
                  onClick={() => handleSeatClick(seat)}
                  className={`h-7 w-7 rounded border text-[8px] flex items-center justify-center transition-all ${getSeatClass(seat)}`}
                  title={`${zoneName}-${lbl} (${seat.status})`}
                >
                  {lbl}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Dedicated Desks (T4 / T5 / T6)
  const renderFacingRowsZone = (zoneName) => {
    const rows = ['R1', 'R2', 'R3', 'R4', 'R5'];
    const cols = ['L1', 'L2', 'L3', 'L4', 'L5'];

    const getAvailableInZone = () => {
      const zoneSeats = seats.filter((s) => s.zone === zoneName);
      return zoneSeats.filter((s) => s.status === 'available' && !s.isStaff).length;
    };

    return (
      <div className="border border-[#1E1E1E] bg-[#0A0A0A]/40 p-2.5 rounded space-y-2">
        <div className="flex justify-between items-center text-[9px] uppercase tracking-wider text-[#A3A3A3] font-bold">
          <span>Zone {zoneName}</span>
          <span className="text-[#FFC400] font-semibold">{getAvailableInZone()} Open</span>
        </div>

        <div className="flex flex-col gap-1 items-center py-1">
          {/* Top Row */}
          <div className="flex gap-1">
            {rows.map((lbl) => {
              const seat = findSeat(zoneName, lbl);
              if (!seat) return <div key={lbl} className="h-7 w-7" />;
              return (
                <button
                  key={lbl}
                  type="button"
                  disabled={seat.status === 'reserved' || seat.status === 'held' || seat.isStaff || (selectedSeats.length >= 7 && !selectedSeats.includes(seat.zone + '-' + seat.label))}
                  onClick={() => handleSeatClick(seat)}
                  className={`h-7 w-7 rounded border text-[8px] flex items-center justify-center transition-all ${getSeatClass(seat)}`}
                  title={`${zoneName}-${lbl} ${seat.isStaff ? '(Staff)' : `(${seat.status})`}`}
                >
                  {seat.isStaff ? <Lock size={7} className="text-white/20" /> : lbl}
                </button>
              );
            })}
          </div>

          {/* Divider */}
          <div className="w-full h-0.5 bg-white/5" />

          {/* Bottom Row */}
          <div className="flex gap-1">
            {cols.map((lbl) => {
              const seat = findSeat(zoneName, lbl);
              if (!seat) return <div key={lbl} className="h-7 w-7" />;
              return (
                <button
                  key={lbl}
                  type="button"
                  disabled={seat.status === 'reserved' || seat.status === 'held' || seat.isStaff || (selectedSeats.length >= 7 && !selectedSeats.includes(seat.zone + '-' + seat.label))}
                  onClick={() => handleSeatClick(seat)}
                  className={`h-7 w-7 rounded border text-[8px] flex items-center justify-center transition-all ${getSeatClass(seat)}`}
                  title={`${zoneName}-${lbl} (${seat.status})`}
                >
                  {lbl}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Entrance Desks (T7)
  const renderEntranceZone = () => {
    const desks = ['R1', 'R2', 'R3', 'R4', 'R5', 'R6', 'R7', 'R8', 'R9', 'R10'];

    const getAvailableInZone = () => {
      const zoneSeats = seats.filter((s) => s.zone === 'T7');
      return zoneSeats.filter((s) => s.status === 'available' && !s.isStaff).length;
    };

    return (
      <div className="border border-[#1E1E1E] bg-[#0A0A0A]/40 p-2.5 rounded space-y-2">
        <div className="flex justify-between items-center text-[9px] uppercase tracking-wider text-[#A3A3A3] font-bold">
          <span>Zone T7 (Dedicated)</span>
          <span className="text-[#FFC400] font-semibold">{getAvailableInZone()} Open</span>
        </div>

        <div className="flex flex-wrap gap-1 justify-center py-1">
          {desks.map((lbl) => {
            const seat = findSeat('T7', lbl);
            if (!seat) return <div key={lbl} className="h-7 w-7" />;
            return (
              <button
                key={lbl}
                type="button"
                disabled={seat.status === 'reserved' || seat.status === 'held' || seat.isStaff || (selectedSeats.length >= 7 && !selectedSeats.includes(seat.zone + '-' + seat.label))}
                onClick={() => handleSeatClick(seat)}
                className={`h-7 w-7 rounded border text-[8px] flex items-center justify-center transition-all ${getSeatClass(seat)}`}
                title={`T7-${lbl} ${seat.isStaff ? '(Staff)' : `(${seat.status})`}`}
              >
                {seat.isStaff ? <Lock size={7} className="text-white/20" /> : lbl}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="border border-[#1E1E1E] bg-[#080808] p-4 sm:p-6 space-y-5 rounded">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#1A1A1A] pb-3">
        <div>
          <h3 className="font-display text-lg tracking-wider text-[#F1F1F1] uppercase">
            Interactive Floor Map
          </h3>
          <p className="text-[10px] text-[#A3A3A3] mt-0.5">
            Click to select a desk (refundable deposit ₹{(bookingAmount || 1000).toLocaleString('en-IN')}/seat). Max 7 desks. Selection is optional.
          </p>
        </div>

        <button
          type="button"
          onClick={loadSeats}
          disabled={loading}
          className="button button-outline button-small gap-1.5 py-1 px-2.5 text-[9px] uppercase tracking-wider font-bold !min-h-[28px] self-start"
          title="Refresh availability"
        >
          <RefreshCw size={10} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {error && (
        <p className="border border-[#a85a4f] bg-[#301b18] p-2.5 text-[10px] text-[#ffc0b6]">
          {error}
        </p>
      )}

      {loading ? (
        <div className="py-16 text-center text-[#A3A3A3] animate-pulse text-xs">
          Loading layout map layout...
        </div>
      ) : (
        <div className="space-y-5">
          {/* Zoom view filtering tabs on mobile */}
          <div className="flex gap-1.5 overflow-x-auto pb-1.5 border-b border-white/5 md:hidden">
            {['all', 't2-t3', 't4-t6', 't7'].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setZoomView(v)}
                className={`px-2.5 py-1 text-[9px] font-bold uppercase rounded transition-all whitespace-nowrap ${
                  zoomView === v ? 'bg-[#FFC400] text-[#000000]' : 'bg-white/5 text-[#A3A3A3]'
                }`}
              >
                {v === 'all' ? '🗺️ Full Map' : v === 't2-t3' ? 'Hot Desks (T2/T3)' : v === 't4-t6' ? 'Dedicated (T4/5/6)' : 'Dedicated (T7)'}
              </button>
            ))}
          </div>

          {/* Interactive Layout Section */}
          <div className="relative border border-[#1A1A1A] bg-[#050505] p-3 rounded select-none overflow-x-auto">
            <div className="min-w-0 w-full space-y-5" style={{ minWidth: zoomView === 'all' ? '520px' : undefined }}>
              
              {/* TOP ROW: Stage / Screen Area */}
              {(zoomView === 'all') && (
                <div className="grid grid-cols-1 gap-4 items-center border-b border-[#151515] pb-3">
                  <div className="border border-dashed border-[#FFC400]/20 bg-[#FFC400]/5 h-14 rounded flex flex-col items-center justify-center text-center p-2">
                    <span className="font-display text-xs text-[#FFC400] font-bold tracking-wider uppercase">STAGE & PRESENTATION SCREEN</span>
                    <span className="text-[7px] text-[#888] mt-0.5 uppercase tracking-wider font-semibold"> Raipur Founders Launch Hub</span>
                  </div>
                </div>
              )}

              {/* MIDDLE ROW: Hot Desks T2/T3 & Dedicated Desks T4/T5/T6 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Hot Desk Tables */}
                {(zoomView === 'all' || zoomView === 't2-t3') && (
                  <div className="space-y-2">
                    <div className="text-[8px] uppercase tracking-wider text-[#555] font-bold">Hot Desks (T2 / T3)</div>
                    <div className="grid grid-cols-2 gap-2">
                      {renderSharedTableZone('T2')}
                      {renderSharedTableZone('T3')}
                    </div>
                  </div>
                )}

                {/* Dedicated Desk Rows */}
                {(zoomView === 'all' || zoomView === 't4-t6') && (
                  <div className="space-y-2">
                    <div className="text-[8px] uppercase tracking-wider text-[#555] font-bold">Dedicated Desks (T4 / T5 / T6)</div>
                    <div className="grid grid-cols-3 gap-2">
                      {renderFacingRowsZone('T4')}
                      {renderFacingRowsZone('T5')}
                      {renderFacingRowsZone('T6')}
                    </div>
                  </div>
                )}
              </div>

              {/* BOTTOM ROW: Coffee Lab, Main Entry, Emergency Exit & T7 */}
              {(zoomView === 'all' || zoomView === 't7') && (
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_1.5fr] gap-4 pt-3 border-t border-[#151515] items-start">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="border border-[#22c55e]/20 bg-[#22c55e]/5 p-2 rounded h-20 flex flex-col justify-center text-center">
                      <span className="font-display text-[10px] text-[#22c55e] font-bold uppercase tracking-wider">Coffee Lab</span>
                      <span className="text-[7px] text-[#888] mt-0.5">Lobby & Lounge</span>
                    </div>
                    <div className="flex flex-col gap-1.5 justify-center h-20">
                      <div className="bg-[#111] border border-[#222] text-center py-1 text-[7px] font-bold text-[#FFC400] uppercase tracking-wider rounded">
                        🚪 Main Entry
                      </div>
                      <div className="bg-[#2a1313] border border-red-950/20 text-center py-1 text-[7px] font-bold text-red-400/80 uppercase tracking-wider rounded">
                        🚨 Fire Exit
                      </div>
                    </div>
                  </div>

                  <div>
                    {renderEntranceZone()}
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Legends */}
          <div className="flex flex-wrap gap-x-5 gap-y-2 border-t border-[#1A1A1A] pt-3 text-[10px] text-[#A3A3A3]">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 border border-slate-700 bg-slate-900/40 rounded-sm" />
              <span>Available</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 bg-[#FFC400]/20 border border-[#FFC400] text-[#FFC400] rounded-sm" />
              <span>Selected</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 bg-[#101010] border border-red-950/20 rounded-sm" />
              <span>Booked / Held</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 bg-[#151515] border border-[#222] rounded-sm flex items-center justify-center"><Lock size={6} className="text-white/20" /></span>
              <span>Staff Locked</span>
            </div>
          </div>

          {/* Selections stats */}
          <div className="border-t border-[#1A1A1A] pt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-xs">
            <div>
              <p className="text-white/80 font-medium">
                Selected Seats:{' '}
                <strong className="text-[#FFC400]">
                  {selectedSeats.length === 0 ? 'None' : selectedSeats.join(', ')}
                </strong>
              </p>
              <p className="text-[10px] text-[#A3A3A3] mt-0.5 font-medium">
                Refundable Deposit:{' '}
                <strong className="text-white">₹{(selectedSeats.length * (bookingAmount || 1000)).toLocaleString('en-IN')}</strong>
              </p>
            </div>

            {selectedSeats.length >= 7 && (
              <div className="border border-[#FFC400]/30 bg-[#FFC400]/5 p-2 rounded text-[10px] text-[#FFC400] flex items-center gap-2">
                <span>Limit reached. Need more?</span>
                <a
                  href={WHATSAPP_HREF}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 px-2 py-1 bg-[#FFC400] text-[#000000] font-bold rounded hover:opacity-90 transition-all text-[9px] uppercase tracking-wider"
                >
                  <MessageCircle size={10} /> WhatsApp
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
