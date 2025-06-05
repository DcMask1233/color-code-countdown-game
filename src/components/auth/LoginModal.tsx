
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (mobile: string) => void;
}

export const LoginModal = ({ isOpen, onClose, onLogin }: LoginModalProps) => {
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"mobile" | "otp">("mobile");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSendOTP = async () => {
    if (mobile.length !== 10) {
      toast({
        title: "Invalid Mobile Number",
        description: "Please enter a valid 10-digit mobile number",
        variant: "destructive",
      });
      return;
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

  const handleVerifyOTP = () => {
    if (otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a valid 6-digit OTP",
        variant: "destructive",
      });
      return;
    }

    // Simulate OTP verification (accept any 6-digit OTP)
    onLogin(mobile);
    setMobile("");
    setOtp("");
    setStep("mobile");
  };

  const handleBack = () => {
    setStep("mobile");
    setOtp("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-md border-white/20">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            {step === "mobile" ? "Login with Mobile" : "Verify OTP"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {step === "mobile" ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile Number</Label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md text-sm text-gray-600">
                    +91
                  </span>
                  <Input
                    id="mobile"
                    type="tel"
                    placeholder="Enter 10-digit number"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="rounded-l-none"
                    maxLength={10}
                  />
                </div>
              </div>

              <Button 
                onClick={handleSendOTP}
                disabled={mobile.length !== 10 || isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {isLoading ? "Sending OTP..." : "Send OTP"}
              </Button>
            </>
          ) : (
            <>
              <div className="text-center space-y-2">
                <p className="text-sm text-gray-600">
                  OTP sent to +91 {mobile}
                </p>
                <p className="text-xs text-gray-500">
                  Enter any 6-digit number for demo
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="otp">Enter OTP</Label>
                <Input
                  id="otp"
                  type="tel"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="text-center text-lg tracking-widest"
                  maxLength={6}
                />
              </div>

              <div className="space-y-3">
                <Button 
                  onClick={handleVerifyOTP}
                  disabled={otp.length !== 6}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  Verify & Login
                </Button>
                
                <Button 
                  onClick={handleBack}
                  variant="outline"
                  className="w-full"
                >
                  Back to Mobile Number
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
