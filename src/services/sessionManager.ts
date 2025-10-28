// Session Management Service
// Handles session timeout, activity tracking, and automatic logout

interface SessionConfig {
  timeoutMinutes: number;
  warningMinutes: number;
  checkIntervalSeconds: number;
}

interface SessionState {
  isActive: boolean;
  lastActivity: number;
  timeoutWarning: boolean;
  remainingTime: number;
}

class SessionManager {
  private config: SessionConfig = {
    timeoutMinutes: 60, // 60 minutes session timeout
    warningMinutes: 5,  // Show warning 5 minutes before timeout
    checkIntervalSeconds: 60 // Check every 60 seconds
  };

  private state: SessionState = {
    isActive: false,
    lastActivity: Date.now(),
    timeoutWarning: false,
    remainingTime: 0
  };

  private timeoutId: NodeJS.Timeout | null = null;
  private checkIntervalId: NodeJS.Timeout | null = null;
  private listeners: ((state: SessionState) => void)[] = [];
  private onLogout: (() => void) | null = null;

  constructor(config?: Partial<SessionConfig>) {
    this.config = { ...this.config, ...config };
    this.setupActivityListeners();
  }

  private setupActivityListeners() {
    // Track user activity
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
      this.updateActivity();
    };

    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Clean up on page unload
    window.addEventListener('beforeunload', () => {
      this.cleanup();
    });
  }

  private updateActivity() {
    const now = Date.now();
    this.state.lastActivity = now;
    this.state.timeoutWarning = false;
    
    // Reset timeout
    if (this.state.isActive) {
      this.resetTimeout();
      
      // Refresh user session expiration on activity
      if (typeof window !== 'undefined') {
        try {
          // Import authStorage dynamically to avoid circular dependency
          const authStorageModule = (window as any).authStorage;
          if (authStorageModule && authStorageModule.refreshExpiration) {
            authStorageModule.refreshExpiration();
          }
        } catch (error) {
          // Ignore errors - this is just a nice-to-have feature
        }
      }
    }
    
    this.notifyListeners();
  }

  private resetTimeout() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    const timeoutMs = this.config.timeoutMinutes * 60 * 1000;
    
    this.timeoutId = setTimeout(() => {
      this.handleTimeout();
    }, timeoutMs);
  }

  private handleTimeout() {
    console.log('Session timeout - logging out user');
    this.state.isActive = false;
    this.state.timeoutWarning = false;
    
    if (this.onLogout) {
      this.onLogout();
    }
    
    this.notifyListeners();
    this.cleanup();
  }

  private startPeriodicCheck() {
    if (this.checkIntervalId) {
      clearInterval(this.checkIntervalId);
    }

    this.checkIntervalId = setInterval(() => {
      this.checkSessionStatus();
    }, this.config.checkIntervalSeconds * 1000);
  }

  private checkSessionStatus() {
    if (!this.state.isActive) return;

    const now = Date.now();
    const timeSinceActivity = now - this.state.lastActivity;
    const timeoutMs = this.config.timeoutMinutes * 60 * 1000;
    const warningMs = this.config.warningMinutes * 60 * 1000;
    
    this.state.remainingTime = Math.max(0, timeoutMs - timeSinceActivity);
    
    // Show warning if approaching timeout
    if (this.state.remainingTime <= warningMs && this.state.remainingTime > 0) {
      if (!this.state.timeoutWarning) {
        this.state.timeoutWarning = true;
        console.log(`Session warning: ${Math.ceil(this.state.remainingTime / 60000)} minutes remaining`);
      }
    }

    this.notifyListeners();
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener({ ...this.state }));
  }

  private cleanup() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    
    if (this.checkIntervalId) {
      clearInterval(this.checkIntervalId);
      this.checkIntervalId = null;
    }
  }

  // Public API
  startSession() {
    this.state.isActive = true;
    this.state.lastActivity = Date.now();
    this.state.timeoutWarning = false;
    
    this.resetTimeout();
    this.startPeriodicCheck();
    this.notifyListeners();
    
    console.log(`Session started - timeout in ${this.config.timeoutMinutes} minutes`);
  }

  endSession() {
    this.state.isActive = false;
    this.state.timeoutWarning = false;
    this.cleanup();
    this.notifyListeners();
    
    console.log('Session ended');
  }

  extendSession() {
    if (this.state.isActive) {
      this.updateActivity();
      console.log('Session extended');
    }
  }

  subscribe(listener: (state: SessionState) => void) {
    this.listeners.push(listener);
    // Immediately call with current state
    listener({ ...this.state });
    
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  setLogoutHandler(handler: () => void) {
    this.onLogout = handler;
  }

  getSessionInfo(): SessionState {
    return { ...this.state };
  }

  getRemainingTimeFormatted(): string {
    const minutes = Math.floor(this.state.remainingTime / 60000);
    const seconds = Math.floor((this.state.remainingTime % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  // Configuration
  updateConfig(config: Partial<SessionConfig>) {
    this.config = { ...this.config, ...config };
    
    if (this.state.isActive) {
      // Restart with new config
      this.cleanup();
      this.resetTimeout();
      this.startPeriodicCheck();
    }
  }

  getConfig(): SessionConfig {
    return { ...this.config };
  }
}

// Export singleton instance
export const sessionManager = new SessionManager();

// Export types
export type { SessionConfig, SessionState };

// Global access for debugging
if (typeof window !== 'undefined') {
  (window as any).sessionManager = sessionManager;
  console.log('💡 Tip: Access session manager via "sessionManager" in console');
}
