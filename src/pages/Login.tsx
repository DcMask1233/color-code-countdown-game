
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mobile.length !== 10) {
      toast({
        title: "Invalid Mobile Number",
        description: "Please enter a valid 10-digit mobile number",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 8) {
      toast({
        title: "Invalid Password",
        description: "Password must be at least 8 characters",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    // Check for existing user
    const savedUser = localStorage.getItem('colorGameUser');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      if (userData.mobile === mobile && userData.password === password) {
        toast({
          title: "Login Successful!",
          description: "Welcome back to Color Prediction Game",
        });
        navigate('/');
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid mobile number or password",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Account Not Found",
        description: "No account found with this mobile number",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Login to Your Account</h1>
          <p className="text-purple-200">Welcome back!</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="mobile" className="text-white">📱 Mobile Number</Label>
            <div className="flex">
              <span className="inline-flex items-center px-3 bg-white/20 border border-r-0 border-white/30 rounded-l-md text-sm text-white">
                +91
              </span>
              <Input
                id="mobile"
                type="tel"
                placeholder="Enter 10-digit number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="rounded-l-none bg-white/10 border-white/30 text-white placeholder:text-white/60"
                maxLength={10}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-white">🔐 Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-white/10 border-white/30 text-white placeholder:text-white/60"
              required
            />
          </div>

          <Button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-105"
          >
            {isLoading ? "Logging in..." : "✅ Login"}
          </Button>

          <div className="text-center space-y-2">
            <Link 
              to="/forgot-password" 
              className="text-purple-200 hover:text-white text-sm underline"
            >
              🔁 Forgot Password?
            </Link>
            <div className="text-white/80 text-sm">
              ❗ Don't have an account?{" "}
              <Link 
                to="/register" 
                className="text-purple-200 hover:text-white font-semibold underline"
              >
                Register Now
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
