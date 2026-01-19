
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import AuthLayout from '@/components/layout';

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // Form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerAge, setRegisterAge] = useState('');
  const [registerLocation, setRegisterLocation] = useState('');
  const [registerGender, setRegisterGender] = useState('');
  
  // Login handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // For MVP we'll simulate a successful login
    setTimeout(() => {
      // Store basic user auth in localStorage for MVP
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userEmail', loginEmail);
      localStorage.setItem('userName', 'God');
      
      setIsLoading(false);
      toast({
        title: "Login successful",
        description: "Welcome back to DatePay!",
      });
      navigate('/dashboard');
    }, 1500);
  };
  
  // Register handler
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // For MVP we'll simulate a successful registration
    setTimeout(() => {
      // Store basic user auth in localStorage for MVP
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userEmail', registerEmail);
      localStorage.setItem('userName', registerName);
      
      setIsLoading(false);
      toast({
        title: "Registration successful",
        description: "Your account has been created!",
      });
      
      // Generate a unique referral code for the user
      localStorage.setItem('referralCode', `${registerName.substring(0, 3).toUpperCase()}${Math.floor(Math.random() * 1000)}`);
      
      navigate('/dashboard');
    }, 1500);
  };
  
  // If already logged in, redirect to dashboard
  if (localStorage.getItem('isAuthenticated') === 'true') {
    navigate('/dashboard');
    return null;
  }

  return (
    <Layout>
      <div className="w-full max-w-md mx-auto py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Welcome to DatePay</h1>
          <p className="text-gray-600 mt-2">Sign in or create an account to get started</p>
        </div>
        
        <div className="bg-white shadow-md rounded-xl p-6 border border-gray-100">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">Email</label>
                  <Input 
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="text-sm font-medium">Password</label>
                    <a href="#" className="text-sm text-coral-600 hover:underline">Forgot password?</a>
                  </div>
                  <Input 
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </div>
                
                <Button type="submit" className="w-full bg-coral-500 hover:bg-coral-600 text-white" disabled={isLoading}>
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="reg-name" className="text-sm font-medium">Full Name</label>
                  <Input 
                    id="reg-name"
                    type="text"
                    placeholder="John Doe"
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="reg-email" className="text-sm font-medium">Email</label>
                  <Input 
                    id="reg-email"
                    type="email"
                    placeholder="your@email.com"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="reg-age" className="text-sm font-medium">Age</label>
                    <Input 
                      id="reg-age"
                      type="number"
                      min="18"
                      placeholder="25"
                      value={registerAge}
                      onChange={(e) => setRegisterAge(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="reg-gender" className="text-sm font-medium">Gender</label>
                    <select 
                      id="reg-gender"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      value={registerGender}
                      onChange={(e) => setRegisterGender(e.target.value)}
                      required
                    >
                      <option value="">Select</option>
                      <option value="female">Female</option>
                      <option value="male">Male</option>
                      <option value="non-binary">Non-binary</option>
                    </select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="reg-location" className="text-sm font-medium">Location</label>
                  <Input 
                    id="reg-location"
                    type="text"
                    placeholder="New York, NY"
                    value={registerLocation}
                    onChange={(e) => setRegisterLocation(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="reg-password" className="text-sm font-medium">Password</label>
                  <Input 
                    id="reg-password"
                    type="password"
                    placeholder="••••••••"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    required
                  />
                </div>
                
                <Button type="submit" className="w-full bg-coral-500 hover:bg-coral-600 text-white" disabled={isLoading}>
                  {isLoading ? 'Creating account...' : 'Create account'}
                </Button>
                
                <p className="text-xs text-center text-gray-500 mt-4">
                  By creating an account, you agree to our <a href="#" className="text-coral-600 hover:underline">Terms</a> and <a href="#" className="text-coral-600 hover:underline">Privacy Policy</a>.
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default Auth;
