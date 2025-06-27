
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const ADMIN_EMAIL = "dcmask21@gmail.com";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (email !== ADMIN_EMAIL) {
      toast({
        title: "Access Denied",
        description: "Only authorized administrators can access this panel.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Admin login error:", error);
        
        // Handle specific error cases
        if (error.message.includes("Invalid login credentials")) {
          toast({
            title: "Login Failed",
            description: "Invalid email or password. Please check your credentials.",
            variant: "destructive"
          });
        } else if (error.message.includes("Email not confirmed")) {
          toast({
            title: "Email Not Verified",
            description: "Please verify your email address before logging in.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Login Failed",
            description: error.message,
            variant: "destructive"
          });
        }
      } else if (data?.user?.email === ADMIN_EMAIL) {
        toast({
          title: "Success",
          description: "Welcome to the admin panel",
        });
        navigate("/admin");
      } else {
        toast({
          title: "Access Denied", 
          description: "Not an authorized administrator",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error("Unexpected admin login error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdminAccount = async () => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: ADMIN_EMAIL,
        password: "12345678",
        options: {
          emailRedirectTo: `${window.location.origin}/admin`
        }
      });

      if (error) {
        if (error.message.includes("already registered")) {
          toast({
            title: "Account Exists",
            description: "Admin account already exists. Try logging in instead.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Creation Failed",
            description: error.message,
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Admin Account Created",
          description: "Admin account created successfully. You can now login.",
        });
      }
    } catch (error: any) {
      console.error("Admin account creation error:", error);
      toast({
        title: "Error",
        description: "Failed to create admin account",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-800">
            Admin Login
          </CardTitle>
          <p className="text-gray-600">
            Access the administrative panel
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Admin Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter admin email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
          
          <div className="mt-4 space-y-2">
            <Button 
              onClick={handleCreateAdminAccount}
              variant="outline"
              className="w-full"
              disabled={loading}
            >
              Create Admin Account
            </Button>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Default Credentials:</strong><br />
              Email: dcmask21@gmail.com<br />
              Password: 12345678
            </p>
            <p className="text-xs text-blue-600 mt-2">
              Click "Create Admin Account" if this is your first time accessing the admin panel.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
