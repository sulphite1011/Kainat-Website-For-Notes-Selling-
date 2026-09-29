import React, { useState } from 'react';
import { BookOpen } from 'lucide-react';

interface KainatLogoProps {
  customLogoUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  isLight?: boolean;
}

export const KainatLogo: React.FC<KainatLogoProps> = ({
  customLogoUrl,
  size = 'md',
  showText = true,
  className = '',
  isLight = false,
}) => {
  const [imgError, setImgError] = useState(false);

  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };

  const textClasses = {
    sm: 'text-sm font-bold',
    md: 'text-base font-extrabold',
    lg: 'text-lg font-black',
    xl: 'text-xl font-black',
  };

  const hasValidLogo = customLogoUrl && customLogoUrl.trim() !== '' && !imgError;

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {hasValidLogo ? (
        <div className={`relative rounded-full overflow-hidden border border-emerald-500/30 shadow-sm shrink-0 ${sizeClasses[size]}`}>
          <img
            src={customLogoUrl}
            alt="Kainat Notes Hub Logo"
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        </div>
      ) : (
        <div className={`relative rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 text-white flex items-center justify-center font-black shadow-md shadow-emerald-950/30 shrink-0 ${sizeClasses[size]}`}>
          <BookOpen className="w-1/2 h-1/2" />
        </div>
      )}

      {showText && (
        <div className="flex flex-col leading-tight">
          <span className={`tracking-tight flex items-center gap-1 ${textClasses[size]} ${isLight ? 'text-slate-900' : 'text-white'}`}>
            <span>Kainat</span>
            <span className="text-emerald-500">Notes</span>
          </span>
          <span className={`text-[10px] uppercase font-semibold tracking-wider ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
            Hub & Solved Papers
          </span>
        </div>
      )}
    </div>
  );
};
