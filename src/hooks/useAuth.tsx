import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  enrollMFA: () => Promise<{ error: any; factorId?: string; qrCode?: string }>;
  verifyMFA: (factorId: string, token: string) => Promise<{ error: any }>;
  challengeMFA: (factorId: string) => Promise<{ error: any; challengeId?: string }>;
  verifyMFAChallenge: (factorId: string, challengeId: string, token: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        if (event === 'SIGNED_IN') {
          toast({
            title: "Welcome back!",
            description: "You have successfully signed in.",
          });
        } else if (event === 'SIGNED_OUT') {
          toast({
            title: "Signed out",
            description: "You have been signed out successfully.",
          });
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [toast]);

  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            display_name: displayName
          }
        }
      });
      
      if (error) {
        toast({
          title: "Signup failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Check your email",
          description: "Please check your email for a confirmation link.",
        });
      }
      
      return { error };
    } catch (error: any) {
      toast({
        title: "Signup failed",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        toast({
          title: "Sign in failed",
          description: error.message,
          variant: "destructive",
        });
      }
      
      return { error };
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error: any) {
      toast({
        title: "Sign out failed",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const enrollMFA = async () => {
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'Authenticator App'
      });
      
      if (error) {
        toast({
          title: "MFA enrollment failed",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }
      
      return { 
        error: null, 
        factorId: data.id, 
        qrCode: data.totp.qr_code 
      };
    } catch (error: any) {
      toast({
        title: "MFA enrollment failed",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const verifyMFA = async (factorId: string, token: string) => {
    try {
      const { error } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: factorId,
        code: token
      });
      
      if (error) {
        toast({
          title: "MFA verification failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "MFA enabled",
          description: "Multi-factor authentication has been successfully enabled.",
        });
      }
      
      return { error };
    } catch (error: any) {
      toast({
        title: "MFA verification failed",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const challengeMFA = async (factorId: string) => {
    try {
      const { data, error } = await supabase.auth.mfa.challenge({
        factorId
      });
      
      if (error) {
        toast({
          title: "MFA challenge failed",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }
      
      return { 
        error: null, 
        challengeId: data.id 
      };
    } catch (error: any) {
      toast({
        title: "MFA challenge failed",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const verifyMFAChallenge = async (factorId: string, challengeId: string, token: string) => {
    try {
      const { error } = await supabase.auth.mfa.verify({
        factorId,
        challengeId,
        code: token
      });
      
      if (error) {
        toast({
          title: "MFA verification failed",
          description: error.message,
          variant: "destructive",
        });
      }
      
      return { error };
    } catch (error: any) {
      toast({
        title: "MFA verification failed",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    enrollMFA,
    verifyMFA,
    challengeMFA,
    verifyMFAChallenge,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};