// web/pages/IntroPage.tsx

import * as React from 'react';
import { useState, useEffect } from 'react';
import { Page } from '../types';

interface IntroPageProps {
  setPage: (page: Page) => void;
}

const IntroPage: React.FC<IntroPageProps> = ({ setPage }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(Page.Home);
    }, 3500);

    return () => {
      clearTimeout(timer);
    };
  }, [setPage]);

  return (
    <div className="fixed inset-0 bg-[#0b2344] flex flex-col items-center justify-center z-50 overflow-hidden">
      <div className="absolute inset-0 border border-blue-200/10" />

      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4">
        <div className="relative mb-8 opacity-0 animate-fade-in-scale">
          <img 
            src="https://res.cloudinary.com/unihousingmw/image/upload/v1757613228/cropped-MALAWI-LOGO_efmzsu.webp"
            alt="DMI Logo"
            className="relative w-28 h-28 object-contain"
          />
        </div>

        <div className="space-y-3 opacity-0 animate-fade-in-delay">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white">
            DMI-SJBU
          </h1>
          
          <div className="flex items-center justify-center gap-3">
            <div className="h-px w-10 bg-[#d4af37]"></div>
            <h2 className="text-sm sm:text-base font-medium tracking-[0.2em] text-[#f6d365] uppercase">
              Voting System
            </h2>
            <div className="h-px w-10 bg-[#d4af37]"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntroPage;