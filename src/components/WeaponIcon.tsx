import type { WeaponId, WearableId } from '../game/types';

interface WeaponIconProps {
  weaponId: WeaponId;
  className?: string;
}

export function WeaponIcon({ weaponId, className = 'w-8 h-8' }: WeaponIconProps) {
  switch (weaponId) {
    case 'sword':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <path
            d="M19 3L21 5L10 16L8 14L19 3Z"
            fill="#7dd3fc"
            stroke="#05070e"
            strokeWidth="1.5"
          />
          <path
            d="M6 12L12 18L10.5 19.5L8.5 17.5L5.5 20.5L3.5 18.5L6.5 15.5L4.5 13.5L6 12Z"
            fill="#94a3b8"
            stroke="#05070e"
            strokeWidth="1.4"
          />
        </svg>
      );
    case 'club':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <path
            d="M14 4L20 10L11 17L7 13L14 4Z"
            fill="#f59e0b"
            stroke="#05070e"
            strokeWidth="1.5"
          />
          <path
            d="M8 14L10 16L5.5 20.5L3.5 18.5L8 14Z"
            fill="#92400e"
            stroke="#05070e"
            strokeWidth="1.4"
          />
          <circle cx="17" cy="7" r="1.3" fill="#fef3c7" />
        </svg>
      );
    case 'chain':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <path
            d="M4 19C6 16 9 16 11 13C13 10 14 9 16 7"
            stroke="#cbd5e1"
            strokeWidth="2.4"
            strokeDasharray="2.5 1.8"
            strokeLinecap="round"
          />
          <path
            d="M15 8L21 3L18 11L15 8Z"
            fill="#f8fafc"
            stroke="#05070e"
            strokeWidth="1.4"
          />
        </svg>
      );
    case 'fangs':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <path
            d="M5 6C5 13 8 18 10 20C9 15 9 11 10 7L5 6Z"
            fill="#4ade80"
            stroke="#05070e"
            strokeWidth="1.5"
          />
          <path
            d="M19 6C19 13 16 18 14 20C15 15 15 11 14 7L19 6Z"
            fill="#4ade80"
            stroke="#05070e"
            strokeWidth="1.5"
          />
        </svg>
      );
    case 'pistol':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <path
            d="M3 7H19V11H11L9.5 18H5.5L7 11H3V7Z"
            fill="#facc15"
            stroke="#05070e"
            strokeWidth="1.5"
          />
          <rect x="19" y="7.5" width="2.5" height="2" fill="#fef08a" />
        </svg>
      );
    case 'sniper':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <path
            d="M2 12H22V14.5H11L9 19H6L7.5 14.5H2V12Z"
            fill="#f43f5e"
            stroke="#05070e"
            strokeWidth="1.4"
          />
          <rect x="8" y="8" width="7" height="3" fill="#94a3b8" stroke="#05070e" strokeWidth="1.2" />
        </svg>
      );
    case 'axe':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <path
            d="M5 19L15 9"
            stroke="#92400e"
            strokeWidth="2.8"
            strokeLinecap="round"
          />
          <path
            d="M12 4C16 4 20 7 20 12C17 12 14.5 11 13 9.5L12 4Z"
            fill="#fb923c"
            stroke="#05070e"
            strokeWidth="1.5"
          />
          <path
            d="M13 8.5L16.5 5.5"
            stroke="#fed7aa"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
        </svg>
      );
    case 'scythe':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <path
            d="M5 20L15 6"
            stroke="#64748b"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <path
            d="M14 5C18.5 5 21 8.5 21 13.5C18 10.5 15.5 9 12.5 8.5L14 5Z"
            fill="#c084fc"
            stroke="#05070e"
            strokeWidth="1.5"
          />
        </svg>
      );
    case 'shotgun':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <path
            d="M2 10H21V13.5H10.5L7.5 18H4L6 13.5H2V10Z"
            fill="#fb7185"
            stroke="#05070e"
            strokeWidth="1.4"
          />
          <rect x="11" y="13.5" width="7" height="2" fill="#92400e" stroke="#05070e" strokeWidth="1" />
        </svg>
      );
    case 'crossbow':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <path
            d="M6 5C11 5 11 19 6 19"
            stroke="#a78bfa"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <path d="M6 5L14 12L6 19" stroke="#cbd5e1" strokeWidth="1.2" />
          <path d="M3 12H21" stroke="#ddd6fe" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M18 9.5L22 12L18 14.5Z" fill="#a78bfa" stroke="#05070e" strokeWidth="1.1" />
        </svg>
      );
    case 'flamethrower':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <rect x="3" y="11" width="13" height="4.5" fill="#f97316" stroke="#05070e" strokeWidth="1.4" />
          <rect x="5" y="15.5" width="5" height="4" fill="#9a3412" stroke="#05070e" strokeWidth="1.2" />
          <path
            d="M17 12.5C18.5 9.5 21 10 21.5 12.5C22 14.5 19.5 16 17 14Z"
            fill="#fde047"
            stroke="#ea580c"
            strokeWidth="1.2"
          />
        </svg>
      );
    case 'katana':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <path
            d="M20.5 3.5C16 7 12 11 9.5 14L11 15.5C14 12.5 17.5 8.5 20.5 3.5Z"
            fill="#67e8f9"
            stroke="#05070e"
            strokeWidth="1.4"
          />
          <path d="M8 13L11.5 16.5" stroke="#facc15" strokeWidth="2.2" />
          <path d="M9.5 15L4.5 20" stroke="#1e293b" strokeWidth="2.6" strokeLinecap="round" />
        </svg>
      );
    case 'halberd':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <path d="M4 20L17 7" stroke="#64748b" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M16 4L20 4L20 8L16 7Z" fill="#38bdf8" stroke="#05070e" strokeWidth="1.3" />
          <path d="M13 6C16.5 6 19 8.5 19 12C16.5 11.5 14.5 10.5 13 8.5Z" fill="#38bdf8" stroke="#05070e" strokeWidth="1.3" />
        </svg>
      );
    case 'chakram':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="7.5" stroke="#fda4af" strokeWidth="3" />
          <circle cx="12" cy="12" r="4" stroke="#05070e" strokeWidth="1.4" />
          <path d="M12 2V5M12 19V22M2 12H5M19 12H22" stroke="#ffe4e6" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case 'minigun':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <rect x="3" y="9" width="8" height="6" fill="#94a3b8" stroke="#05070e" strokeWidth="1.4" />
          <rect x="11" y="9.5" width="10" height="1.5" fill="#fde047" />
          <rect x="11" y="12" width="10" height="1.5" fill="#fde047" />
          <rect x="5" y="15" width="4" height="4.5" fill="#334155" stroke="#05070e" strokeWidth="1.2" />
        </svg>
      );
    case 'railgun':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <path d="M2 10H21V12H10L8 17H4.5L6.5 12H2V10Z" fill="#22d3ee" stroke="#05070e" strokeWidth="1.4" />
          <path d="M10 13.5H21" stroke="#67e8f9" strokeWidth="2" strokeLinecap="round" />
          <circle cx="9" cy="11" r="1.4" fill="#ecfeff" />
        </svg>
      );
    case 'grimoire':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <rect x="5" y="4" width="14" height="16" rx="1.5" fill="#14532d" stroke="#4ade80" strokeWidth="1.8" />
          <path d="M8 4V20" stroke="#22c55e" strokeWidth="1.6" />
          <circle cx="13.5" cy="11.5" r="2.6" fill="#4ade80" stroke="#05070e" strokeWidth="1.2" />
        </svg>
      );
    case 'greatsword':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <path d="M18.5 2.5L21.5 5.5L10.5 16.5L7.5 13.5L18.5 2.5Z" fill="#ff6b35" stroke="#05070e" strokeWidth="1.5" />
          <path d="M5.5 11.5L12.5 18.5L11 20L8.5 17.5L5.5 20.5L3.5 18.5L6.5 15.5L4 13L5.5 11.5Z" fill="#fed7aa" stroke="#05070e" strokeWidth="1.4" />
        </svg>
      );
    case 'arcane_staff':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <path d="M5 20L15 8" stroke="#94a3b8" strokeWidth="2.4" strokeLinecap="round" />
          <polygon points="16,3 20,7 16,11 12,7" fill="#c084fc" stroke="#05070e" strokeWidth="1.4" />
          <circle cx="16" cy="7" r="1.4" fill="#f3e8ff" />
        </svg>
      );
    case 'void_orb':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="6.5" fill="#7e22ce" stroke="#d8b4fe" strokeWidth="1.8" />
          <ellipse cx="12" cy="12" rx="10" ry="3.2" transform="rotate(-25 12 12)" stroke="#c084fc" strokeWidth="1.6" />
          <circle cx="12" cy="12" r="2.2" fill="#090314" />
        </svg>
      );
    case 'stormcaller_wand':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <path d="M5 20L14 11" stroke="#64748b" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M15 3L11 10H15L13 15L20 8H15.5L18 3H15Z" fill="#38bdf8" stroke="#05070e" strokeWidth="1.2" />
        </svg>
      );
    case 'frostbrand':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <path d="M19 3L21 5L10 16L8 14L19 3Z" fill="#67e8f9" stroke="#05070e" strokeWidth="1.5" />
          <path d="M6 12L12 18L10.5 19.5L8.5 17.5L5.5 20.5L3.5 18.5L6.5 15.5L4.5 13.5L6 12Z" fill="#e0f2fe" stroke="#05070e" strokeWidth="1.4" />
          <path d="M13 6L15 8M15.5 4.5L17.5 6.5" stroke="#ffffff" strokeWidth="1.3" />
        </svg>
      );
    case 'cursed_censer':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <path d="M12 3V7" stroke="#94a3b8" strokeWidth="2" />
          <path d="M7 9H17L15.5 18H8.5L7 9Z" fill="#14532d" stroke="#22c55e" strokeWidth="1.6" />
          <circle cx="12" cy="13.5" r="2.2" fill="#4ade80" />
        </svg>
      );
    case 'runic_gauntlets':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <rect x="6" y="7" width="12" height="10" rx="2" fill="#f59e0b" stroke="#05070e" strokeWidth="1.5" />
          <path d="M8 7V4M12 7V4M16 7V4" stroke="#fef3c7" strokeWidth="2" strokeLinecap="round" />
          <path d="M9 12H15" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'starfire_bow':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <path d="M8 3C15 6 15 18 8 21" stroke="#fde047" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M8 3V21" stroke="#fef08a" strokeWidth="1.1" />
          <path d="M4 12H20" stroke="#f8fafc" strokeWidth="2" strokeLinecap="round" />
          <path d="M17 9.5L21 12L17 14.5Z" fill="#fde047" stroke="#05070e" strokeWidth="1.2" />
        </svg>
      );
  }
}

interface WearableIconProps {
  wearableId: WearableId;
  className?: string;
}

export function WearableIcon({ wearableId, className = 'w-6 h-6' }: WearableIconProps) {
  switch (wearableId) {
    case 'sunfire_aegis':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <path d="M12 3L19 6V12C19 16.5 15.8 19.8 12 21C8.2 19.8 5 16.5 5 12V6L12 3Z" fill="#ea580c" stroke="#fed7aa" strokeWidth="1.6" />
          <circle cx="12" cy="11.5" r="3" fill="#fde047" />
        </svg>
      );
    case 'thornmail':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <path d="M6 6L12 4L18 6L19 18L12 20L5 18L6 6Z" fill="#64748b" stroke="#cbd5e1" strokeWidth="1.5" />
          <path d="M4 10L8 12L4 14M20 10L16 12L20 14M12 3V7" stroke="#f8fafc" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case 'spirit_visage':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <path d="M12 3L18 7V15L12 21L6 15V7L12 3Z" fill="#166534" stroke="#4ade80" strokeWidth="1.7" />
          <path d="M9 11L12 8L15 11L12 16L9 11Z" fill="#bbf7d0" />
        </svg>
      );
    case 'force_of_nature':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="7.5" fill="#0c4a6e" stroke="#38bdf8" strokeWidth="1.7" />
          <path d="M8 14C10 9 14 9 16 14M12 6V17" stroke="#bae6fd" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case 'frozen_heart':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <polygon points="12,3 19,8 17,18 12,21 7,18 5,8" fill="#0891b2" stroke="#67e8f9" strokeWidth="1.6" />
          <path d="M12 6V18M7.5 10L16.5 14M16.5 10L7.5 14" stroke="#ecfeff" strokeWidth="1.5" />
        </svg>
      );
    case 'banshees_veil':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="8" fill="#3b0764" stroke="#c084fc" strokeWidth="1.8" />
          <circle cx="12" cy="12" r="4" stroke="#e9d5ff" strokeWidth="1.6" strokeDasharray="3 2" />
        </svg>
      );
    case 'jaksho':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <path d="M5 7L12 3L19 7V15L12 21L5 15V7Z" fill="#581c87" stroke="#d946ef" strokeWidth="1.6" />
          <circle cx="12" cy="12" r="2.6" fill="#f5d0fe" />
        </svg>
      );
    case 'iceborn_gauntlet':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
          <rect x="6" y="7" width="12" height="11" rx="2" fill="#0284c7" stroke="#7dd3fc" strokeWidth="1.6" />
          <path d="M8 7V4M12 7V4M16 7V4" stroke="#bae6fd" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
  }
}
