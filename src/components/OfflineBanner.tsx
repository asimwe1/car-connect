import React from 'react';

const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = React.useState<boolean>(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};

const OfflineBanner: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100]">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mt-2 rounded-md border border-yellow-400 bg-yellow-100 text-yellow-900 shadow-sm">
          <div className="flex items-center justify-between gap-3 px-3 py-2">
            <span className="text-sm">
              You are currently offline. Some actions may be unavailable. We\'ll retry automatically when you\'re back online.
            </span>
            <span className="text-xs opacity-75">Offline</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfflineBanner;

