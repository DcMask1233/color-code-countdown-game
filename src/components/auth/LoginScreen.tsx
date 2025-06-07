
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface LoginScreenProps {
  showLoginModal: boolean;
  onShowLoginModal: () => void;
  onCloseLoginModal: () => void;
  onLogin: (mobile: string) => void;
}

export const LoginScreen = ({
  showLoginModal,
  onShowLoginModal,
  onCloseLoginModal,
  onLogin
}: LoginScreenProps) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to login page instead of showing this screen
    navigate('/login');
  }, [navigate]);

  return null;
};
