import { Dashboard } from "@/components/Dashboard";
import { Navbar } from "@/components/Navbar";
import { useNavigate } from "react-router-dom";

const DashboardPage = () => {
  const navigate = useNavigate();

  return (
    <>
      <Navbar 
        onHomeClick={() => navigate("/")}
        onContactClick={() => navigate("/")}
        onAboutClick={() => navigate("/")}
      />
      <Dashboard />
    </>
  );
};

export default DashboardPage;
