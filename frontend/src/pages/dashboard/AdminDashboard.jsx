import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { adminAPI } from '../../services/api';
import { useToast } from '../../components/Toast';
import Sidebar from '../../components/Sidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import Pagination from '../../components/Pagination';
import { Link } from 'react-router-dom';
import '../../assets/styles/dashboard.css';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [bills, setBills] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '', gender: '',
    specialization: '', experience: '', qualifications: '', department: '', consultationFee: '', address: ''
  });

  useEffect(() => {
    loadDashboard();
  }, [activeTab, currentPage]);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      if (activeTab === 'overview') {
        const res = await adminAPI.getStats();
        setStats(res.data);
      } else {
        const endpoint = getEndpoint();
        const params = { page: currentPage, limit: 10 };
        if (searchTerm) params.search = searchTerm;
        const res = await endpoint(params);
        if (activeTab === 'patients' || activeTab === 'doctors') {
          setUsers(res.data.users || []);
          setTotalPages(res.data.totalPages || 1);
        } else if (activeTab === 'appointments') {
          setAppointments(res.data.appointments || []);
          setTotalPages(res.data.totalPages || 1);
        } else if (activeTab === 'prescriptions') {
          setPrescriptions(res.data.prescriptions || []);
          setTotalPages(res.data.totalPages || 1);
        } else if (activeTab === 'bills') {
          setBills(res.data.bills || []);
          setTotalPages(res.data.totalPages || 1);
        }
      }
    } catch (error) {
      addToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getEndpoint = () => {
    switch (activeTab) {
      case 'patients': return (params) => adminAPI.getUsersByRole('patient', params);
      case 'doctors': return (params) => adminAPI.getUsersByRole('doctor', params);
      case 'appointments': return (params) => adminAPI.getAppointments(params);
      case 'prescriptions': return (params) => adminAPI.getPrescriptions(params);
      case 'bills': return (params) => adminAPI.getBills(params);
      default: return () => Promise.resolve({ data: { users: [], totalPages: 1 } });
    }
  };

  const handleCreateDoctor = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        qualifications: formData.qualifications ? formData.qualifications.split(',').map(q => q.trim()) : [],
        experience: parseInt(formData.experience) || 0,
        consultationFee: parseFloat(formData.consultationFee) || 0
      };
      await adminAPI.createUser(data);
      addToast('Doctor created successfully', 'success');
      setShowModal(false);
      setFormData({ name: '', email: '', password: '', phone: '', gender: '', specialization: '', experience: '', qualifications: '', department: '', consultationFee: '', address: '' });
      loadDashboard();
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to create doctor', 'error');
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      await adminAPI.updateUser(id, { isActive: !currentStatus });
      addToast(`User ${currentStatus ? 'deactivated' : 'activated'} successfully`, 'success');
      loadDashboard();
    } catch (error) {
      addToast('Failed to update user', 'error');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await adminAPI.deleteUser(id);
      addToast('User deactivated successfully', 'success');
      loadDashboard();
    } catch (error) {
      addToast('Failed to delete user', 'error');
    }
  };

  const handleUpdateAppointmentStatus = async (id, status) => {
    try {
      await adminAPI.updateAppointmentStatus(id, { status });
      addToast(`Appointment ${status} successfully`, 'success');
      loadDashboard();
    } catch (error) {
      addToast('Failed to update appointment', 'error');
    }
  };

  const handleDeleteBill = async (id) => {
    if (!window.confirm('Are you sure you want to delete this bill?')) return;
    try {
      await adminAPI.deleteBill(id);
      addToast('Bill deleted successfully', 'success');
      loadDashboard();
    } catch (error) {
      addToast('Failed to delete bill', 'error');
    }
  };

  const openCreateModal = () => {
    setModalType('create');
    setEditingUser(null);
    setFormData({ name: '', email: '', password: '', phone: '', gender: '', specialization: '', experience: '', qualifications: '', department: '', consultationFee: '', address: '' });
    setShowModal(true);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const tabs = ['overview', 'doctors', 'patients', 'appointments', 'bills', 'prescriptions'];

  if (loading && activeTab === 'overview') return <LoadingSpinner />;

  return (
    <div className="dashboard-layout">
      <Sidebar user={user} />
      <div className="dashboard-main">
        <div className="dashboard-topbar">
          <h2>Admin Dashboard</h2>
          <div className="topbar-actions">
            <div className="search-box">
              <i className="fas fa-search"></i>
              <input type="text" placeholder="Search..." value={searchTerm} onChange={handleSearch} />
            </div>
            <div className="topbar-user" onClick={() => setShowDropdown(!showDropdown)}>
              <i className="fas fa-user-circle"></i>
              <span>{user?.name}</span>
              {showDropdown && (
                <div className="profile-dropdown">
                  <Link to="/admin-dashboard/profile"><i className="fas fa-user"></i> Profile</Link>
                  <div className="dropdown-divider"></div>
                  <button onClick={logout}><i className="fas fa-sign-out-alt"></i> Logout</button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="dashboard-content">
          <div className="tabs">
            {tabs.map(tab => (
              <button key={tab} className={`tab ${activeTab === tab ? 'active' : ''}`} onClick={() => { setActiveTab(tab); setCurrentPage(1); }}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {activeTab === 'overview' && stats && (
            <>
              <div className="stats-grid">
                <div className="stat-card-dash">
                  <div className="stat-icon blue"><i className="fas fa-user-md"></i></div>
                  <div className="stat-info"><h3>{stats.totalDoctors}</h3><p>Total Doctors</p></div>
                </div>
                <div className="stat-card-dash">
                  <div className="stat-icon green"><i className="fas fa-user-injured"></i></div>
                  <div className="stat-info"><h3>{stats.totalPatients}</h3><p>Total Patients</p></div>
                </div>
                <div className="stat-card-dash">
                  <div className="stat-icon purple"><i className="fas fa-calendar-check"></i></div>
                  <div className="stat-info"><h3>{stats.totalAppointments}</h3><p>Total Appointments</p></div>
                </div>
                <div className="stat-card-dash">
                  <div className="stat-icon orange"><i className="fas fa-file-invoice-dollar"></i></div>
                  <div className="stat-info"><h3>{stats.totalBills}</h3><p>Total Bills</p></div>
                </div>
                <div className="stat-card-dash">
                  <div className="stat-icon red"><i className="fas fa-dollar-sign"></i></div>
                  <div className="stat-info"><h3>${(stats.totalRevenue || 0).toLocaleString()}</h3><p>Total Revenue</p></div>
                </div>
              </div>

              <div className="dashboard-section">
                <div className="section-header-dash">
                  <h3>Recent Appointments</h3>
                </div>
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr><th>Patient</th><th>Doctor</th><th>Date</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                      {(stats.recentAppointments || []).map((apt, i) => (
                        <tr key={i}>
                          <td>{apt.patient?.name || 'N/A'}</td>
                          <td>{apt.doctor?.name || 'N/A'}</td>
                          <td>{new Date(apt.appointmentDate).toLocaleDateString()}</td>
                          <td><span className={`status-badge ${apt.status}`}>{apt.status}</span></td>
                        </tr>
                      ))}
                      {(!stats.recentAppointments || stats.recentAppointments.length === 0) && (
                        <tr><td colSpan="4" style={{ textAlign: 'center', color: '#94a3b8' }}>No recent appointments</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="dashboard-section">
                <div className="section-header-dash">
                  <h3>Recent Registrations</h3>
                </div>
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr><th>Name</th><th>Email</th><th>Phone</th><th>Date</th></tr>
                    </thead>
                    <tbody>
                      {(stats.recentRegistrations || []).map((reg, i) => (
                        <tr key={i}>
                          <td>{reg.name}</td>
                          <td>{reg.email}</td>
                          <td>{reg.phone || 'N/A'}</td>
                          <td>{new Date(reg.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                      {(!stats.recentRegistrations || stats.recentRegistrations.length === 0) && (
                        <tr><td colSpan="4" style={{ textAlign: 'center', color: '#94a3b8' }}>No recent registrations</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {(activeTab === 'doctors') && (
            <div className="dashboard-section">
              <div className="section-header-dash">
                <h3>Doctor Management</h3>
                <button className="btn btn-primary btn-sm" onClick={openCreateModal}>
                  <i className="fas fa-plus"></i> Add Doctor
                </button>
              </div>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr><th>Name</th><th>Email</th><th>Specialization</th><th>Phone</th><th>Status</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u._id}>
                        <td>{u.name}</td>
                        <td>{u.email}</td>
                        <td>{u.specialization || 'N/A'}</td>
                        <td>{u.phone || 'N/A'}</td>
                        <td><span className={`status-badge ${u.isActive ? 'active' : 'inactive'}`}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
                        <td>
                          <button className="action-btn" title={u.isActive ? 'Deactivate' : 'Activate'} onClick={() => handleToggleActive(u._id, u.isActive)}>
                            <i className={`fas ${u.isActive ? 'fa-ban' : 'fa-check-circle'}`}></i>
                          </button>
                          <button className="action-btn delete" title="Delete" onClick={() => handleDeleteUser(u._id)}>
                            <i className="fas fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr><td colSpan="6" style={{ textAlign: 'center', color: '#94a3b8' }}>No doctors found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          )}

          {activeTab === 'patients' && (
            <div className="dashboard-section">
              <div className="section-header-dash">
                <h3>Patient Management</h3>
              </div>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr><th>Name</th><th>Email</th><th>Phone</th><th>Gender</th><th>Status</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u._id}>
                        <td>{u.name}</td>
                        <td>{u.email}</td>
                        <td>{u.phone || 'N/A'}</td>
                        <td>{u.gender || 'N/A'}</td>
                        <td><span className={`status-badge ${u.isActive ? 'active' : 'inactive'}`}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
                        <td>
                          <button className="action-btn" title="View Details" onClick={() => setSelectedPatient(selectedPatient?._id === u._id ? null : u)}>
                            <i className="fas fa-eye"></i>
                          </button>
                          <button className="action-btn delete" title="Delete" onClick={() => handleDeleteUser(u._id)}>
                            <i className="fas fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr><td colSpan="6" style={{ textAlign: 'center', color: '#94a3b8' }}>No patients found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              {selectedPatient && (
                <div className="dashboard-section" style={{ marginTop: '20px' }}>
                  <h4 style={{ marginBottom: '15px' }}>Patient Details: {selectedPatient.name}</h4>
                  <div className="profile-view">
                    <div className="profile-details">
                      <div className="detail-row"><span className="detail-label">Email</span><span className="detail-value">{selectedPatient.email}</span></div>
                      <div className="detail-row"><span className="detail-label">Phone</span><span className="detail-value">{selectedPatient.phone || 'N/A'}</span></div>
                      <div className="detail-row"><span className="detail-label">Gender</span><span className="detail-value">{selectedPatient.gender || 'N/A'}</span></div>
                      <div className="detail-row"><span className="detail-label">DOB</span><span className="detail-value">{selectedPatient.dateOfBirth ? new Date(selectedPatient.dateOfBirth).toLocaleDateString() : 'N/A'}</span></div>
                      <div className="detail-row"><span className="detail-label">Blood Group</span><span className="detail-value">{selectedPatient.bloodGroup || 'N/A'}</span></div>
                      <div className="detail-row"><span className="detail-label">Address</span><span className="detail-value">{selectedPatient.address || 'N/A'}</span></div>
                    </div>
                  </div>
                </div>
              )}
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          )}

          {activeTab === 'appointments' && (
            <div className="dashboard-section">
              <div className="section-header-dash"><h3>Appointment Management</h3></div>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr><th>Patient</th><th>Doctor</th><th>Date</th><th>Time</th><th>Status</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {appointments.map(apt => (
                      <tr key={apt._id}>
                        <td>{apt.patient?.name || 'N/A'}</td>
                        <td>{apt.doctor?.name || 'N/A'}</td>
                        <td>{new Date(apt.appointmentDate).toLocaleDateString()}</td>
                        <td>{apt.appointmentTime}</td>
                        <td><span className={`status-badge ${apt.status}`}>{apt.status}</span></td>
                        <td>
                          {apt.status === 'pending' && (
                            <>
                              <button className="action-btn" title="Approve" onClick={() => handleUpdateAppointmentStatus(apt._id, 'confirmed')}>
                                <i className="fas fa-check" style={{color: '#10b981'}}></i>
                              </button>
                              <button className="action-btn" title="Reject" onClick={() => handleUpdateAppointmentStatus(apt._id, 'cancelled')}>
                                <i className="fas fa-times" style={{color: '#ef4444'}}></i>
                              </button>
                            </>
                          )}
                          {apt.status === 'confirmed' && (
                            <button className="action-btn" title="Complete" onClick={() => handleUpdateAppointmentStatus(apt._id, 'completed')}>
                              <i className="fas fa-check-double" style={{color: '#4f46e5'}}></i>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {appointments.length === 0 && (
                      <tr><td colSpan="6" style={{ textAlign: 'center', color: '#94a3b8' }}>No appointments</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          )}

          {activeTab === 'bills' && (
            <div className="dashboard-section">
              <div className="section-header-dash"><h3>Billing Management</h3></div>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr><th>Bill #</th><th>Patient</th><th>Amount</th><th>Date</th><th>Payment Status</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {bills.map(b => (
                      <tr key={b._id}>
                        <td>{b.billNumber || 'N/A'}</td>
                        <td>{b.patient?.name || 'N/A'}</td>
                        <td>${(b.totalAmount || 0).toLocaleString()}</td>
                        <td>{new Date(b.createdAt).toLocaleDateString()}</td>
                        <td><span className={`status-badge ${b.paymentStatus}`}>{b.paymentStatus}</span></td>
                        <td>
                          <button className="action-btn delete" title="Delete" onClick={() => handleDeleteBill(b._id)}>
                            <i className="fas fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                    {bills.length === 0 && (
                      <tr><td colSpan="6" style={{ textAlign: 'center', color: '#94a3b8' }}>No bills</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          )}

          {activeTab === 'prescriptions' && (
            <div className="dashboard-section">
              <div className="section-header-dash"><h3>All Prescriptions</h3></div>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr><th>Patient</th><th>Doctor</th><th>Diagnosis</th><th>Date</th><th>Medications</th></tr>
                  </thead>
                  <tbody>
                    {prescriptions.map(p => (
                      <tr key={p._id}>
                        <td>{p.patient?.name || 'N/A'}</td>
                        <td>{p.doctor?.name || 'N/A'}</td>
                        <td>{p.diagnosis || 'N/A'}</td>
                        <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                        <td>{p.medications?.length || 0} medications</td>
                      </tr>
                    ))}
                    {prescriptions.length === 0 && (
                      <tr><td colSpan="5" style={{ textAlign: 'center', color: '#94a3b8' }}>No prescriptions</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Add New Doctor</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><i className="fas fa-times"></i></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleCreateDoctor}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>Password</label>
                    <input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Gender</label>
                    <select value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})}>
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Department</label>
                    <select value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})}>
                      <option value="">Select</option>
                      <option value="General Medicine">General Medicine</option>
                      <option value="Cardiology">Cardiology</option>
                      <option value="Orthopedics">Orthopedics</option>
                      <option value="Pediatrics">Pediatrics</option>
                      <option value="Neurology">Neurology</option>
                      <option value="Emergency Care">Emergency Care</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Specialization</label>
                    <input type="text" value={formData.specialization} onChange={(e) => setFormData({...formData, specialization: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Experience (years)</label>
                    <input type="number" value={formData.experience} onChange={(e) => setFormData({...formData, experience: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Consultation Fee ($)</label>
                    <input type="number" value={formData.consultationFee} onChange={(e) => setFormData({...formData, consultationFee: e.target.value})} />
                  </div>
                  <div className="form-group-full">
                    <label>Qualifications (comma separated)</label>
                    <input type="text" value={formData.qualifications} onChange={(e) => setFormData({...formData, qualifications: e.target.value})} placeholder="e.g. MBBS, MD - Cardiology" />
                  </div>
                  <div className="form-group-full">
                    <label>Address</label>
                    <textarea rows="2" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})}></textarea>
                  </div>
                </div>
                <div className="form-actions">
                  <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Create Doctor</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

