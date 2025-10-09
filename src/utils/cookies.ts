// Cookie management utilities

export const clearAllCookies = () => {
  // Get all cookies
  const cookies = document.cookie.split(";");

  // Clear each cookie
  for (let cookie of cookies) {
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
    
    // Clear cookie for current domain
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
    
    // Clear cookie for parent domain (if any)
    const domain = window.location.hostname;
    const parts = domain.split('.');
    
    if (parts.length > 2) {
      const parentDomain = '.' + parts.slice(-2).join('.');
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${parentDomain};`;
    }
    
    // Clear cookie for current domain with dot prefix
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${domain};`;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.${domain};`;
  }
  
  console.log('All cookies cleared');
};

export const clearLocalStorage = () => {
  try {
    localStorage.clear();
    console.log('Local storage cleared');
  } catch (error) {
    console.error('Error clearing local storage:', error);
  }
};

export const clearSessionStorage = () => {
  try {
    sessionStorage.clear();
    console.log('Session storage cleared');
  } catch (error) {
    console.error('Error clearing session storage:', error);
  }
};

export const clearAllStorageAndCookies = () => {
  clearAllCookies();
  clearLocalStorage();
  clearSessionStorage();
  
  // Also clear any cached data
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => {
        caches.delete(name);
      });
    });
  }
  
  console.log('All storage and cookies cleared');
};

export const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
};

export const setCookie = (name: string, value: string, days: number = 7) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
};

// Global function for console access
if (typeof window !== 'undefined') {
  (window as any).clearAllData = clearAllStorageAndCookies;
  console.log('💡 Tip: You can clear all cookies and storage by running "clearAllData()" in the console');
}
