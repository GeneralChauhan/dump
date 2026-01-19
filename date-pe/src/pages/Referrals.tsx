
import React from "react";
import AppLayout from "@/components/layout/AppLayout";
import ReferralDashboard from "@/components/referrals/ReferralDashboard";

const Referrals = () => {
  return (
    <AppLayout>
      <div className="bg-gradient-to-br from-bloom-light-purple via-white to-bloom-light-pink">
        <ReferralDashboard />
      </div>
    </AppLayout>
  );
};

export default Referrals;
