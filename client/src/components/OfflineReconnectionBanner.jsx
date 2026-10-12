import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';

export default function OfflineReconnectionBanner() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showReconnected, setShowReconnected] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      const timer = setTimeout(() => setShowReconnected(false), 3000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleManualRetry = () => {
    setIsRetrying(true);
    setTimeout(() => {
      setIsOnline(navigator.onLine);
      setIsRetrying(false);
    }, 1000);
  };

  if (isOnline && !showReconnected) {
    return null;
  }

  if (showReconnected) {
    return (
      <div className="bg-emerald-600 text-white text-xs font-semibold py-1.5 px-4 text-center flex items-center justify-center gap-2 animate-in slide-in-from-top duration-200">
        <Wifi className="w-4 h-4 text-emerald-200" />
        <span>Reconnected to CampusNoa Institutional Cloud.</span>
      </div>
    );
  }

  return (
    <div className="bg-amber-600 text-white text-xs font-semibold py-2 px-4 flex items-center justify-between gap-2 shadow-md animate-in slide-in-from-top duration-200">
      <div className="flex items-center gap-2">
        <WifiOff className="w-4 h-4 text-amber-200 animate-pulse" />
        <span>Network connection interrupted. System will automatically sync once reconnected.</span>
      </div>
      <button
        onClick={handleManualRetry}
        disabled={isRetrying}
        className="px-2.5 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-bold flex items-center gap-1.5 transition"
      >
        <RefreshCw className={`w-3 h-3 ${isRetrying ? 'animate-spin' : ''}`} />
        <span>Retry</span>
      </button>
    </div>
  );
}
