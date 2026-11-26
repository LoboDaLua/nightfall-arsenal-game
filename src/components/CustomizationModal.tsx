import { useEffect } from 'react';
import { CLOTHING_OPTIONS, SKIN_PALETTE } from '../game/rules';
import type { CharacterCustomization, GenderOption } from '../game/types';

interface CustomizationModalProps {
  customization: CharacterCustomization;
  onUpdateCustomization: (custom: CharacterCustomization) => void;
  onClose: () => void;
}

const GENDER_OPTIONS: { id: GenderOption; label: string }[] = [
  { id: 'male', label: 'Male' },
  { id: 'female', label: 'Female' },
  { id: 'neuter', label: 'Neuter' },
];

export function CustomizationModal({
  customization,
  onUpdateCustomization,
  onClose,
}: CustomizationModalProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/85 p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="custom-title"
      data-testid="customization-modal"
    >
      <div className="ps1-panel w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3.5 border-b-2 border-slate-700 bg-slate-900/90">
          <div>
            <h2
              id="custom-title"
              className="text-lg sm:text-xl font-black tracking-widest uppercase text-amber-300"
            >
              SURVIVOR APPEARANCE
            </h2>
            <p className="text-[11px] font-bold tracking-wider uppercase text-slate-400">
              Permanent Look · Weapons &amp; Upgrades Reset Every Run
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ps1-button px-4 py-1.5 text-xs font-black uppercase tracking-widest text-slate-200 cursor-pointer"
          >
            Done
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Gender / Body */}
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-2">
              Body / Gender
            </div>
            <div className="flex flex-wrap gap-2">
              {GENDER_OPTIONS.map((g) => {
                const active = customization.gender === g.id;
                return (
                  <button
                    key={g.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => onUpdateCustomization({ ...customization, gender: g.id })}
                    className={`ps1-button px-4 py-2 text-xs font-black uppercase tracking-wider cursor-pointer ${
                      active
                        ? 'border-sky-400 text-sky-200 bg-sky-950/90'
                        : 'border-slate-600 text-slate-300'
                    }`}
                  >
                    {g.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Skin Color */}
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-2">
              Skin Tone
            </div>
            <div className="flex flex-wrap gap-2.5">
              {SKIN_PALETTE.map((skin) => {
                const active = customization.skinColor === skin.hex;
                return (
                  <button
                    key={skin.id}
                    type="button"
                    aria-pressed={active}
                    aria-label={`Skin tone: ${skin.name}`}
                    onClick={() => onUpdateCustomization({ ...customization, skinColor: skin.hex })}
                    className={`flex items-center gap-2 px-3 py-1.5 border-2 cursor-pointer transition-colors ${
                      active
                        ? 'border-amber-400 bg-slate-800 text-amber-200'
                        : 'border-slate-700 bg-slate-900/90 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <span
                      className="w-4 h-4 border border-slate-950 shrink-0"
                      style={{ backgroundColor: skin.hex }}
                    />
                    <span className="text-[11px] font-bold uppercase tracking-wide">
                      {skin.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Clothing */}
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-2">
              Outfit &amp; Gear
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {CLOTHING_OPTIONS.map((cloth) => {
                const active = customization.clothing === cloth.id;
                const priCss = `#${cloth.primaryHex.toString(16).padStart(6, '0')}`;
                const trimCss = `#${cloth.trimHex.toString(16).padStart(6, '0')}`;
                return (
                  <button
                    key={cloth.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => onUpdateCustomization({ ...customization, clothing: cloth.id })}
                    className={`flex items-center gap-2.5 px-3 py-2.5 border-2 text-left cursor-pointer ${
                      active
                        ? 'border-amber-400 bg-slate-800 text-amber-200'
                        : 'border-slate-700 bg-slate-900/90 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <span
                      className="w-4 h-4 border shrink-0"
                      style={{ backgroundColor: priCss, borderColor: trimCss }}
                    />
                    <span className="text-[11px] font-black uppercase tracking-wide leading-tight">
                      {cloth.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
