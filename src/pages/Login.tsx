
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the unified auth page
    navigate('/auth');
  }, [navigate]);

  return null;
};

export default Login;
