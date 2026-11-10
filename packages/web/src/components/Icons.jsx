/* Ikon garis tipis, digambar tangan dalam SVG kecil. */

const base = { width: 16, height: 16, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, 'aria-hidden': true, focusable: 'false' };

export const Asterisk = ({ size = 16, ...p }) => (
  <svg {...base} width={size} height={size} strokeLinecap="square" {...p}>
    <path d="M8 1.5v13M2.4 4.75l11.2 6.5M2.4 11.25l11.2-6.5" />
  </svg>
);

/** Bintang untuk checkbox kartu: terisi = aktif. */
export const Star = ({ filled, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true" focusable="false">
    <path
      d="M10 1.8l2.35 5.2 5.65.6-4.23 3.8 1.2 5.6L10 14.15 5.03 17l1.2-5.6L2 7.6l5.65-.6z"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinejoin="miter"
    />
  </svg>
);

export const ArrowDown = (p) => (
  <svg {...base} {...p}>
    <path d="M8 2v11M3.5 8.5L8 13l4.5-4.5" />
  </svg>
);

export const ArrowRight = (p) => (
  <svg {...base} {...p}>
    <path d="M2 8h11M8.5 3.5L13 8l-4.5 4.5" />
  </svg>
);

export const ArrowUpRight = (p) => (
  <svg {...base} {...p}>
    <path d="M4 12L12 4M5.5 4H12v6.5" />
  </svg>
);

export const Copy = (p) => (
  <svg {...base} {...p}>
    <rect x="5.25" y="5.25" width="8" height="8" />
    <path d="M10.75 2.75h-8v8" />
  </svg>
);

export const Download = (p) => (
  <svg {...base} {...p}>
    <path d="M8 2v8.5M4.5 7L8 10.5 11.5 7M2.5 13.5h11" />
  </svg>
);

export const Check = (p) => (
  <svg {...base} {...p}>
    <path d="M2.5 8.5l3.5 3.5 7.5-8" />
  </svg>
);

export const Eye = (p) => (
  <svg {...base} {...p}>
    <path d="M1.5 8S4 3.5 8 3.5 14.5 8 14.5 8 12 12.5 8 12.5 1.5 8 1.5 8z" />
    <circle cx="8" cy="8" r="2" />
  </svg>
);

export const Trash = (p) => (
  <svg {...base} {...p}>
    <path d="M2.5 4h11M6 4V2.5h4V4M4 4l.75 9.5h6.5L12 4" />
  </svg>
);

export const Sun = (p) => (
  <svg {...base} {...p}>
    <circle cx="8" cy="8" r="3" />
    <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3 3l1.4 1.4M11.6 11.6L13 13M3 13l1.4-1.4M11.6 4.4L13 3" />
  </svg>
);

export const Moon = (p) => (
  <svg {...base} {...p}>
    <path d="M13.5 9.5A5.5 5.5 0 016.5 2.5a5.5 5.5 0 107 7z" />
  </svg>
);

export const Scissors = (p) => (
  <svg {...base} {...p}>
    <circle cx="4" cy="4" r="2" />
    <circle cx="4" cy="12" r="2" />
    <path d="M5.6 5.2L14 12M5.6 10.8L14 4" />
  </svg>
);
