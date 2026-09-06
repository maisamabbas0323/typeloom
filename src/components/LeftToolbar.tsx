import React from 'react';
import { Keyboard, History, Settings, User } from 'lucide-react';
import { motion } from 'motion/react';
import { TypeloomIcon } from './Icons';
import { useProfileStore } from '../store/useProfileStore';

export type ActiveTab = 'types' | 'history' | 'settings' | 'profile';

interface LeftToolbarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  isTyping: boolean;
}

interface NavItem {
  id: ActiveTab;
  label: string;
  tooltip: string;
  icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
}

const PRIMARY_TABS: NavItem[] = [
  {
    id: 'types',
    label: 'Types',
    tooltip: 'Typing Surface',
    icon: Keyboard,
  },
  {
    id: 'history',
    label: 'History',
    tooltip: 'History & Analytics',
    icon: History,
  },
  {
    id: 'settings',
    label: 'Settings',
    tooltip: 'Preferences & Themes',
    icon: Settings,
  },
];

export const LeftToolbar: React.FC<LeftToolbarProps> = ({
  activeTab,
  onTabChange,
  isTyping,
}) => {
  const { isLoggedIn, fullName, username, avatarColor } = useProfileStore();

  return (
    <nav
      id="responsive-sidebar-menu"
      aria-label="Responsive Sidebar Menu"
      className={`fixed z-50 transition-all duration-300 select-none
        left-3 sm:left-5 md:left-7 lg:left-10 xl:left-12 top-1/2 -translate-y-1/2
        flex flex-col items-center justify-between
        w-14 sm:w-16 md:w-18 py-4 sm:py-5 px-2 sm:px-2.5
        rounded-2xl sm:rounded-3xl border
        backdrop-blur-2xl shadow-2xl ${
          isTyping ? 'opacity-75 hover:opacity-100 scale-95 hover:scale-100' : 'opacity-100 scale-100'
        }`}
      style={{
        backgroundColor: 'var(--surface)',
        borderColor: 'var(--border)',
        boxShadow:
          '0 20px 45px -12px rgba(0, 0, 0, 0.35), 0 0 1px 1px var(--border)',
      }}
    >
      {/* Top: TYPELOOM Logo Badge */}
      <div className="relative group flex items-center justify-center mb-3 sm:mb-4">
        <button
          id="sidebar-logo-badge"
          type="button"
          onClick={() => onTabChange('types')}
          aria-label="TYPELOOM"
          className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center shadow-sm transition-transform duration-200 group-hover:scale-110 active:scale-95 outline-none cursor-pointer border"
          style={{
            backgroundColor: 'var(--surface-2)',
            borderColor: 'var(--border)',
            color: 'var(--accent)',
          }}
        >
          <TypeloomIcon size={22} className="transition-transform group-hover:rotate-12" />
        </button>

        {/* Responsive Floating Tooltip */}
        <div
          role="tooltip"
          className="absolute pointer-events-none opacity-0 invisible scale-90 group-hover:opacity-100 group-hover:visible group-hover:scale-100 transition-all duration-150 ease-out z-50
            left-full ml-3 top-1/2 -translate-y-1/2
            px-2.5 py-1.5 rounded-lg text-xs font-semibold border shadow-xl whitespace-nowrap flex items-center"
          style={{
            backgroundColor: 'var(--surface-2)',
            borderColor: 'var(--border)',
            color: 'var(--text)',
            backdropFilter: 'blur(16px)',
          }}
        >
          <span>TYPELOOM</span>
          <span
            className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-y-4 border-y-transparent border-r-4"
            style={{ borderRightColor: 'var(--border)' }}
          />
        </div>
      </div>

      {/* Middle: Navigation Tabs */}
      <div className="flex flex-col items-center gap-2.5 sm:gap-3 w-full">
        {PRIMARY_TABS.map((tab) => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <div key={tab.id} className="relative group flex items-center justify-center w-full">
              <button
                id={`sidebar-tab-${tab.id}`}
                type="button"
                onClick={() => onTabChange(tab.id)}
                aria-label={tab.label}
                aria-current={isActive ? 'page' : undefined}
                className={`relative w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-200 outline-none cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${
                  isActive
                    ? 'shadow-md text-white font-bold'
                    : 'hover:bg-[var(--surface-2)]'
                }`}
                style={{
                  color: isActive ? '#ffffff' : 'var(--sub)',
                }}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-sidebar-pill"
                    className="absolute inset-0 rounded-xl sm:rounded-2xl shadow-sm"
                    style={{
                      backgroundColor: 'var(--accent)',
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 500,
                      damping: 35,
                    }}
                  />
                )}

                <span className="relative z-10 flex items-center justify-center">
                  <IconComponent
                    size={22}
                    strokeWidth={isActive ? 2.4 : 1.9}
                    className="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-200 group-hover:scale-110"
                    style={{
                      color: isActive ? '#ffffff' : undefined,
                    }}
                  />
                </span>
              </button>

              {/* Floating Pill Tooltip */}
              <div
                role="tooltip"
                className="absolute pointer-events-none opacity-0 invisible scale-90 group-hover:opacity-100 group-hover:visible group-hover:scale-100 group-focus-within:opacity-100 group-focus-within:visible group-focus-within:scale-100 transition-all duration-150 ease-out z-50
                  left-full ml-3 top-1/2 -translate-y-1/2
                  px-2.5 py-1.5 rounded-lg text-xs font-semibold border shadow-xl whitespace-nowrap flex items-center"
                style={{
                  backgroundColor: 'var(--surface-2)',
                  borderColor: 'var(--border)',
                  color: 'var(--text)',
                  backdropFilter: 'blur(16px)',
                }}
              >
                <span>{tab.tooltip}</span>
                <span
                  className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-y-4 border-y-transparent border-r-4"
                  style={{ borderRightColor: 'var(--border)' }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Gap Divider */}
      <div className="w-6 sm:w-8 h-px my-3 sm:my-4 opacity-50" style={{ backgroundColor: 'var(--border)' }} />

      {/* Bottom: Typist Profile Tab */}
      <div className="flex flex-col items-center gap-2.5 sm:gap-3 w-full">
        <div className="relative group flex items-center justify-center w-full">
          <button
            id="sidebar-tab-profile"
            type="button"
            onClick={() => onTabChange('profile')}
            aria-label={isLoggedIn ? `Profile: ${fullName || username}` : 'Typist Profile'}
            aria-current={activeTab === 'profile' ? 'page' : undefined}
            className={`relative w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-200 outline-none cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${
              activeTab === 'profile'
                ? 'shadow-md text-white font-bold'
                : 'hover:bg-[var(--surface-2)]'
            }`}
            style={{
              color: activeTab === 'profile' ? '#ffffff' : 'var(--sub)',
            }}
          >
            {activeTab === 'profile' && (
              <motion.div
                layoutId="active-sidebar-pill"
                className="absolute inset-0 rounded-xl sm:rounded-2xl shadow-sm"
                style={{
                  backgroundColor: 'var(--accent)',
                }}
                transition={{
                  type: 'spring',
                  stiffness: 500,
                  damping: 35,
                }}
              />
            )}

            <span className="relative z-10 flex items-center justify-center">
              {isLoggedIn ? (
                <span
                  className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-xs"
                  style={{ backgroundColor: avatarColor || 'var(--accent)' }}
                >
                  {(fullName || username || 'U').charAt(0).toUpperCase()}
                </span>
              ) : (
                <User
                  size={22}
                  strokeWidth={activeTab === 'profile' ? 2.4 : 1.9}
                  className="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-200 group-hover:scale-110"
                  style={{
                    color: activeTab === 'profile' ? '#ffffff' : undefined,
                  }}
                />
              )}
            </span>
          </button>

          {/* Profile Tooltip */}
          <div
            role="tooltip"
            className="absolute pointer-events-none opacity-0 invisible scale-90 group-hover:opacity-100 group-hover:visible group-hover:scale-100 group-focus-within:opacity-100 group-focus-within:visible group-focus-within:scale-100 transition-all duration-150 ease-out z-50
              left-full ml-3 top-1/2 -translate-y-1/2
              px-2.5 py-1 rounded-lg text-xs font-semibold border shadow-xl whitespace-nowrap flex items-center"
            style={{
              backgroundColor: 'var(--surface-2)',
              borderColor: 'var(--border)',
              color: 'var(--text)',
              backdropFilter: 'blur(16px)',
            }}
          >
            <span>{isLoggedIn ? (fullName || username) : 'Typist Profile'}</span>
            <span
              className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-y-4 border-y-transparent border-r-4"
              style={{ borderRightColor: 'var(--border)' }}
            />
          </div>
        </div>
      </div>
    </nav>
  );
};
