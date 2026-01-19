
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';

const CreateDate = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  // Form state
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [description, setDescription] = useState('');
  const [depositAmount, setDepositAmount] = useState('50');
  const [targetUserId, setTargetUserId] = useState('');
  const [availableProfiles, setAvailableProfiles] = useState<any[]>([]);
  
  // Check if user is authenticated
  if (!user) {
    navigate('/auth');
    return null;
  }

  // Load available profiles when component mounts
  useEffect(() => {
    loadAvailableProfiles();
  }, [user]);

  const loadAvailableProfiles = async () => {
    if (!user) return;
    
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('user_id, full_name, age, location')
        .neq('user_id', user.id);

      if (error) {
        console.error('Error loading profiles:', error);
      } else {
        setAvailableProfiles(profiles || []);
      }
    } catch (error) {
      console.error('Error loading profiles:', error);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a date request.",
        variant: "destructive",
      });
      return;
    }

    if (!targetUserId) {
      toast({
        title: "Error",
        description: "Please select someone to send the date request to.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Combine date and time into a single datetime string
      const dateTime = new Date(`${date}T${time}`).toISOString();
      
      // Create the date request
      const { error: createError } = await supabase
        .from('date_requests')
        .insert({
          requester_id: user.id,
          requested_id: targetUserId,
          date_time: dateTime,
          location: location,
          deposit_amount: parseInt(depositAmount),
          description: description,
          status: 'pending'
        });

      if (createError) {
        console.error('Error creating date request:', createError);
        toast({
          title: "Error",
          description: "Failed to create date request. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Date Request Created! 🎉",
          description: "Your date proposal has been sent successfully!",
        });
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error creating date request:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Layout>
      <div className="max-w-md mx-auto py-12">
        <div className="text-center mb-8">
          <span className="inline-block p-3 bg-coral-100 text-coral-600 rounded-full mb-4">
            <Calendar size={24} />
          </span>
          <h1 className="text-3xl font-bold">Create a Date</h1>
          <p className="text-gray-600 mt-2">Set up a secure date with a deposit</p>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="targetUser" className="text-sm font-medium">Send Date Request To</label>
              <select 
                id="targetUser"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                value={targetUserId}
                onChange={(e) => setTargetUserId(e.target.value)}
                required
              >
                <option value="">Select someone to send a date request to</option>
                {availableProfiles.map((profile) => (
                  <option key={profile.user_id} value={profile.user_id}>
                    {profile.full_name} ({profile.age}, {profile.location})
                  </option>
                ))}
              </select>
              {availableProfiles.length === 0 && (
                <p className="text-xs text-gray-500">No other profiles available. Check back later!</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="location" className="text-sm font-medium">Location</label>
              <Input 
                id="location"
                placeholder="e.g. Central Park Coffee Shop"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="date" className="text-sm font-medium">Date</label>
                <Input 
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="time" className="text-sm font-medium">Time</label>
                <Input 
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">Description</label>
              <textarea 
                id="description"
                className="flex h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="What are you planning to do on this date?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="depositAmount" className="text-sm font-medium">Security Deposit Amount ($)</label>
              <Input 
                id="depositAmount"
                type="number"
                min="10"
                step="5"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                required
              />
              <p className="text-xs text-gray-500">This amount will be held as a security deposit and returned after the date.</p>
            </div>
            
            <div className="bg-coral-50 rounded-lg p-4">
              <h3 className="font-medium text-coral-800 mb-2">How Security Deposits Work</h3>
              <ul className="text-sm text-coral-700 space-y-1">
                <li>• Both parties place a deposit to ensure commitment</li>
                <li>• Deposits are returned in full after the date is completed</li>
                <li>• If you cancel with less than 24 hours notice, the deposit is forfeited</li>
              </ul>
            </div>
            
            <Button type="submit" className="w-full bg-coral-500 hover:bg-coral-600 text-white" disabled={isLoading}>
              {isLoading ? 'Creating date...' : 'Create Date Proposal'}
            </Button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default CreateDate;
