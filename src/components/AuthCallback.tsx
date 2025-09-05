import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Auth callback error:", error.message);
      }
      // Redirect after login
      navigate("/");
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-lg">Signing you in...</p>
    </div>
  );
}