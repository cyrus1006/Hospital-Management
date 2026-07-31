import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ user }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const adminMenu = [
    { path: '/admin-dashboard', icon: 'fa-tachometer-alt', label: 'Dashboard' },
    { path: '/admin-dashboard/doctors', icon: 'fa-user-md', label: 'Doctors' },
    { path: '/admin-dashboard/patients', icon: 'fa-user-injured', label: 'Patients' },
    { path: '/admin-dashboard/appointments', icon: 'fa-calendar-check', label: 'Appointments' },
    { path: '/admin-dashboard/bills', icon: 'fa-file-invoice-dollar', label: 'Bills' },
    { path: '/admin-dashboard/prescriptions', icon: 'fa-prescription', label: 'Prescriptions' },
  ];

  const doctorMenu = [
    { path: '/doctor-dashboard', icon: 'fa-tachometer-alt', label: 'Dashboard' },
    { path: '/doctor-dashboard/today-appointments', icon: 'fa-calendar-day', label: "Today's Appointments" },
    { path: '/doctor-dashboard/upcoming-appointments', icon: 'fa-calendar-week', label: 'Upcoming Appointments' },
    { path: '/doctor-dashboard/patients', icon: 'fa-user-injured', label: 'Patient List' },
    { path: '/doctor-dashboard/prescriptions', icon: 'fa-prescription', label: 'Prescriptions' },
    { path: '/doctor-dashboard/profile', icon: 'fa-user', label: 'Profile' },
  ];

  const patientMenu = [
    { path: '/patient-dashboard', icon: 'fa-tachometer-alt', label: 'Dashboard' },
    { path: '/patient-dashboard/profile', icon: 'fa-user', label: 'My Profile' },
    { path: '/patient-dashboard/book-appointment', icon: 'fa-plus-circle', label: 'Book Appointment' },
    { path: '/patient-dashboard/appointments', icon: 'fa-calendar-check', label: 'Appointment History' },
    { path: '/patient-dashboard/medical-records', icon: 'fa-folder-medical', label: 'Medical Records' },
    { path: '/patient-dashboard/prescriptions', icon: 'fa-prescription', label: 'Prescriptions' },
    { path: '/patient-dashboard/bills', icon: 'fa-file-invoice-dollar', label: 'Bills' },
    { path: '/patient-dashboard/notifications', icon: 'fa-bell', label: 'Notifications' },
  ];

  const getMenu = () => {
    switch (user?.role) {
      case 'admin': return adminMenu;
      case 'doctor': return doctorMenu;
      case 'patient': return patientMenu;
      default: return [];
    }
  };

  const menuItems = getMenu();

  return (
    <aside className={`sidebar ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-toggle" onClick={() => setIsCollapsed(!isCollapsed)}>
          <i className={`fas ${isCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'}`}></i>
        </div>
      </div>
      <div className="sidebar-user">
        <div className="sidebar-avatar">
          <i className="fas fa-user-circle"></i>
        </div>
        {!isCollapsed && (
          <div className="sidebar-user-info">
            <p className="sidebar-user-name">{user?.name}</p>
            <p className="sidebar-user-role">{user?.role}</p>
          </div>
        )}
      </div>
      <ul className="sidebar-menu">
        {menuItems.map((item, index) => (
          <li key={index}>
            <Link
              to={item.path}
              className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
              title={isCollapsed ? item.label : ''}
            >
              <i className={`fas ${item.icon}`}></i>
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;

