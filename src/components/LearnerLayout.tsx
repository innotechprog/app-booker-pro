import LearnerHeader from "./LearnerHeader";

interface LearnerLayoutProps {
  children: React.ReactNode;
}

const LearnerLayout = ({ children }: LearnerLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <LearnerHeader />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};

export default LearnerLayout;


