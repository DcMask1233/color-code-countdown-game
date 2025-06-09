
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

const Register = () => {
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [invitationCode, setInvitationCode] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const generateUniqueUserId = (): string => {
    const existingUsers = JSON.parse(localStorage.getItem('allColorGameUsers') || '[]');
    let newId = 100000;
    
    if (existingUsers.length > 0) {
      const maxId = Math.max(...existingUsers.map((user: any) => parseInt(user.userId) || 100000));
      newId = maxId + 1;
    }

    return newId.toString();
  };

  const handleSendOTP = async () => {
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
      setIsOtpSent(true);
      toast({
        title: "OTP Sent!",
        description: `OTP sent to +91 ${mobile}`,
      });
    }, 2000);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isOtpSent) {
      toast({
        title: "OTP Required",
        description: "Please send and enter OTP first",
        variant: "destructive",
      });
      return;
    }

    if (otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a valid 6-digit OTP",
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

    if (!agreeToTerms) {
      toast({
        title: "Terms Required",
        description: "Please agree to the Privacy Policy",
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

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Create Account</h1>
          <p className="text-gray-600">Join our community today</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          {/* Mobile Number */}
          <div className="space-y-2">
            <Label htmlFor="mobile" className="text-gray-700 font-medium">Mobile Number</Label>
            <Input
              id="mobile"
              type="tel"
              placeholder="Enter 10-digit number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
              className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              maxLength={10}
              required
            />
          </div>

          {/* OTP Section */}
          <div className="space-y-2">
            <Label htmlFor="otp" className="text-gray-700 font-medium">Verification Code (OTP)</Label>
            <div className="flex gap-2">
              <Input
                id="otp"
                type="tel"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 flex-1"
                maxLength={6}
                required
              />
              <Button
                type="button"
                onClick={handleSendOTP}
                disabled={mobile.length !== 10 || isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium min-w-[100px]"
              >
                {isLoading ? "Sending..." : "Send OTP"}
              </Button>
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Minimum 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          {/* Invitation Code */}
          <div className="space-y-2">
            <Label htmlFor="invitationCode" className="text-gray-700 font-medium">Invite Code</Label>
            <Input
              id="invitationCode"
              type="text"
              placeholder="Enter invitation code"
              value={invitationCode}
              onChange={(e) => setInvitationCode(e.target.value)}
              className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          {/* Privacy Policy Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms"
              checked={agreeToTerms}
              onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
              className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
            />
            <Label htmlFor="terms" className="text-sm text-gray-600">
              I agree to the{" "}
              <Link to="/privacy-policy" className="text-blue-600 hover:text-blue-700 underline">
                Privacy Policy
              </Link>
            </Label>
          </div>

          {/* Register Button */}
          <Button 
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg mt-6"
          >
            Register
          </Button>

          {/* Login Link */}
          <div className="text-center mt-4">
            <span className="text-gray-600 text-sm">
              Already have an account?{" "}
              <Link 
                to="/login" 
                className="text-blue-600 hover:text-blue-700 font-semibold underline"
              >
                Login
              </Link>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
