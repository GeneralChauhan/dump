
import React from "react";
import AppLayout from "@/components/layout/AppLayout";
import ProfileForm from "@/components/profile/ProfileForm";

const Profile = () => {
  return (
    <AppLayout>
      <div className="bg-gradient-to-br from-bloom-light-yellow via-white to-bloom-light-purple">
        <ProfileForm />
      </div>
    </AppLayout>
  );
};

export default Profile;
