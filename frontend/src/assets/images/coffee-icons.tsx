import React from 'react';

export const CoffeeIcons = {
  latte: (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="latteGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B4513" />
          <stop offset="50%" stopColor="#D2691E" />
          <stop offset="100%" stopColor="#F4A460" />
        </linearGradient>
        <linearGradient id="milkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF8DC" />
          <stop offset="100%" stopColor="#F5F5DC" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="20" fill="url(#latteGrad)" />
      <circle cx="24" cy="20" r="12" fill="url(#milkGrad)" />
      <path d="M12 32 Q24 28 36 32" stroke="#8B4513" strokeWidth="2" fill="none" />
      <circle cx="18" cy="18" r="2" fill="#8B4513" opacity="0.6" />
      <circle cx="30" cy="18" r="2" fill="#8B4513" opacity="0.6" />
    </svg>
  ),
  
  americano: (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="americanoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#654321" />
          <stop offset="100%" stopColor="#8B4513" />
        </linearGradient>
      </defs>
      <rect x="16" y="12" width="16" height="20" rx="8" fill="url(#americanoGrad)" />
      <rect x="18" y="14" width="12" height="16" rx="6" fill="#654321" />
      <path d="M20 36 L28 36" stroke="#654321" strokeWidth="2" />
      <circle cx="22" cy="22" r="1" fill="#F5F5DC" />
      <circle cx="26" cy="22" r="1" fill="#F5F5DC" />
    </svg>
  ),
  
  cappuccino: (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="cappuccinoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B4513" />
          <stop offset="50%" stopColor="#D2691E" />
          <stop offset="100%" stopColor="#F4A460" />
        </linearGradient>
        <linearGradient id="foamGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF8DC" />
          <stop offset="100%" stopColor="#F5F5DC" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="18" fill="url(#cappuccinoGrad)" />
      <circle cx="24" cy="18" r="14" fill="url(#foamGrad)" />
      <path d="M10 30 Q24 26 38 30" stroke="#8B4513" strokeWidth="2" fill="none" />
      <circle cx="16" cy="16" r="1.5" fill="#8B4513" opacity="0.7" />
      <circle cx="32" cy="16" r="1.5" fill="#8B4513" opacity="0.7" />
    </svg>
  ),
  
  greenTea: (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="teaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#228B22" />
          <stop offset="100%" stopColor="#32CD32" />
        </linearGradient>
        <linearGradient id="leafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#90EE90" />
          <stop offset="100%" stopColor="#98FB98" />
        </linearGradient>
      </defs>
      <rect x="20" y="12" width="8" height="24" rx="4" fill="url(#teaGrad)" />
      <ellipse cx="24" cy="16" rx="12" ry="8" fill="url(#leafGrad)" />
      <path d="M16 20 Q24 16 32 20" stroke="#228B22" strokeWidth="1.5" fill="none" />
      <path d="M18 24 Q24 20 30 24" stroke="#228B22" strokeWidth="1.5" fill="none" />
    </svg>
  ),
  
  tiramisu: (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <defs>
        <linearGradient id="tiramisuGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#DEB887" />
          <stop offset="50%" stopColor="#F5DEB3" />
          <stop offset="100%" stopColor="#FFE4B5" />
        </linearGradient>
        <linearGradient id="coffeeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B4513" />
          <stop offset="100%" stopColor="#654321" />
        </linearGradient>
      </defs>
      <rect x="12" y="16" width="24" height="16" rx="4" fill="url(#tiramisuGrad)" />
      <rect x="14" y="18" width="20" height="2" fill="url(#coffeeGrad)" />
      <rect x="14" y="22" width="20" height="2" fill="url(#coffeeGrad)" />
      <rect x="14" y="26" width="20" height="2" fill="url(#coffeeGrad)" />
      <circle cx="20" cy="20" r="1" fill="#F5F5DC" />
      <circle cx="28" cy="20" r="1" fill="#F5F5DC" />
      <circle cx="24" cy="24" r="1" fill="#F5F5DC" />
    </svg>
  ),
  
  croissant: (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="croissantGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="50%" stopColor="#FFA500" />
          <stop offset="100%" stopColor="#FF8C00" />
        </linearGradient>
      </defs>
      <path d="M24 8 C32 8, 40 16, 40 24 C40 32, 32 40, 24 40 C16 40, 8 32, 8 24 C8 16, 16 8, 24 8 Z" fill="url(#croissantGrad)" />
      <path d="M20 12 C28 12, 36 20, 36 28 C36 36, 28 36, 20 36 C12 36, 12 28, 12 20 C12 12, 20 12, 20 12 Z" fill="#FFE4B5" />
      <path d="M16 16 C24 16, 32 24, 32 32 C32 32, 24 32, 16 32 C16 32, 16 24, 16 16 Z" fill="#FFD700" />
    </svg>
  )
};

export default CoffeeIcons;
