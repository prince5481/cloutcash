import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { CreatorDashboard } from "@/components/dashboard/CreatorDashboard";
import { BrandDashboard } from "@/components/dashboard/BrandDashboard";

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [userType, setUserType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserType();
    }
  }, [user]);

  const fetchUserType = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("user_type")
        .eq("user_id", user?.id)
        .single();

      if (error) throw error;
      setUserType(data.user_type);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching user type:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-background pt-20 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      {userType === "creator" ? <CreatorDashboard /> : <BrandDashboard />}
    </>
  );
};

export default DashboardPage;
