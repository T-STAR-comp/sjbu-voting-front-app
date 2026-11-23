import { useEffect, useState } from 'react';
import { Page } from '../types';
import { STUDENT_AUTH_STATE } from '../student_auth_state';

interface HeaderProps {
  currentPage: Page;
  setPage: (page: Page) => void;
  isOffline: boolean;
}

const HamburgerIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const OfflineIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636a9 9 0 010 12.728M5.636 5.636a9 9 0 000 12.728" />
  </svg>
);

const OfflineIndicator = () => (
  <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/20 backdrop-blur-sm rounded-full text-yellow-200 text-sm font-medium border border-yellow-500/30 animate-pulse" aria-live="polite" role="status">
    <OfflineIcon />
    <span>Offline Mode</span>
  </div>
);

const MobileOfflineIndicator = () => (
  <div className="flex items-center gap-2 px-4 py-2.5 text-yellow-800 bg-yellow-100 rounded-lg border border-yellow-200 animate-pulse" aria-live="polite" role="status">
    <OfflineIcon />
    <span className="font-medium">You are currently offline</span>
  </div>
);

const Header = ({ currentPage, setPage, isOffline }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavClick = (page: Page) => {
    setPage(page);
    setIsMenuOpen(false);
  };

  const navItems: { id: Page; label: string }[] = [
    { id: Page.Home, label: 'Home' },
    ...(STUDENT_AUTH_STATE ? [{ id: Page.StudentLogin, label: 'Student Portal' }] : []),
    { id: Page.Results, label: 'Results' },
    { id: Page.Verification, label: 'Verify Vote' }
  ];

  useEffect(() => {
    if (!isMenuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen]);

  return (
    <header className="bg-[#0d3b6f] text-white relative z-30 border-b border-blue-200/20 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 py-3.5 sm:py-4 flex justify-between items-center">
        <div className="flex items-center gap-3 sm:gap-4 group">
          <button
            type="button"
            onClick={() => handleNavClick(Page.Admin)}
            className="relative transition-all duration-200 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded"
            aria-label="Open admin dashboard"
            title="Admin"
          >
            <img
              src="https://res.cloudinary.com/unihousingmw/image/upload/v1757613228/cropped-MALAWI-LOGO_efmzsu.webp"
              alt="DMI logo"
              className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
              onError={(e) => { e.currentTarget.src = '/assets/logo-fallback.png'; }}
            />
          </button>

          <div className="cursor-pointer">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold tracking-tight">
              <button
                type="button"
                onClick={() => handleNavClick(Page.Home)}
                onDoubleClick={() => handleNavClick(Page.AdminLogin)}
                className="text-lg sm:text-xl lg:text-2xl font-semibold tracking-tight text-white hover:text-yellow-200 transition-colors duration-200"
              >
                DMI-SJBU Voting System
              </button>
            </h1>
            <p className="text-xs text-blue-200 font-medium hidden sm:block">Secure &amp; Transparent Elections</p>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-2 lg:gap-4" aria-label="Main navigation">
          {isOffline && <OfflineIndicator />}

          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavClick(item.id)}
              className={`px-4 py-2 rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 ${
                currentPage === item.id
                  ? 'bg-yellow-400/15 text-yellow-200 border border-yellow-300/30'
                  : 'hover:bg-blue-700/40 hover:text-yellow-200'
              }`}
            >
              <span className="relative z-10">{item.label}</span>
            </button>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 rounded-lg text-white hover:bg-blue-700/50 hover:text-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 transition-all duration-300 transform hover:scale-110"
          aria-label="Toggle navigation menu"
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
        >
          <div className="transition-transform duration-300">
            {isMenuOpen ? <CloseIcon /> : <HamburgerIcon />}
          </div>
        </button>
      </div>

      <nav
        id="mobile-navigation"
        className={`md:hidden bg-[#0f3c70] absolute top-full left-0 w-full shadow-md border-t border-blue-200/20 transform transition-all duration-200 ease-out ${
          isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
        }`}
        aria-hidden={!isMenuOpen}
      >
        <div className="px-4 py-4 space-y-2">
          {isOffline && (
            <div className="mb-3">
              <MobileOfflineIndicator />
            </div>
          )}

          {navItems.map((item, index) => (
            <button
              key={item.id}
              type="button"
              tabIndex={isMenuOpen ? 0 : -1}
              onClick={() => handleNavClick(item.id)}
              className={`block w-full text-left px-4 py-3 rounded-md text-base font-medium transition-all duration-200 focus:outline-none ${
                currentPage === item.id
                  ? 'bg-yellow-400/15 text-yellow-200'
                  : 'hover:bg-blue-700/40 hover:text-yellow-200'
              }`}
              style={{
                animationDelay: `${index * 50}ms`,
                animation: isMenuOpen ? 'slideIn 0.2s ease-out forwards' : 'none'
              }}
            >
              <span className="relative z-10">
                {item.label}
                {currentPage === item.id && (
                  <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-yellow-300 rounded-full"></span>
                )}
              </span>
            </button>
          ))}
        </div>
      </nav>

    </header>
  );
};

export default Header;