
import ScrollToTop from "./ScrollToTop";
import Header from "./Header";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      {/* Header Section - Fixed at top */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40">
        <Header />
      </div>
      {/* Main Content Section - Takes remaining space */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};

export default Layout;
