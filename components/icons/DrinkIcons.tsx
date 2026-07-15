import React, { SVGProps } from "react";

// Common props interface
interface DrinkIconProps extends SVGProps<SVGSVGElement> {}

export const BitburgerAlkoholfrei = (props: DrinkIconProps) => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <circle cx="32" cy="32" r="30" fill="#604000" />
    <path d="M22 24h14v22c0 2.2-1.8 4-4 4H26c-2.2 0-4-1.8-4-4V24z" fill="#f0a800" />
    <path d="M36 28h5c2.2 0 4 1.8 4 4v6c0 2.2-1.8 4-4 4h-5" stroke="#f0a800" strokeWidth="3" fill="none" />
    <path d="M19 24c0-2.2 2-5 5-5h10c3 0 5 2.8 5 5H19z" fill="#fff9eb" />
  </svg>
);

export const BitburgerRadlerAlkoholfrei = (props: DrinkIconProps) => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <circle cx="32" cy="32" r="30" fill="#555a0e" />
    <path d="M22 24h14v22c0 2.2-1.8 4-4 4H26c-2.2 0-4-1.8-4-4V24z" fill="#d4e023" />
    <path d="M36 28h5c2.2 0 4 1.8 4 4v6c0 2.2-1.8 4-4 4h-5" stroke="#d4e023" strokeWidth="3" fill="none" />
    <path d="M19 24c0-2.2 2-5 5-5h10c3 0 5 2.8 5 5H19z" fill="#fff9eb" />
    {/* Lemon symbol */}
    <circle cx="29" cy="35" r="6" fill="#ffeb3b" />
    <path d="M29 29v12M23 35h12M25 31l8 8M25 39l8-8" stroke="#fbc02d" strokeWidth="1" />
  </svg>
);

export const KrombacherRadler = (props: DrinkIconProps) => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <circle cx="32" cy="32" r="30" fill="#5d540c" />
    <path d="M22 24h14v22c0 2.2-1.8 4-4 4H26c-2.2 0-4-1.8-4-4V24z" fill="#e8d21f" />
    <path d="M36 28h5c2.2 0 4 1.8 4 4v6c0 2.2-1.8 4-4 4h-5" stroke="#e8d21f" strokeWidth="3" fill="none" />
    <path d="M19 24c0-2.2 2-5 5-5h10c3 0 5 2.8 5 5H19z" fill="#fff9eb" />
    {/* Lemon symbol */}
    <circle cx="29" cy="35" r="6" fill="#ffeb3b" />
    <path d="M29 29v12M23 35h12M25 31l8 8M25 39l8-8" stroke="#f9a825" strokeWidth="1" />
  </svg>
);

export const Veltins = (props: DrinkIconProps) => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <circle cx="32" cy="32" r="30" fill="#57370c" />
    <path d="M22 24h14v22c0 2.2-1.8 4-4 4H26c-2.2 0-4-1.8-4-4V24z" fill="#d98a1f" />
    <path d="M36 28h5c2.2 0 4 1.8 4 4v6c0 2.2-1.8 4-4 4h-5" stroke="#d98a1f" strokeWidth="3" fill="none" />
    <path d="M19 24c0-2.2 2-5 5-5h10c3 0 5 2.8 5 5H19z" fill="#fff9eb" />
  </svg>
);

export const Cola = (props: DrinkIconProps) => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <circle cx="32" cy="32" r="30" fill="#251107" />
    <path d="M22 20h20l-3 30H25l-3-30z" fill="#5c2a12" />
    <path d="M21 20h22v3H21z" fill="#e63946" />
    <path d="M36 20L39 8" stroke="#e63946" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

export const Fanta = (props: DrinkIconProps) => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <circle cx="32" cy="32" r="30" fill="#663300" />
    <path d="M22 20h20l-3 30H25l-3-30z" fill="#ff8100" />
    <path d="M21 20h22v3H21z" fill="#ffffff" />
    <path d="M36 20L39 8" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

export const Fassbrause = (props: DrinkIconProps) => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <circle cx="32" cy="32" r="30" fill="#412813" />
    <path d="M22 20h20l-3 30H25l-3-30z" fill="#a3652f" />
    <path d="M21 20c0-3 3-5 11-5s11 2 11 5H21z" fill="#fff4e6" />
    <circle cx="28" cy="35" r="2" fill="#fff4e6" />
    <circle cx="36" cy="40" r="1.5" fill="#fff4e6" />
  </svg>
);

export const SchofferhoferGrapefruit = (props: DrinkIconProps) => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <circle cx="32" cy="32" r="30" fill="#661e27" />
    <path d="M22 20h20l-3 30H25l-3-30z" fill="#ff4d63" />
    <path d="M21 20h22v3H21z" fill="#ffffff" />
    {/* Grapefruit slice */}
    <circle cx="32" cy="18" r="8" fill="#ff8a99" stroke="#ffffff" strokeWidth="1.5" />
    <path d="M26 18h12M32 12v12M28 14l8 8M28 22l8-8" stroke="#ffffff" strokeWidth="1" />
  </svg>
);

export const Sprite = (props: DrinkIconProps) => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <circle cx="32" cy="32" r="30" fill="#26550a" />
    <path d="M22 20h20l-3 30H25l-3-30z" fill="#5fd619" />
    <path d="M21 20h22v3H21z" fill="#ffffff" />
    <path d="M36 20L39 8" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="28" cy="32" r="2" fill="#ffffff" />
    <circle cx="35" cy="40" r="1.5" fill="#ffffff" />
    <circle cx="29" cy="45" r="1" fill="#ffffff" />
  </svg>
);

export const Wasser = (props: DrinkIconProps) => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <circle cx="32" cy="32" r="30" fill="#114366" />
    <path d="M32 15C32 15 20 30 20 40a12 12 0 0024 0c0-10-12-25-12-25z" fill="#2aa8ff" />
    <path d="M24 40a8 8 0 005 7" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" fill="none" />
  </svg>
);

export const DRINK_ICONS: Record<string, React.FC<DrinkIconProps>> = {
  "Bitburger 0,0": BitburgerAlkoholfrei,
  "Bitburger Radler 0,0": BitburgerRadlerAlkoholfrei,
  "Krombacher Radler": KrombacherRadler,
  "Veltins": Veltins,
  "Cola": Cola,
  "Fanta": Fanta,
  "Fassbrause": Fassbrause,
  "Schöfferhofer Grapefruit": SchofferhoferGrapefruit,
  "Sprite": Sprite,
  "Wasser": Wasser,
};
