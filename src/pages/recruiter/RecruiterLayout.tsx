import { Outlet } from "react-router-dom";
import RecruiterHeader from "@/components/RecruiterHeader";

const RecruiterLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <RecruiterHeader />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default RecruiterLayout;
