import React, { useState, useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Clock, AlertTriangle } from 'lucide-react';
import { sessionManager, SessionState } from '@/services/sessionManager';

const SessionWarning: React.FC = () => {
  const [sessionState, setSessionState] = useState<SessionState>({
    isActive: false,
    lastActivity: 0,
    timeoutWarning: false,
    remainingTime: 0
  });
  
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    const unsubscribe = sessionManager.subscribe((state) => {
      setSessionState(state);
      
      // Show dialog when warning is triggered and user hasn't dismissed it
      if (state.timeoutWarning && state.isActive && !showDialog) {
        setShowDialog(true);
      }
      
      // Hide dialog when session ends or warning is cleared
      if (!state.timeoutWarning || !state.isActive) {
        setShowDialog(false);
      }
    });

    return unsubscribe;
  }, [showDialog]);

  const handleExtendSession = () => {
    sessionManager.extendSession();
    setShowDialog(false);
  };

  const handleLogout = () => {
    sessionManager.endSession();
    setShowDialog(false);
    // The session manager will trigger logout via the auth context
  };

  const formatTime = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!sessionState.isActive || !sessionState.timeoutWarning) {
    return null;
  }

  return (
    <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Session Timeout Warning
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <div className="flex items-center gap-2 text-amber-600 font-medium">
              <Clock className="h-4 w-4" />
              Your session will expire in {formatTime(sessionState.remainingTime)}
            </div>
            <p>
              For your security, you'll be automatically logged out due to inactivity. 
              Would you like to extend your session?
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel asChild>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="text-destructive hover:text-destructive"
            >
              Logout Now
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button onClick={handleExtendSession}>
              Extend Session
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default SessionWarning;
