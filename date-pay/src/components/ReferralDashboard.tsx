import React, { useState, useEffect } from 'react';
import { Copy, ArrowUpRight, ChevronRight, Users, DollarSign, Award, Share2, Gift, TrendingUp, CheckCircle, Clock, Zap, Sparkles } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from '@/integrations/supabase/client';

interface Referral {
  id: string;
  referred_user: {
    full_name: string;
    profile_image_url?: string;
    created_at: string;
  };
  status: 'pending' | 'completed' | 'rewarded';
  reward_amount: number;
  created_at: string;
  completed_at?: string;
}

interface ReferralStats {
  totalReferrals: number;
  completedReferrals: number;
  pendingReferrals: number;
  totalEarnings: number;
  pendingEarnings: number;
  nextMilestone: number;
  progressToNextMilestone: number;
}


const ReferralDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [stats, setStats] = useState<ReferralStats>({
    totalReferrals: 0,
    completedReferrals: 0,
    pendingReferrals: 0,
    totalEarnings: 0,
    pendingEarnings: 0,
    nextMilestone: 5,
    progressToNextMilestone: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [referralCode, setReferralCode] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    if (user) {
      loadReferralData();
    }
  }, [user]);

  const loadReferralData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      // Load user's referral code
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('referral_code')
        .eq('user_id', user.id)
        .single();

      if (userProfile?.referral_code) {
        setReferralCode(userProfile.referral_code);
      } else {
        // Generate referral code if user doesn't have one
        await generateReferralCode();
      }

      // Load referrals
      const { data: userReferrals, error: referralsError } = await supabase
        .from('referrals')
        .select(`
          id,
          reward_amount,
          created_at,
          completed_at,
          referred_id
        `)
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });

      if (referralsError) {
        throw referralsError;
      }

      if (userReferrals) {
        // Get profile data for all referred users
        const referredUserIds = userReferrals.map(r => r.referred_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name, profile_image_url, created_at')
          .in('user_id', referredUserIds);

        // Combine referral data with profile data
        const processedReferrals = userReferrals.map(ref => ({
          ...ref,
          referred_user: profiles?.find(p => p.user_id === ref.referred_id) || {
            full_name: 'Unknown User',
            profile_image_url: undefined,
            created_at: ref.created_at
          },
          status: ref.completed_at ? 'completed' : 'pending'
        }));

        setReferrals(processedReferrals);
        calculateStats(processedReferrals);
      }

    } catch (error) {
      console.error('Error loading referral data:', error);
      toast({
        title: "Error",
        description: "Failed to load referral data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateReferralCode = async () => {
    if (!user) return;

    try {
      // Generate a unique referral code
      const code = `${user.email?.split('@')[0]?.toUpperCase() || 'USER'}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
      
      const { error } = await supabase
        .from('profiles')
        .update({ referral_code: code })
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      setReferralCode(code);
      toast({
        title: "Referral Code Generated! 🎉",
        description: `Your unique referral code is: ${code}`,
      });

    } catch (error) {
      console.error('Error generating referral code:', error);
      toast({
        title: "Error",
        description: "Failed to generate referral code. Please try again.",
        variant: "destructive",
      });
    }
  };

  const calculateStats = (referralList: Referral[]) => {
    const totalReferrals = referralList.length;
    const completedReferrals = referralList.filter(ref => ref.status === 'completed').length;
    const pendingReferrals = totalReferrals - completedReferrals;
    const totalEarnings = referralList
      .filter(ref => ref.status === 'completed')
      .reduce((sum, ref) => sum + ref.reward_amount, 0);
    const pendingEarnings = referralList
      .filter(ref => ref.status === 'pending')
      .reduce((sum, ref) => sum + ref.reward_amount, 0);

    // Calculate next milestone and progress
    const milestones = [5, 10, 25, 50, 100];
    const nextMilestone = milestones.find(m => m > totalReferrals) || 100;
    const progressToNextMilestone = ((totalReferrals % 5) / 5) * 100;

    setStats({
      totalReferrals,
      completedReferrals,
      pendingReferrals,
      totalEarnings,
      pendingEarnings,
      nextMilestone,
      progressToNextMilestone
    });
  };

  const copyReferralLink = async () => {
    const referralLink = `${window.location.origin}/signup?ref=${referralCode}`;
    
    try {
      await navigator.clipboard.writeText(referralLink);
      toast({
        title: "Copied! 📋",
        description: "Referral link copied to clipboard",
      });
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = referralLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      toast({
        title: "Copied! 📋",
        description: "Referral link copied to clipboard",
      });
    }
  };

  const shareReferral = async () => {
    const referralLink = `${window.location.origin}/signup?ref=${referralCode}`;
    const shareText = `Join DatePay using my referral code: ${referralCode}! Get started with secure dating and earn rewards. ${referralLink}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join DatePay with my referral!',
          text: shareText,
          url: referralLink,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      setShowShareModal(true);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 border-green-200"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getMilestoneReward = (milestone: number) => {
    const rewards: { [key: number]: number } = {
      5: 25,
      10: 50,
      25: 150,
      50: 350,
      100: 1000
    };
    return rewards[milestone] || 0;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden animate-scale-in">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gradient-to-r from-peony-200 to-pink-rose-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl"></div>
              ))}
            </div>
            <div className="h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-scale-in">
        {/* Header with gradient background */}
        <div className="px-6 py-6 bg-gradient-to-r from-peony-500 via-pink-rose-400 to-indigo-500 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center">
                <Sparkles className="h-6 w-6 mr-2" />
                Your Referral Dashboard
              </h2>
              <p className="text-white/90 mt-1">Share the love and earn rewards! 💰</p>
            </div>
            <Button 
              onClick={shareReferral}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
              variant="outline"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
        
        <div className="p-6">
          {/* Stats Cards with vibrant colors */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mb-8">
            <div className="bg-gradient-to-br from-peony-50 to-peony-100 rounded-xl p-6 border border-peony-200 hover:shadow-lg transition-all duration-300">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-peony-700">Total Earnings</p>
                  <p className="text-3xl font-bold text-peony-800">${stats.totalEarnings}</p>
                  <p className="text-xs text-peony-600 mt-1">+${stats.pendingEarnings} pending</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-peony-200 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-peony-700" />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-pink-rose-50 to-pink-rose-100 rounded-xl p-6 border border-pink-rose-200 hover:shadow-lg transition-all duration-300">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-pink-rose-700">Total Referrals</p>
                  <p className="text-3xl font-bold text-pink-rose-800">{stats.totalReferrals}</p>
                  <p className="text-xs text-pink-rose-600 mt-1">{stats.completedReferrals} completed</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-pink-rose-200 flex items-center justify-center">
                  <Users className="h-6 w-6 text-pink-rose-700" />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-6 border border-indigo-200 hover:shadow-lg transition-all duration-300">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-indigo-700">Next Milestone</p>
                  <p className="text-3xl font-bold text-indigo-800">{stats.nextMilestone}</p>
                  <p className="text-xs text-indigo-600 mt-1">+${getMilestoneReward(stats.nextMilestone)} bonus</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-indigo-200 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-indigo-700" />
                </div>
              </div>
            </div>
          </div>

          {/* Progress to Next Milestone */}
          {stats.totalReferrals > 0 && (
            <div className="mb-8 p-6 bg-gradient-to-r from-slate-blue-50 to-indigo-50 rounded-xl border border-slate-blue-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-slate-blue-900 flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-indigo-600" />
                  Progress to {stats.nextMilestone} referrals
                </h3>
                <span className="text-sm font-medium text-slate-blue-700 bg-white px-3 py-1 rounded-full">
                  {stats.totalReferrals}/{stats.nextMilestone}
                </span>
              </div>
              <Progress value={stats.progressToNextMilestone} className="h-3 mb-3" />
              <p className="text-sm text-slate-blue-700">
                {stats.nextMilestone - stats.totalReferrals} more referrals needed for <span className="font-semibold text-indigo-600">${getMilestoneReward(stats.nextMilestone)} bonus!</span> 🎉
              </p>
            </div>
          )}
          
          {/* Referral Link Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Your Referral Link</h3>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={copyReferralLink}
                  className="text-xs border-peony-200 text-peony-600 hover:bg-peony-50"
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copy
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={shareReferral}
                  className="text-xs border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                >
                  <Share2 className="h-3 w-3 mr-1" />
                  Share
                </Button>
              </div>
            </div>
            <div className="flex items-center rounded-xl overflow-hidden border border-gray-200">
              <div className="flex-1 p-4 bg-gray-50 text-gray-700 text-sm font-mono">
                {referralCode ? `${window.location.origin}/signup?ref=${referralCode}` : 'Generating...'}
              </div>
              <Button 
                className="bg-gradient-to-r from-peony-500 to-pink-rose-500 hover:from-peony-600 hover:to-pink-rose-600 text-white rounded-none h-full px-6"
                onClick={() => window.open(`${window.location.origin}/signup?ref=${referralCode}`, '_blank')}
              >
                <ArrowUpRight className="h-5 w-5" />
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-3 flex items-center">
              <Gift className="h-4 w-4 mr-2 text-peony-500" />
              Share this link with friends. They get a welcome bonus, and you earn rewards when they join!
            </p>
          </div>

          {/* Referral Rewards Info */}
          <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
            <h3 className="text-xl font-semibold text-green-900 mb-4 flex items-center">
              <Gift className="h-6 w-6 mr-2" />
              How Referral Rewards Work
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-3">
                <p className="font-semibold text-green-800 text-base">For You (Referrer):</p>
                <ul className="space-y-2 text-green-700">
                  <li className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-2 text-green-600" />
                    $10 for each successful referral
                  </li>
                  <li className="flex items-center">
                    <Award className="h-4 w-4 mr-2 text-green-600" />
                    $25 bonus at 5 referrals
                  </li>
                  <li className="flex items-center">
                    <Award className="h-4 w-4 mr-2 text-green-600" />
                    $50 bonus at 10 referrals
                  </li>
                  <li className="flex items-center">
                    <Award className="h-4 w-4 mr-2 text-green-600" />
                    $150 bonus at 25 referrals
                  </li>
                  <li className="flex items-center">
                    <Award className="h-4 w-4 mr-2 text-green-600" />
                    $350 bonus at 50 referrals
                  </li>
                  <li className="flex items-center">
                    <Award className="h-4 w-4 mr-2 text-green-600" />
                    $1000 bonus at 100 referrals
                  </li>
                </ul>
              </div>
              <div className="space-y-3">
                <p className="font-semibold text-green-800 text-base">For Your Friends:</p>
                <ul className="space-y-2 text-green-700">
                  <li className="flex items-center">
                    <Gift className="h-4 w-4 mr-2 text-green-600" />
                    $5 welcome bonus upon signup
                  </li>
                  <li className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-2 text-green-600" />
                    $5 bonus after first date
                  </li>
                  <li className="flex items-center">
                    <Sparkles className="h-4 w-4 mr-2 text-green-600" />
                    Access to premium features
                  </li>
                  <li className="flex items-center">
                    <Users className="h-4 w-4 mr-2 text-green-600" />
                    Priority customer support
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Recent Referrals */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Recent Referrals</h3>
              <Button variant="ghost" size="sm" className="text-sm text-peony-600 hover:text-peony-700 hover:bg-peony-50">
                View All
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            
            {referrals.length === 0 ? (
              <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h4 className="text-xl font-semibold text-gray-900 mb-2">No referrals yet</h4>
                <p className="text-gray-500 mb-6">Start sharing your referral link to earn rewards!</p>
                <Button onClick={shareReferral} className="bg-gradient-to-r from-peony-500 to-pink-rose-500 hover:from-peony-600 hover:to-pink-rose-600 text-white">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Referral Link
                </Button>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Friend</th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Reward</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {referrals.slice(0, 5).map((referral) => (
                      <tr key={referral.id} className="hover:bg-gradient-to-r hover:from-peony-50 hover:to-pink-rose-50 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img
                              src={referral.referred_user.profile_image_url || `https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=600`}
                              alt={referral.referred_user.full_name}
                              className="h-10 w-10 rounded-full object-cover mr-4 border-2 border-peony-200"
                            />
                            <span className="text-sm font-semibold text-gray-900">{referral.referred_user.full_name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(referral.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(referral.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                          ${referral.reward_amount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-bold mb-6 text-center text-gradient-vibrant">Share Your Referral</h3>
            <div className="space-y-4">
              <Button 
                onClick={() => {
                  window.open(`https://twitter.com/intent/tweet?text=Join DatePay with my referral code: ${referralCode}! Get started with secure dating and earn rewards.&url=${window.location.origin}/signup?ref=${referralCode}`, '_blank');
                  setShowShareModal(false);
                }}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl"
              >
                Share on Twitter
              </Button>
              <Button 
                onClick={() => {
                  window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${window.location.origin}/signup?ref=${referralCode}`)}`, '_blank');
                  setShowShareModal(false);
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl"
              >
                Share on Facebook
              </Button>
              <Button 
                onClick={() => {
                  window.open(`https://wa.me/?text=${encodeURIComponent(`Join DatePay with my referral code: ${referralCode}! Get started with secure dating and earn rewards. ${window.location.origin}/signup?ref=${referralCode}`)}`, '_blank');
                  setShowShareModal(false);
                }}
                className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl"
              >
                Share on WhatsApp
              </Button>
              <Button 
                variant="outline"
                onClick={() => setShowShareModal(false)}
                className="w-full py-3 rounded-xl border-gray-300"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ReferralDashboard;