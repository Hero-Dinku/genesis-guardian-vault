import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Loader2, Shield, QrCode } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const signUpSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  displayName: z.string().min(2, 'Display name must be at least 2 characters'),
});

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

const Auth = () => {
  const { user, loading, signUp, signIn, enrollMFA, verifyMFA, challengeMFA, verifyMFAChallenge } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [mfaStep, setMfaStep] = useState<'none' | 'enroll' | 'verify' | 'challenge'>('none');
  const [mfaData, setMfaData] = useState<{ factorId?: string; qrCode?: string; challengeId?: string }>({});
  const [mfaToken, setMfaToken] = useState('');

  const signUpForm = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: '',
      password: '',
      displayName: '',
    },
  });

  const signInForm = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    if (user && !loading && mfaStep === 'none') {
      navigate('/');
    }
  }, [user, loading, navigate, mfaStep]);

  const onSignUp = async (values: z.infer<typeof signUpSchema>) => {
    setIsLoading(true);
    const { error } = await signUp(values.email, values.password, values.displayName);
    setIsLoading(false);
    
    if (!error) {
      signUpForm.reset();
    }
  };

  const onSignIn = async (values: z.infer<typeof signInSchema>) => {
    setIsLoading(true);
    const { error } = await signIn(values.email, values.password);
    setIsLoading(false);
    
    if (!error) {
      signInForm.reset();
    }
  };

  const handleEnrollMFA = async () => {
    setIsLoading(true);
    const { error, factorId, qrCode } = await enrollMFA();
    setIsLoading(false);
    
    if (!error && factorId && qrCode) {
      setMfaData({ factorId, qrCode });
      setMfaStep('enroll');
    }
  };

  const handleVerifyMFA = async () => {
    if (!mfaData.factorId || !mfaToken) return;
    
    setIsLoading(true);
    const { error } = await verifyMFA(mfaData.factorId, mfaToken);
    setIsLoading(false);
    
    if (!error) {
      setMfaStep('none');
      setMfaToken('');
      navigate('/');
    }
  };

  const handleChallengeMFA = async () => {
    if (!mfaData.factorId) return;
    
    setIsLoading(true);
    const { error, challengeId } = await challengeMFA(mfaData.factorId);
    setIsLoading(false);
    
    if (!error && challengeId) {
      setMfaData(prev => ({ ...prev, challengeId }));
      setMfaStep('challenge');
    }
  };

  const handleVerifyMFAChallenge = async () => {
    if (!mfaData.factorId || !mfaData.challengeId || !mfaToken) return;
    
    setIsLoading(true);
    const { error } = await verifyMFAChallenge(mfaData.factorId, mfaData.challengeId, mfaToken);
    setIsLoading(false);
    
    if (!error) {
      setMfaStep('none');
      setMfaToken('');
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (mfaStep === 'enroll') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Setup MFA
            </CardTitle>
            <CardDescription>
              Scan the QR code with your authenticator app and enter the verification code
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mfaData.qrCode && (
              <div className="flex justify-center">
                <img src={mfaData.qrCode} alt="MFA QR Code" className="w-48 h-48" />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="mfa-token">Verification Code</Label>
              <InputOTP 
                value={mfaToken} 
                onChange={setMfaToken}
                maxLength={6}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setMfaStep('none')}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleVerifyMFA}
                disabled={isLoading || mfaToken.length !== 6}
                className="flex-1"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (mfaStep === 'challenge') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              MFA Verification
            </CardTitle>
            <CardDescription>
              Enter the verification code from your authenticator app
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mfa-token">Verification Code</Label>
              <InputOTP 
                value={mfaToken} 
                onChange={setMfaToken}
                maxLength={6}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <Button 
              onClick={handleVerifyMFAChallenge}
              disabled={isLoading || mfaToken.length !== 6}
              className="w-full"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify & Sign In'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome</CardTitle>
          <CardDescription>
            Sign in to your account or create a new one
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin" className="space-y-4">
              <Form {...signInForm}>
                <form onSubmit={signInForm.handleSubmit(onSignIn)} className="space-y-4">
                  <FormField
                    control={signInForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input 
                            type="email" 
                            placeholder="Enter your email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={signInForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="Enter your password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sign In'}
                  </Button>
                </form>
              </Form>
              
              {user && (
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    onClick={handleEnrollMFA}
                    disabled={isLoading}
                    className="w-full"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Setup MFA
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-4">
              <Form {...signUpForm}>
                <form onSubmit={signUpForm.handleSubmit(onSignUp)} className="space-y-4">
                  <FormField
                    control={signUpForm.control}
                    name="displayName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Display Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter your display name"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={signUpForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input 
                            type="email" 
                            placeholder="Enter your email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={signUpForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="Create a password (min 6 characters)"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sign Up'}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;