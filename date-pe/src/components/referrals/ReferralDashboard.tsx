import React from "react";
import { Link } from "react-router-dom";
import { Share2, TrendingUp, UserPlus, ChevronRight } from "lucide-react";
import { Card, CardContent } from "../ui/card";

const ReferralDashboard = () => {
  const mockReferrals = [
    { name: "Sarah Johnson", status: "Joined", date: "May 15, 2023", reward: "$5.00" },
    { name: "Emily Parker", status: "Pending", date: "May 20, 2023", reward: "Pending" },
    { name: "Jessica Wu", status: "Joined", date: "May 12, 2023", reward: "$5.00" },
  ];

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Referrals</h1>
        <button className="p-2 rounded-full bg-bloom-blue/10 text-bloom-blue">
          <Share2 className="w-5 h-5" />
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-8">
        <Card className="bg-bloom-blue text-white">
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <TrendingUp className="w-5 h-5" />
              <span className="text-xs opacity-80">Total Earnings</span>
            </div>
            <div className="text-2xl font-bold">$10.00</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <UserPlus className="w-5 h-5 text-bloom-blue" />
              <span className="text-xs text-gray-500">Total Invited</span>
            </div>
            <div className="text-2xl font-bold">{mockReferrals.length}</div>
          </CardContent>
        </Card>
      </div>
      
      <div className="mb-8">
        <h2 className="text-lg font-medium mb-4">Invite Friends</h2>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600 mb-4">
              Share your unique referral link and earn $5 for each friend who joins and creates a profile.
            </p>
            <div className="flex rounded-lg border border-gray-200 mb-4 overflow-hidden">
              <div className="flex-grow bg-gray-50 p-3 text-sm text-gray-600 truncate">
                bloom.app/refer/SARAH123
              </div>
              <button className="bg-bloom-blue text-white px-4 text-sm font-medium">
                Copy
              </button>
            </div>
            <button className="w-full py-3 rounded-full bg-bloom-blue text-white font-medium transition-transform hover:translate-y-[-2px]">
              Share Referral Link
            </button>
          </CardContent>
        </Card>
      </div>
      
      <div>
        <h2 className="text-lg font-medium mb-4">My Invites</h2>
        <Card>
          {mockReferrals.map((referral, index) => (
            <React.Fragment key={index}>
              {index > 0 && <div className="h-px bg-gray-100 mx-4" />}
              <div className="p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{referral.name}</h3>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <span>Invited: {referral.date}</span>
                    <span className="mx-2">•</span>
                    <span className={referral.status === "Joined" ? "text-green-600" : "text-yellow-600"}>
                      {referral.status}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-sm">{referral.reward}</div>
                  <div className="text-xs text-gray-500 mt-1">Reward</div>
                </div>
              </div>
            </React.Fragment>
          ))}
          <div className="px-4 pb-4">
            <Link 
              to="/referrals/history" 
              className="flex items-center justify-center w-full py-3 text-sm text-bloom-blue hover:underline"
            >
              View All History
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ReferralDashboard;
