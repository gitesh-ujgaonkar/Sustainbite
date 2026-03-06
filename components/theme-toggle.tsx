'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';

export function ThemeToggle() {
    const { theme, setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    if (!mounted) {
        // Prevent hydration mismatch — render a placeholder with same dimensions
        return <div className="w-14 h-7" />;
    }

    const isDark = resolvedTheme === 'dark';

    const toggle = () => {
        setTheme(isDark ? 'light' : 'dark');
    };

    return (
        <button
            onClick={toggle}
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            className="
        relative flex items-center
        w-14 h-7 rounded-full
        bg-gradient-to-r
        transition-all duration-500 ease-in-out
        focus:outline-none focus-visible:ring-2 focus-visible:ring-ring
        cursor-pointer select-none
        dark:from-indigo-900 dark:to-slate-800
        from-amber-100 to-sky-200
        border border-border
        shadow-inner
      "
        >
            {/* Stars (visible in dark mode) */}
            <span className={`
        absolute top-1 left-1.5 text-[6px] transition-opacity duration-300
        ${isDark ? 'opacity-100' : 'opacity-0'}
      `}>✦</span>
            <span className={`
        absolute bottom-1 left-3 text-[5px] transition-opacity duration-300
        ${isDark ? 'opacity-100' : 'opacity-0'}
      `}>✦</span>

            {/* Toggle knob with sun/moon */}
            <span
                className={`
          absolute top-0.5
          w-6 h-6 rounded-full
          flex items-center justify-center
          transition-all duration-500 ease-in-out
          shadow-md
          ${isDark
                        ? 'translate-x-[1.75rem] bg-slate-700'
                        : 'translate-x-0.5 bg-white'
                    }
        `}
            >
                {isDark ? (
                    // Moon
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-300">
                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                    </svg>
                ) : (
                    // Sun
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500">
                        <circle cx="12" cy="12" r="5" />
                        <line x1="12" y1="1" x2="12" y2="3" />
                        <line x1="12" y1="21" x2="12" y2="23" />
                        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                        <line x1="1" y1="12" x2="3" y2="12" />
                        <line x1="21" y1="12" x2="23" y2="12" />
                        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                    </svg>
                )}
            </span>
        </button>
    );
}
