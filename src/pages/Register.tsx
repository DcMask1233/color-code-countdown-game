
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const Register = () => {
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [invitationCode, setInvitationCode] = useState("");
  const [step, setStep] = useState<"mobile" | "otp" | "details">("mobile");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const generateUniqueUserId = (): string => {
    // Generate 6-digit unique ID starting from 100000
    const existingUsers = JSON.parse(localStorage.getItem('allColorGameUsers') || '[]');
    let newId = 100000;
    
    if (existingUsers.length > 0) {
      const maxId = Math.max(...existingUsers.map((user: any) => parseInt(user.userId) || 100000));
      newId = maxId + 1;
    }

    return newId.toString();
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mobile.length !== 10) {
      toast({
        title: "Invalid Mobile Number",
        description: "Please enter a valid 10-digit mobile number",
        variant: "destructive",
      });
      return;
    }

    // Check if user already exists
    const savedUser = localStorage.getItem('colorGameUser');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      if (userData.mobile === mobile) {
        toast({
          title: "Account Exists",
          description: "An account with this mobile number already exists",
          variant: "destructive",
        });
        return;
      }
    }

    setIsLoading(true);
    // Simulate OTP sending
    setTimeout(() => {
      setIsLoading(false);
      setStep("otp");
      toast({
        title: "OTP Sent!",
        description: `OTP sent to +91 ${mobile}`,
      });
    }, 2000);
  };

  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();

    if (otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a valid 6-digit OTP",
        variant: "destructive",
      });
      return;
    }

    // Simulate OTP verification (accept any 6-digit OTP)
    setStep("details");
    toast({
      title: "OTP Verified!",
      description: "Please set your password and invitation code",
    });
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      toast({
        title: "Invalid Password",
        description: "Password must be at least 8 characters",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Password and confirm password do not match",
        variant: "destructive",
      });
      return;
    }

    if (!invitationCode.trim()) {
      toast({
        title: "Invitation Code Required",
        description: "Please enter an invitation code",
        variant: "destructive",
      });
      return;
    }

    const newUserId = generateUniqueUserId();
    
    const userData = {
      mobile,
      password,
      userId: newUserId,
      invitationCode,
      balance: 1000,
      totalBetAmount: 0,
      totalDepositAmount: 0,
      totalWithdrawAmount: 0,
      registrationTime: new Date().toISOString()
    };

    // Save current user
    localStorage.setItem('colorGameUser', JSON.stringify(userData));

    // Save to all users list for ID tracking
    const allUsers = JSON.parse(localStorage.getItem('allColorGameUsers') || '[]');
    allUsers.push({ userId: newUserId, mobile, registrationTime: userData.registrationTime });
    localStorage.setItem('allColorGameUsers', JSON.stringify(allUsers));

    toast({
      title: "Registration Successful!",
      description: `Welcome! Your User ID is ${newUserId}`,
    });

    navigate('/');
  };

  const handleBack = () => {
    if (step === "otp") {
      setStep("mobile");
      setOtp("");
    } else if (step === "details") {
      setStep("otp");
      setPassword("");
      setConfirmPassword("");
      setInvitationCode("");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Create Your Account</h1>
          <p className="text-purple-200">Join the winning community!</p>
        </div>

        {step === "mobile" && (
          <form onSubmit={handleSendOTP} className="space-y-6">
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

            <Button 
              type="submit"
              disabled={mobile.length !== 10 || isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-105"
            >
              {isLoading ? "Sending OTP..." : "Send OTP"}
            </Button>

            <div className="text-center">
              <div className="text-white/80 text-sm">
                🔁 Already have an account?{" "}
                <Link 
                  to="/login" 
                  className="text-purple-200 hover:text-white font-semibold underline"
                >
                  Login
                </Link>
              </div>
            </div>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div className="text-center space-y-2">
              <p className="text-sm text-purple-200">
                📩 OTP sent to +91 {mobile}
              </p>
              <p className="text-xs text-white/60">
                Enter any 6-digit number for demo
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="otp" className="text-white">Enter OTP</Label>
              <Input
                id="otp"
                type="tel"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="text-center text-lg tracking-widest bg-white/10 border-white/30 text-white placeholder:text-white/60"
                maxLength={6}
                required
              />
            </div>

            <div className="space-y-3">
              <Button 
                type="submit"
                disabled={otp.length !== 6}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-105"
              >
                Verify OTP
              </Button>
              
              <Button 
                type="button"
                onClick={handleBack}
                variant="outline"
                className="w-full bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                Back to Mobile Number
              </Button>
            </div>
          </form>
        )}

        {step === "details" && (
          <form onSubmit={handleRegister} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">🔐 Set Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/10 border-white/30 text-white placeholder:text-white/60"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-white">🔐 Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-white/10 border-white/30 text-white placeholder:text-white/60"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="invitationCode" className="text-white">🏷️ Invitation Code</Label>
                <Input
                  id="invitationCode"
                  type="text"
                  placeholder="Enter invitation code"
                  value={invitationCode}
                  onChange={(e) => setInvitationCode(e.target.value)}
                  className="bg-white/10 border-white/30 text-white placeholder:text-white/60"
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <Button 
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-105"
              >
                ✅ Register
              </Button>
              
              <Button 
                type="button"
                onClick={handleBack}
                variant="outline"
                className="w-full bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                Back to OTP
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Register;
