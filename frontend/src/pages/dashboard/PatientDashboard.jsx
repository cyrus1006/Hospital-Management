import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { patientAPI } from '../../services/api';
import { useToast } from '../../components/Toast';
import Sidebar from '../../components/Sidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import Pagination from '../../components/Pagination';
import { Link } from 'react-router-dom';
import '../../assets/styles/dashboard.css';

const PatientDashboard = () => {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [bills, setBills] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showBookModal, setShowBookModal] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const [bookForm, setBookForm] = useState({
    doctor: '', appointmentDate: '', appointmentTime: '', reason: '', department: ''
  });
  const [profileForm, setProfileForm] = useState({
    name: '', phone: '', address: '', dateOfBirth: '', gender: ''
  });

  useEffect(() => { loadData(); }, [activeTab, currentPage]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'overview') {
        const res = await patientAPI.getDashboard();
        setDashboard(res.data);
      } else if (activeTab === 'appointments') {
        const res = await patientAPI.getAppointments({ page: currentPage, limit: 10 });
        setAppointments(res.data.appointments || []);
        setTotalPages(res.data.totalPages || 1);
      } else if (activeTab === 'book-appointment') {
        const res = await patientAPI.getDoctors();
        setDoctors(Array.isArray(res.data) ? res.data : []);
      } else if (activeTab === 'prescriptions') {
        const res = await patientAPI.getPrescriptions({ page: currentPage, limit: 10 });
        setPrescriptions(res.data.prescriptions || []);
        setTotalPages(res.data.totalPages || 1);
      } else if (activeTab === 'bills') {
        const res = await patientAPI.getBills({ page: currentPage, limit: 10 });
        setBills(res.data.bills || []);
        setTotalPages(res.data.totalPages || 1);
      } else if (activeTab === 'medical-records') {
        const res = await patientAPI.getMedicalRecords({ page: currentPage, limit: 10 });
        setMedicalRecords(res.data.records || []);
        setTotalPages(res.data.totalPages || 1);
      } else if (activeTab === 'notifications') {
        const res = await patientAPI.getNotifications();
        setNotifications(Array.isArray(res.data) ? res.data : []);
      }
    } catch (error) {
      addToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    try {
      await patientAPI.bookAppointment(bookForm);
      addToast('Appointment booked successfully!', 'success');
      setShowBookModal(false);
      setBookForm({ doctor: '', appointmentDate: '', appointmentTime: '', reason: '', department: '' });
      setActiveTab('appointments');
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to book appointment', 'error');
    }
  };

  const handleCancelAppointment = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await patientAPI.cancelAppointment(id);
      addToast('Appointment cancelled', 'success');
      loadData();
    } catch (error) {
      addToast('Failed to cancel appointment', 'error');
    }
  };

  const tabs = ['overview', 'profile', 'book-appointment', 'appointments', 'medical-records', 'prescriptions', 'bills', 'notifications'];

  const getTabLabel = (tab) => {
    const labels = {
      'overview': 'Dashboard',
      'profile': 'My Profile',
      'book-appointment': 'Book Appointment',
      'appointments': 'Appointment History',
      'medical-records': 'Medical Records',
      'prescriptions': 'Prescriptions',
      'bills': 'Bills',
      'notifications': 'Notifications'
    };
    return labels[tab] || tab;
  };

  if (loading && activeTab === 'overview') return <LoadingSpinner />;

  return (
    <div className="dashboard-layout">
      <Sidebar user={user} />
      <div className="dashboard-main">
        <div className="dashboard-topbar">
          <h2>Patient Dashboard</h2>
          <div className="topbar-actions">
            <div className="topbar-user" onClick={() => setShowDropdown(!showDropdown)}>
              <i className="fas fa-user-circle"></i>
              <span>{user?.name}</span>
              {showDropdown && (
                <div className="profile-dropdown">
                  <button onClick={() => { setActiveTab('profile'); setShowDropdown(false); }}><i className="fas fa-user"></i> Profile</button>
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
              <button key={tab} className={`tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => { setActiveTab(tab); setCurrentPage(1); }}>
                {getTabLabel(tab)}
              </button>
            ))}
          </div>

          {activeTab === 'overview' && dashboard && (
            <>
              <div className="stats-grid">
                <div className="stat-card-dash">
                  <div className="stat-icon blue"><i className="fas fa-calendar-check"></i></div>
                  <div className="stat-info"><h3>{dashboard.totalAppointments || 0}</h3><p>Total Appointments</p></div>
                </div>
                <div className="stat-card-dash">
                  <div className="stat-icon green"><i className="fas fa-calendar-day"></i></div>
                  <div className="stat-info"><h3>{dashboard.upcomingAppointments || 0}</h3><p>Upcoming</p></div>
                </div>
                <div className="stat-card-dash">
                  <div className="stat-icon purple"><i className="fas fa-prescription"></i></div>
                  <div className="stat-info"><h3>{dashboard.totalPrescriptions || 0}</h3><p>Prescriptions</p></div>
                </div>
                <div className="stat-card-dash">
                  <div className="stat-icon orange"><i className="fas fa-file-invoice-dollar"></i></div>
                  <div className="stat-info"><h3>{dashboard.totalBills || 0}</h3><p>Bills</p></div>
                </div>
              </div>

              <div className="dashboard-section">
                <div className="section-header-dash">
                  <h3>Quick Actions</h3>
                </div>
                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                  <button className="btn btn-primary" onClick={() => setActiveTab('book-appointment')}>
                    <i className="fas fa-calendar-plus"></i> Book Appointment
                  </button>
                  <button className="btn btn-secondary" onClick={() => setActiveTab('appointments')}>
                    <i className="fas fa-history"></i> View History
                  </button>
                  <button className="btn btn-accent" onClick={() => setActiveTab('bills')}>
                    <i className="fas fa-file-invoice"></i> View Bills
                  </button>
                </div>
              </div>
            </>
          )}

          {activeTab === 'profile' && (
            <div className="form-card">
              <div className="section-header-dash">
                <h3>My Profile</h3>
              </div>
              <div className="profile-view">
                <div className="profile-avatar">
                  <i className="fas fa-user-circle"></i>
                  <h3>{user?.name}</h3>
                </div>
                <div className="profile-details">
                  <div className="detail-row"><span className="detail-label">Email</span><span className="detail-value">{user?.email}</span></div>
                  <div className="detail-row"><span className="detail-label">Phone</span><span className="detail-value">{user?.phone || 'N/A'}</span></div>
                  <div className="detail-row"><span className="detail-label">Gender</span><span className="detail-value">{user?.gender || 'N/A'}</span></div>
                  <div className="detail-row"><span className="detail-label">Date of Birth</span><span className="detail-value">{user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'N/A'}</span></div>
                  <div className="detail-row"><span className="detail-label">Address</span><span className="detail-value">{user?.address || 'N/A'}</span></div>
                  <div className="detail-row"><span className="detail-label">Blood Group</span><span className="detail-value">{user?.bloodGroup || 'N/A'}</span></div>
                  <div className="detail-row"><span className="detail-label">Member Since</span><span className="detail-value">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</span></div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'book-appointment' && (
            <div className="form-card">
              <h3>Book an Appointment</h3>
              <form onSubmit={(e) => { e.preventDefault(); setShowBookModal(true); }}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Select Doctor</label>
                    <select value={bookForm.doctor} onChange={(e) => setBookForm({...bookForm, doctor: e.target.value})} required>
                      <option value="">Choose a doctor</option>
                      {doctors.map(d => (
                        <option key={d._id} value={d._id}>Dr. {d.name} - {d.specialization}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Date</label>
                    <input type="date" value={bookForm.appointmentDate} onChange={(e) => setBookForm({...bookForm, appointmentDate: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>Time Slot</label>
                    <select value={bookForm.appointmentTime} onChange={(e) => setBookForm({...bookForm, appointmentTime: e.target.value})} required>
                      <option value="">Select Time</option>
                      <option value="09:00 AM">09:00 AM</option>
                      <option value="10:00 AM">10:00 AM</option>
                      <option value="11:00 AM">11:00 AM</option>
                      <option value="12:00 PM">12:00 PM</option>
                      <option value="02:00 PM">02:00 PM</option>
                      <option value="03:00 PM">03:00 PM</option>
                      <option value="04:00 PM">04:00 PM</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Department</label>
                    <select value={bookForm.department} onChange={(e) => setBookForm({...bookForm, department: e.target.value})}>
                      <option value="">Select</option>
                      <option value="General Medicine">General Medicine</option>
                      <option value="Cardiology">Cardiology</option>
                      <option value="Orthopedics">Orthopedics</option>
                      <option value="Pediatrics">Pediatrics</option>
                      <option value="Neurology">Neurology</option>
                      <option value="Emergency Care">Emergency Care</option>
                    </select>
                  </div>
                  <div className="form-group-full">
                    <label>Reason for Visit</label>
                    <textarea rows="2" value={bookForm.reason} onChange={(e) => setBookForm({...bookForm, reason: e.target.value})} />
                  </div>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary"><i className="fas fa-calendar-plus"></i> Review Booking</button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'appointments' && (
            <div className="dashboard-section">
              <div className="section-header-dash">
                <h3>Appointment History</h3>
                <button className="btn btn-primary btn-sm" onClick={() => setActiveTab('book-appointment')}>
                  <i className="fas fa-plus"></i> Book New
                </button>
              </div>
              <div className="table-container">
                <table className="data-table">
                  <thead><tr><th>Doctor</th><th>Date</th><th>Time</th><th>Department</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>
                    {appointments.map(apt => (
                      <tr key={apt._id}>
                        <td>Dr. {apt.doctor?.name || 'N/A'}</td>
                        <td>{new Date(apt.appointmentDate).toLocaleDateString()}</td>
                        <td>{apt.appointmentTime}</td>
                        <td>{apt.department || 'N/A'}</td>
                        <td><span className={`status-badge ${apt.status}`}>{apt.status}</span></td>
                        <td>
                          {(apt.status === 'pending' || apt.status === 'confirmed') && (
                            <button className="action-btn delete" onClick={() => handleCancelAppointment(apt._id)} title="Cancel">
                              <i className="fas fa-times"></i>
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

          {activeTab === 'medical-records' && (
            <div className="dashboard-section">
              <div className="section-header-dash"><h3>Medical Records</h3></div>
              {medicalRecords.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#94a3b8', padding: '30px' }}>No medical records found</p>
              ) : (
                medicalRecords.map(record => (
                  <div key={record._id} className="appointment-card">
                    <div className="appointment-info">
                      <h4>Dr. {record.doctor?.name || 'N/A'}</h4>
                      <p><i className="fas fa-calendar"></i> {new Date(record.createdAt).toLocaleDateString()}</p>
                      <p><i className="fas fa-stethoscope"></i> Diagnosis: {record.diagnosis}</p>
                      <div style={{ marginTop: '10px' }}>
                        <strong>Medications:</strong>
                        <ul style={{ margin: '5px 0 0 20px', fontSize: '14px', color: '#475569' }}>
                          {(record.medications || []).map((med, i) => (
                            <li key={i}>{med.name} - {med.dosage}, {med.frequency}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))
              )}
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          )}

          {activeTab === 'prescriptions' && (
            <div className="dashboard-section">
              <div className="section-header-dash"><h3>My Prescriptions</h3></div>
              {prescriptions.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#94a3b8', padding: '30px' }}>No prescriptions yet</p>
              ) : (
                prescriptions.map(p => (
                  <div key={p._id} className="appointment-card">
                    <div className="appointment-info">
                      <h4>Dr. {p.doctor?.name || 'N/A'}</h4>
                      <p><i className="fas fa-calendar"></i> {new Date(p.createdAt).toLocaleDateString()}</p>
                      <p><i className="fas fa-stethoscope"></i> Diagnosis: {p.diagnosis}</p>
                      <div style={{ marginTop: '10px' }}>
                        <strong>Medications:</strong>
                        <ul style={{ margin: '5px 0 0 20px', fontSize: '14px', color: '#475569' }}>
                          {(p.medications || []).map((med, i) => (
                            <li key={i}>{med.name} - {med.dosage}, {med.frequency} for {med.duration}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))
              )}
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          )}

          {activeTab === 'bills' && (
            <div className="dashboard-section">
              <div className="section-header-dash"><h3>My Bills</h3></div>
              <div className="table-container">
                <table className="data-table">
                  <thead><tr><th>Bill #</th><th>Date</th><th>Amount</th><th>Payment Method</th><th>Status</th></tr></thead>
                  <tbody>
                    {bills.map(b => (
                      <tr key={b._id}>
                        <td>{b.billNumber || 'N/A'}</td>
                        <td>{new Date(b.createdAt).toLocaleDateString()}</td>
                        <td>${(b.totalAmount || 0).toLocaleString()}</td>
                        <td>{b.paymentMethod || 'N/A'}</td>
                        <td><span className={`status-badge ${b.paymentStatus}`}>{b.paymentStatus}</span></td>
                      </tr>
                    ))}
                    {bills.length === 0 && (
                      <tr><td colSpan="5" style={{ textAlign: 'center', color: '#94a3b8' }}>No bills</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="dashboard-section">
              <div className="section-header-dash"><h3>Notifications</h3></div>
              {notifications.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#94a3b8', padding: '30px' }}>No notifications</p>
              ) : (
                notifications.map((n, i) => (
                  <div key={i} className="appointment-card">
                    <div className="appointment-info">
                      <p><i className={`fas ${n.type === 'appointment' ? 'fa-calendar-check' : 'fa-file-invoice-dollar'}`} style={{color: n.type === 'appointment' ? '#4f46e5' : '#f97316', marginRight: '8px'}}></i>
                        {n.message}</p>
                      <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '5px' }}>{new Date(n.date).toLocaleDateString()}</p>
                    </div>
                    <span className={`status-badge ${n.status}`}>{n.status}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Book Appointment Confirmation Modal */}
      {showBookModal && (
        <div className="modal-overlay" onClick={() => setShowBookModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Confirm Appointment</h3>
              <button className="modal-close" onClick={() => setShowBookModal(false)}><i className="fas fa-times"></i></button>
            </div>
            <div className="modal-body">
              <p style={{ marginBottom: '20px', color: '#64748b' }}>Are you sure you want to book this appointment?</p>
              <div className="form-actions">
                <button className="btn btn-outline" onClick={() => setShowBookModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleBookAppointment}>
                  <i className="fas fa-check"></i> Confirm Booking
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;

