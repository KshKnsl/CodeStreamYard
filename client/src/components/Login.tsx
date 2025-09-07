import { Button } from "./ui/button";
import { Github } from "lucide-react";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

const Login = () => {
  const handleGithubLogin = () => {
    window.location.href = `${SERVER_URL}/auth/github`;
  };

  return (
    <Button
      type="button"
      className="bg-gray-100 dark:bg-black hover:bg-gray-200 dark:hover:bg-[#0A0A0A] text-gray-800 dark:text-white border border-gray-300 dark:border-gray-700"
      onClick={handleGithubLogin}>
      <Github className="w-4 h-4 mr-2" />
      Login with GitHub
    </Button>
  );
};

export default Login;
