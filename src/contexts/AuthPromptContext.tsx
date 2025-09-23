import React, { createContext, useContext, useMemo, useState } from 'react';

type PromptOptions = { redirectTo?: string };

type AuthPromptContextValue = {
  showPrompt: (opts?: PromptOptions) => void;
};

const AuthPromptContext = createContext<AuthPromptContextValue | undefined>(undefined);

export const useAuthPrompt = () => {
  const ctx = useContext(AuthPromptContext);
  if (!ctx) throw new Error('useAuthPrompt must be used within AuthPromptProvider');
  return ctx;
};

export const AuthPromptProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [redirectTo, setRedirectTo] = useState<string | undefined>(undefined);

  const showPrompt = (opts?: PromptOptions) => {
    setRedirectTo(opts?.redirectTo);
    setOpen(true);
  };

  const value = useMemo(() => ({ showPrompt }), []);

  return (
    <AuthPromptContext.Provider value={value}>
      {children}
      <AuthPromptModal open={open} setOpen={setOpen} redirectTo={redirectTo} />
    </AuthPromptContext.Provider>
  );
};

// Inline modal to avoid separate file imports
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const AuthPromptModal: React.FC<{ open: boolean; setOpen: (v: boolean) => void; redirectTo?: string }> = ({ open, setOpen, redirectTo }) => {
  const navigate = useNavigate();

  const go = (path: string) => {
    setOpen(false);
    const url = redirectTo ? `${path}?next=${encodeURIComponent(redirectTo)}` : path;
    navigate(url);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">Join CarHub</DialogTitle>
          <DialogDescription>
            Create an account or sign in to continue. You'll be redirected back to your action.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Button className="btn-hero" onClick={() => go('/signup')}>Sign up</Button>
          <Button variant="outline" onClick={() => go('/signin')}>Sign in</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthPromptContext;


