import { Link, useLocation } from "react-router-dom";

const AdminHeader = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <header style={{
      width: '100%',
      background: '#1e293b',
      color: 'white',
      padding: '16px 0',
      borderBottom: '3px solid #3b82f6',
      marginBottom: 24,
      boxShadow: '0 2px 8px rgba(30,41,59,0.08)',
      zIndex: 1000
    }}>
      <div style={{
        maxWidth: 1400,
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
      }}>
        <div style={{ fontWeight: 700, fontSize: 28, letterSpacing: 1, color: '#3b82f6' }}>
          IBIS <span style={{ color: 'white' }}>Admin</span>
        </div>
        <nav style={{ display: 'flex', gap: 32 }}>
          <Link to="/admin" style={{ color: isActive('/admin') ? '#3b82f6' : 'white', fontWeight: 600, textDecoration: 'none', fontSize: 16 }}>Dashboard</Link>
          <Link to="/admin/educational" style={{ color: isActive('/admin/educational') ? '#3b82f6' : 'white', fontWeight: 600, textDecoration: 'none', fontSize: 16 }}>Education</Link>
          <Link to="/admin/tutors" style={{ color: isActive('/admin/tutors') ? '#3b82f6' : 'white', fontWeight: 600, textDecoration: 'none', fontSize: 16 }}>Tutors</Link>
          <Link to="/admin/students" style={{ color: isActive('/admin/students') ? '#3b82f6' : 'white', fontWeight: 600, textDecoration: 'none', fontSize: 16 }}>Students</Link>
        </nav>
      </div>
    </header>
  );
};

export default AdminHeader;
