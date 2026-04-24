import { Navigate, Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileText, LogOut, Receipt, LayoutDashboard } from "lucide-react";
import { isSendMeAdminAuthed, sendMeAdminLogout } from "../auth";
import { sendMeDarkPageShell } from "@/features/sendMe/constants/layout";
import { SEND_ME_BRAND_BLUE } from "@/features/sendMe/constants/brand";
import SEO from "@/components/SEO";

const navLink =
  "rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-white/10 hover:text-white";

export default function SendMeAdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  if (!isSendMeAdminAuthed()) {
    return <Navigate to="/sendme/admin/login" replace state={{ from: location.pathname }} />;
  }

  const logout = () => {
    sendMeAdminLogout();
    navigate("/sendme/admin/login", { replace: true });
  };

  const active = (path: string) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`)
      ? "bg-white/15 text-white"
      : "text-white/80";

  return (
    <>
      <SEO title="Send Me admin" description="Create Send Me quotations and invoices." noindex />
      <div className={sendMeDarkPageShell}>
        <header
          className="border-b border-white/15 bg-black/20 backdrop-blur-sm print:hidden"
          style={{ borderBottomColor: `${SEND_ME_BRAND_BLUE}55` }}
        >
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-3">
            <div className="flex items-center gap-6">
              <span className="text-lg font-bold text-white">Send Me admin</span>
              <nav className="flex flex-wrap gap-1">
                <Link to="/sendme/admin" className={`${navLink} ${active("/sendme/admin")}`}>
                  <span className="inline-flex items-center gap-1.5">
                    <LayoutDashboard className="h-4 w-4" />
                    Home
                  </span>
                </Link>
                <Link
                  to="/sendme/admin/quotation"
                  className={`${navLink} ${active("/sendme/admin/quotation")}`}
                >
                  <span className="inline-flex items-center gap-1.5">
                    <FileText className="h-4 w-4" />
                    Quotation
                  </span>
                </Link>
                <Link
                  to="/sendme/admin/invoice"
                  className={`${navLink} ${active("/sendme/admin/invoice")}`}
                >
                  <span className="inline-flex items-center gap-1.5">
                    <Receipt className="h-4 w-4" />
                    Invoice
                  </span>
                </Link>
              </nav>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={logout}
              className="text-white/80 hover:bg-white/10 hover:text-white"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </Button>
          </div>
        </header>
        <main>
          <Outlet />
        </main>
      </div>
    </>
  );
}
