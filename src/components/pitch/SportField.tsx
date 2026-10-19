import React from 'react';
import { ModalityId, TacticalSlot, Player } from '../../types';

interface SportFieldProps {
  modalityId: ModalityId;
  slots: TacticalSlot[];
  playersMap: Record<string, Player>;
  selectedSlotId?: string | null;
  onSlotClick?: (slotId: string) => void;
  readOnly?: boolean;
  highlightPlayerId?: string;
}

export const SportField: React.FC<SportFieldProps> = ({
  modalityId,
  slots,
  playersMap,
  selectedSlotId,
  onSlotClick,
  readOnly = false,
  highlightPlayerId,
}) => {
  // Render pitch markings according to sport
  const isBasketball = modalityId === 'basquete_5x5' || modalityId === 'basquete_3x3';
  const isBasketball3x3 = modalityId === 'basquete_3x3';
  const isFutsal = modalityId === 'futsal';
  const isField7 = modalityId === 'futebol_7';

  // Pitch aspect ratio: height usually longer for vertical mobile view (3:4 or 4:5)
  return (
    <div className="relative w-full aspect-[3/4] max-h-[520px] rounded-2xl overflow-hidden shadow-inner border border-slate-700/60 select-none bg-slate-900">
      {/* Field Background & Markings */}
      {isBasketball ? (
        // Basketball Court
        <div className="absolute inset-0 bg-[#c9894e] bg-[radial-gradient(#e0a369_1px,transparent_1px)] [background-size:16px_16px] overflow-hidden">
          <svg className="absolute inset-0 w-full h-full stroke-white/80 fill-none" strokeWidth="2" viewBox="0 0 300 400">
            {/* Outer boundary */}
            <rect x="15" y="15" width="270" height="370" rx="4" />

            {isBasketball3x3 ? (
              // 3x3 Half-court
              <>
                {/* Free throw lane / Key */}
                <rect x="105" y="15" width="90" height="130" strokeWidth="2" />
                {/* Free throw circle */}
                <circle cx="150" cy="145" r="45" strokeWidth="2" />
                <path d="M 105 145 A 45 45 0 0 0 195 145" strokeDasharray="5,5" />
                {/* 3-Point Arc (2-point in 3x3) */}
                <path d="M 25 15 L 25 65 A 130 130 0 0 0 275 65 L 275 15" strokeWidth="2" />
                {/* Backboard & Hoop */}
                <line x1="125" y1="30" x2="175" y2="30" strokeWidth="4" stroke="#ffffff" />
                <circle cx="150" cy="42" r="10" stroke="#f97316" strokeWidth="3" />
                {/* Half-court line */}
                <line x1="15" y1="360" x2="285" y2="360" strokeWidth="3" />
              </>
            ) : (
              // 5x5 Full Court (Vertical Perspective)
              <>
                {/* Center Line & Circle */}
                <line x1="15" y1="200" x2="285" y2="200" strokeWidth="2" />
                <circle cx="150" cy="200" r="35" strokeWidth="2" />

                {/* Top Half (Opponent Side) */}
                <rect x="105" y="15" width="90" height="90" />
                <circle cx="150" cy="105" r="35" />
                <path d="M 35 15 L 35 45 A 115 115 0 0 0 265 45 L 265 15" />
                <line x1="130" y1="25" x2="170" y2="25" strokeWidth="3" />
                <circle cx="150" cy="33" r="8" stroke="#f97316" strokeWidth="2" />

                {/* Bottom Half (Our Side) */}
                <rect x="105" y="295" width="90" height="90" />
                <circle cx="150" cy="295" r="35" />
                <path d="M 35 385 L 35 355 A 115 115 0 0 1 265 355 L 265 385" />
                <line x1="130" y1="375" x2="170" y2="375" strokeWidth="3" />
                <circle cx="150" cy="367" r="8" stroke="#f97316" strokeWidth="2" />
              </>
            )}
          </svg>
        </div>
      ) : isFutsal ? (
        // Futsal Indoor Blue/Wood Court
        <div className="absolute inset-0 bg-gradient-to-b from-sky-900 to-blue-950 overflow-hidden">
          <svg className="absolute inset-0 w-full h-full stroke-white/85 fill-none" strokeWidth="2" viewBox="0 0 300 400">
            {/* Outer boundary */}
            <rect x="16" y="16" width="268" height="368" rx="2" />
            {/* Center line & circle */}
            <line x1="16" y1="200" x2="284" y2="200" strokeWidth="2" />
            <circle cx="150" cy="200" r="38" />
            <circle cx="150" cy="200" r="2.5" fill="white" />

            {/* Top Penalty Area (6m D-arc) */}
            <path d="M 90 16 L 90 55 A 60 60 0 0 0 210 55 L 210 16" />
            <circle cx="150" cy="55" r="2.5" fill="white" />
            {/* 10m second penalty mark */}
            <circle cx="150" cy="95" r="2.5" fill="white" />
            {/* Top Goal */}
            <rect x="120" y="8" width="60" height="8" strokeWidth="1.5" stroke="#ef4444" fill="#ef4444/20" />

            {/* Bottom Penalty Area (6m D-arc) */}
            <path d="M 90 384 L 90 345 A 60 60 0 0 1 210 345 L 210 384" />
            <circle cx="150" cy="345" r="2.5" fill="white" />
            {/* 10m second penalty mark */}
            <circle cx="150" cy="305" r="2.5" fill="white" />
            {/* Bottom Goal */}
            <rect x="120" y="384" width="60" height="8" strokeWidth="1.5" stroke="#ef4444" fill="#ef4444/20" />

            {/* Corner Arcs */}
            <path d="M 16 30 A 14 14 0 0 1 30 16" />
            <path d="M 270 16 A 14 14 0 0 1 284 30" />
            <path d="M 16 370 A 14 14 0 0 0 30 384" />
            <path d="M 270 384 A 14 14 0 0 0 284 370" />
          </svg>
        </div>
      ) : (
        // Soccer Field (Campo & Fut 7)
        <div className={`absolute inset-0 ${isField7 ? 'bg-emerald-800' : 'bg-emerald-900'} overflow-hidden`}>
          {/* Subtle grass striped bands */}
          <div className="absolute inset-0 opacity-25 flex flex-col pointer-events-none">
            <div className="flex-1 bg-black/15" />
            <div className="flex-1 bg-transparent" />
            <div className="flex-1 bg-black/15" />
            <div className="flex-1 bg-transparent" />
            <div className="flex-1 bg-black/15" />
            <div className="flex-1 bg-transparent" />
            <div className="flex-1 bg-black/15" />
            <div className="flex-1 bg-transparent" />
          </div>

          <svg className="absolute inset-0 w-full h-full stroke-white/80 fill-none" strokeWidth="2" viewBox="0 0 300 400">
            {/* Outer Boundary */}
            <rect x="18" y="16" width="264" height="368" />

            {/* Center line & circle */}
            <line x1="18" y1="200" x2="282" y2="200" strokeWidth="2" />
            <circle cx="150" cy="200" r="36" />
            <circle cx="150" cy="200" r="2.5" fill="white" />

            {/* Top Penalty Box */}
            <rect x="75" y="16" width="150" height="65" />
            <rect x="105" y="16" width="90" height="24" />
            <circle cx="150" cy="60" r="2.5" fill="white" />
            <path d="M 125 81 A 30 30 0 0 0 175 81" />
            {/* Top Goal */}
            <rect x="120" y="8" width="60" height="8" stroke="#ffffff" fill="white/20" />

            {/* Bottom Penalty Box */}
            <rect x="75" y="319" width="150" height="65" />
            <rect x="105" y="360" width="90" height="24" />
            <circle cx="150" cy="340" r="2.5" fill="white" />
            <path d="M 125 319 A 30 30 0 0 1 175 319" />
            {/* Bottom Goal */}
            <rect x="120" y="384" width="60" height="8" stroke="#ffffff" fill="white/20" />

            {/* Corner arcs */}
            <path d="M 18 28 A 12 12 0 0 1 30 16" />
            <path d="M 270 16 A 12 12 0 0 1 282 28" />
            <path d="M 18 372 A 12 12 0 0 0 30 384" />
            <path d="M 270 384 A 12 12 0 0 0 282 372" />
          </svg>
        </div>
      )}

      {/* Direction of attack subtle label */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-wider font-semibold text-white/50 pointer-events-none flex items-center gap-1">
        <span>▲ Sentido de Ataque</span>
      </div>

      {/* Tactical Player Nodes */}
      {slots.map((slot) => {
        const player = slot.jogadorId ? playersMap[slot.jogadorId] : undefined;
        const isSelected = selectedSlotId === slot.slotId;
        const isHighlighted = highlightPlayerId && slot.jogadorId === highlightPlayerId;

        // Visual position category colors
        let ringBg = 'bg-slate-800 text-slate-200 border-slate-600';
        if (slot.positionName === 'GOL' || slot.positionName === 'G') {
          ringBg = 'bg-amber-500 text-slate-950 border-amber-300 font-bold';
        } else if (player) {
          ringBg = 'bg-blue-600 text-white border-blue-400 font-bold';
        }

        return (
          <button
            key={slot.slotId}
            type="button"
            disabled={readOnly}
            onClick={() => onSlotClick && onSlotClick(slot.slotId)}
            style={{
              left: `${slot.x}%`,
              top: `${slot.y}%`,
            }}
            className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group transition-transform ${
              readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-105 active:scale-95'
            }`}
          >
            {/* Jersey circle with number / position */}
            <div
              className={`relative w-10 h-10 rounded-full flex items-center justify-center border-2 shadow-lg transition-all ${ringBg} ${
                isSelected
                  ? 'ring-4 ring-yellow-400 scale-110 shadow-yellow-500/50'
                  : isHighlighted
                  ? 'ring-4 ring-emerald-400 scale-110 shadow-emerald-500/50'
                  : ''
              }`}
            >
              {player ? (
                <span className="font-athletic text-base tracking-tighter tabular-nums">
                  {player.numero}
                </span>
              ) : (
                <span className="text-[10px] font-bold tracking-tight text-white/80">
                  {slot.positionName}
                </span>
              )}

              {/* Little position tag on the shoulder if assigned */}
              {player && (
                <span className="absolute -top-1.5 -right-1.5 bg-slate-900/90 text-white border border-slate-700 text-[8px] font-bold px-1 rounded">
                  {slot.positionName}
                </span>
              )}
            </div>

            {/* Player name / nickname */}
            <div className="mt-1 px-1.5 py-0.5 max-w-[84px] rounded bg-slate-950/80 backdrop-blur-xs border border-white/10 text-center shadow">
              <span className="block text-[10px] font-medium text-white truncate leading-tight">
                {player ? player.apelido || player.nome.split(' ')[0] : 'Vazio'}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
};
