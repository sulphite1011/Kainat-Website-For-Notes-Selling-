import React from 'react';

interface KainatLogoProps {
  customLogoUrl?: string;
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  theme?: 'dark' | 'light';
}

export const KainatLogo: React.FC<KainatLogoProps> = ({
  customLogoUrl,
  size = 'md',
  showSubtitle = true,
  theme = 'dark',
}) => {
  const isLight = theme === 'light';
  const [imgError, setImgError] = React.useState(false);

  // If Kainat uploaded a custom picture for the logo, show it
  if (customLogoUrl && customLogoUrl.trim() !== '' && !imgError) {
    const sizeClasses = {
      sm: 'w-8 h-8 rounded-full aspect-square object-cover ring-2 ring-emerald-500/80 ring-offset-2 ring-offset-zinc-950',
      md: 'w-10 h-10 rounded-full aspect-square object-cover ring-2 ring-emerald-500/80 ring-offset-2 ring-offset-zinc-950',
      lg: 'w-14 h-14 rounded-full aspect-square object-cover ring-2 ring-emerald-500/80 ring-offset-2 ring-offset-zinc-950',
    }[size];

    return (
      <div className="flex items-center gap-2.5">
        <div className="relative shrink-0">
          <img
            src={customLogoUrl}
            alt="Kainat Notes Logo"
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className={`${sizeClasses} ${isLight ? 'ring-offset-white' : ''} shadow-md`}
          />
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-zinc-950" />
        </div>
        {showSubtitle && (
          <div className="hidden sm:block">
            <span className={`text-xs font-bold block leading-tight ${isLight ? 'text-slate-900' : 'text-zinc-200'}`}>
              Kainat Notes
            </span>
            <span className={`text-[10px] block font-mono font-semibold ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>
              Official Store
            </span>
          </div>
        )}
      </div>
    );
  }

  // Stylish Demo Logo with "Kainat" branding
  const iconSizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-13 h-13 text-lg',
  }[size];

  const titleSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
  }[size];

  return (
    <div className="flex items-center gap-2.5 group cursor-pointer select-none">
      {/* Calligraphic Emblem Icon - Circular profile style */}
      <div
        className={`${iconSizes} rounded-full bg-gradient-to-br from-emerald-500 via-teal-500 to-indigo-600 p-[2px] shadow-lg shadow-emerald-950/20 group-hover:scale-105 transition-transform duration-200 ring-2 ring-emerald-500/40`}
      >
        <div className={`w-full h-full ${isLight ? 'bg-slate-900' : 'bg-zinc-950'} rounded-full flex items-center justify-center relative overflow-hidden`}>
          <span className="font-extrabold font-serif bg-gradient-to-r from-emerald-300 to-teal-100 bg-clip-text text-transparent">
            K
          </span>
          <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400/30 rounded-full blur-[2px]" />
        </div>
      </div>

      {/* Wordmark */}
      <div className="leading-tight">
        <div className="flex items-center gap-1.5">
          <span
            className={`${titleSizes} font-black tracking-tight ${
              isLight
                ? 'bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-700 bg-clip-text text-transparent'
                : 'bg-gradient-to-r from-white via-zinc-100 to-emerald-300 bg-clip-text text-transparent'
            }`}
          >
            Kainat
          </span>
          <span className={`text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded font-mono ${
            isLight
              ? 'bg-emerald-100 border border-emerald-300 text-emerald-800'
              : 'bg-emerald-950 border border-emerald-800/80 text-emerald-400'
          }`}>
            Notes
          </span>
        </div>
        {showSubtitle && (
          <span className={`text-[10px] font-medium block ${isLight ? 'text-slate-600' : 'text-zinc-400'}`}>
            Matric · FSc · BSc Curriculum
          </span>
        )}
      </div>
    </div>
  );
};
