import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { doctorAPI } from '../../services/api';
import { useToast } from '../../components/Toast';
import Sidebar from '../../components/Sidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import Pagination from '../../components/Pagination';
import { Link } from 'react-router-dom';
import '../../assets/styles/dashboard.css';

const DoctorDashboard = () => {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isAvailable, setIsAvailable] = useState(user?.availability !== false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [prescriptionForm, setPrescriptionForm] = useState({
    diagnosis: '', medications: [{ name: '', dosage: '', frequency: '', duration: '' }],
    notes: ''
  });

  useEffect(() => { loadData(); }, [activeTab, currentPage]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'overview') {
        const res = await doctorAPI.getTodayAppointments();
        setAppointments(Array.isArray(res.data) ? res.data : []);
      } else if (activeTab === 'today-appointments') {
        const res = await doctorAPI.getTodayAppointments();
        setAppointments(Array.isArray(res.data) ? res.data : []);
      } else if (activeTab === 'upcoming-appointments') {
        const res = await doctorAPI.getUpcomingAppointments();
        setAppointments(Array.isArray(res.data) ? res.data : []);
      } else if (activeTab === 'appointments') {
        const res = await doctorAPI.getAppointments({ page: currentPage, limit: 10 });
        setAppointments(res.data.appointments || []);
        setTotalPages(res.data.totalPages || 1);
      } else if (activeTab === 'patients') {
        const res = await doctorAPI.getMyPatients({ page: currentPage, limit: 10 });
        setPatients(res.data.patients || []);
        setTotalPages(res.data.totalPages || 1);
      } else if (activeTab === 'prescriptions-list') {
        const res = await doctorAPI.getPrescriptions({ page: currentPage, limit: 10 });
        setPrescriptions(res.data.prescriptions || []);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (error) {
      addToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await doctorAPI.updateAppointmentStatus(id, { status });
      addToast('Appointment status updated', 'success');
      loadData();
    } catch (error) {
      addToast('Failed to update status', 'error');
    }
  };

  const handleAddMedication = () => {
    setPrescriptionForm(prev => ({
      ...prev,
      medications: [...prev.medications, { name: '', dosage: '', frequency: '', duration: '' }]
    }));
  };

  const handleRemoveMedication = (index) => {
    setPrescriptionForm(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index)
    }));
  };

  const handleMedicationChange = (index, field, value) => {
    const medications = [...prescriptionForm.medications];
    medications[index][field] = value;
    setPrescriptionForm(prev => ({ ...prev, medications }));
  };

  const handleCreatePrescription = async (e) => {
    e.preventDefault();
    try {
      await doctorAPI.createPrescription({
        ...prescriptionForm,
        patient: selectedAppointment.patient._id,
        appointment: selectedAppointment._id
      });
      addToast('Prescription created successfully', 'success');
      setSelectedAppointment(null);
      setPrescriptionForm({ diagnosis: '', medications: [{ name: '', dosage: '', frequency: '', duration: '' }], notes: '' });
      loadData();
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to create prescription', 'error');
    }
  };

  const handleToggleAvailability = async () => {
    try {
      await doctorAPI.updateAvailability({ availability: !isAvailable });
      setIsAvailable(!isAvailable);
      addToast(`You are now ${!isAvailable ? 'available' : 'unavailable'}`, 'success');
    } catch (error) {
      addToast('Failed to update availability', 'error');
    }
  };

  const tabs = ['overview', 'today-appointments', 'upcoming-appointments', 'patients', 'prescriptions', 'profile'];

  const getTabLabel = (tab) => {
    const labels = {
      'overview': 'Dashboard',
      'today-appointments': "Today's Appointments",
      'upcoming-appointments': 'Upcoming Appointments',
      'patients': 'Patient List',
      'prescriptions': 'Prescriptions',
      'profile': 'Profile'
    };
    return labels[tab] || tab;
  };

  if (loading && activeTab === 'overview') return <LoadingSpinner />;

  return (
    <div className="dashboard-layout">
      <Sidebar user={user} />
      <div className="dashboard-main">
        <div className="dashboard-topbar">
          <h2>Doctor Dashboard</h2>
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
              <button key={tab} className={`tab ${activeTab === tab ? 'active' : ''}`} onClick={() => { setActiveTab(tab); setCurrentPage(1); }}>
                {getTabLabel(tab)}
              </button>
            ))}
          </div>

          {activeTab === 'overview' && (
            <>
              <div className="stats-grid">
                <div className="stat-card-dash">
                  <div className="stat-icon blue"><i className="fas fa-calendar-day"></i></div>
                  <div className="stat-info"><h3>{appointments.length}</h3><p>Today's Appointments</p></div>
                </div>
                <div className="stat-card-dash">
                  <div className="stat-icon green">
                    <div className="availability-toggle">
                      <input type="checkbox" checked={isAvailable} onChange={handleToggleAvailability} />
                    </div>
                  </div>
                  <div className="stat-info"><h3>{isAvailable ? 'Available' : 'Unavailable'}</h3><p>Current Status</p></div>
                </div>
              </div>

              <div className="dashboard-section">
                <div className="section-header-dash">
                  <h3>Today's Appointments</h3>
                </div>
                {appointments.length === 0 ? (
                  <p style={{ color: '#94a3b8', textAlign: 'center', padding: '30px' }}>No appointments for today</p>
                ) : (
                  appointments.map(apt => (
                    <div key={apt._id} className="appointment-card">
                      <div className="appointment-info">
                        <h4>{apt.patient?.name || 'Patient'}</h4>
                        <p><i className="fas fa-clock"></i> {apt.appointmentTime}</p>
                        <p><i className="fas fa-phone"></i> {apt.patient?.phone || 'N/A'}</p>
                        <p><i className="fas fa-stethoscope"></i> {apt.reason}</p>
                      </div>
                      <div className="appointment-actions">
                        {apt.status === 'pending' && (
                          <>
                            <button className="btn btn-primary btn-sm" onClick={() => handleUpdateStatus(apt._id, 'confirmed')}>
                              <i className="fas fa-check"></i> Confirm
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleUpdateStatus(apt._id, 'cancelled')}>
                              <i className="fas fa-times"></i> Cancel
                            </button>
                          </>
                        )}
                        {apt.status === 'confirmed' && (
                          <>
                            <button className="btn btn-primary btn-sm" onClick={() => handleUpdateStatus(apt._id, 'completed')}>
                              <i className="fas fa-check-double"></i> Complete
                            </button>
                            <button className="btn btn-outline btn-sm" onClick={() => { setSelectedAppointment(apt); setActiveTab('prescriptions'); }}>
                              <i className="fas fa-prescription"></i> Prescribe
                            </button>
                          </>
                        )}
                        <span className={`status-badge ${apt.status}`}>{apt.status}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}

          {activeTab === 'today-appointments' && (
            <div className="dashboard-section">
              <div className="section-header-dash"><h3>Today's Appointments</h3></div>
              {appointments.length === 0 ? (
                <p style={{ color: '#94a3b8', textAlign: 'center', padding: '30px' }}>No appointments for today</p>
              ) : (
                appointments.map(apt => (
                  <div key={apt._id} className="appointment-card">
                    <div className="appointment-info">
                      <h4>{apt.patient?.name || 'Patient'}</h4>
                      <p><i className="fas fa-clock"></i> {apt.appointmentTime}</p>
                      <p><i className="fas fa-phone"></i> {apt.patient?.phone || 'N/A'}</p>
                      <p><i className="fas fa-stethoscope"></i> {apt.reason}</p>
                    </div>
                    <div className="appointment-actions">
                      {apt.status === 'pending' && (
                        <>
                          <button className="btn btn-primary btn-sm" onClick={() => handleUpdateStatus(apt._id, 'confirmed')}><i className="fas fa-check"></i> Confirm</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleUpdateStatus(apt._id, 'cancelled')}><i className="fas fa-times"></i> Cancel</button>
                        </>
                      )}
                      {apt.status === 'confirmed' && (
                        <button className="btn btn-primary btn-sm" onClick={() => handleUpdateStatus(apt._id, 'completed')}><i className="fas fa-check-double"></i> Complete</button>
                      )}
                      <span className={`status-badge ${apt.status}`}>{apt.status}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'upcoming-appointments' && (
            <div className="dashboard-section">
              <div className="section-header-dash"><h3>Upcoming Appointments</h3></div>
              <div className="table-container">
                <table className="data-table">
                  <thead><tr><th>Patient</th><th>Date</th><th>Time</th><th>Reason</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>
                    {appointments.map(apt => (
                      <tr key={apt._id}>
                        <td>{apt.patient?.name || 'N/A'}</td>
                        <td>{new Date(apt.appointmentDate).toLocaleDateString()}</td>
                        <td>{apt.appointmentTime}</td>
                        <td>{apt.reason || 'N/A'}</td>
                        <td><span className={`status-badge ${apt.status}`}>{apt.status}</span></td>
                        <td>
                          <button className="action-btn" onClick={() => handleUpdateStatus(apt._id, 'confirmed')} title="Confirm"><i className="fas fa-check" style={{color: '#10b981'}}></i></button>
                          <button className="action-btn delete" onClick={() => handleUpdateStatus(apt._id, 'cancelled')} title="Cancel"><i className="fas fa-times"></i></button>
                        </td>
                      </tr>
                    ))}
                    {appointments.length === 0 && <tr><td colSpan="6" style={{textAlign: 'center', color: '#94a3b8'}}>No upcoming appointments</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'patients' && (
            <div className="dashboard-section">
              <div className="section-header-dash"><h3>My Patients</h3></div>
              <div className="table-container">
                <table className="data-table">
                  <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Gender</th><th>Blood Group</th></tr></thead>
                  <tbody>
                    {patients.map(p => (
                      <tr key={p._id}>
                        <td>{p.name}</td>
                        <td>{p.email}</td>
                        <td>{p.phone || 'N/A'}</td>
                        <td>{p.gender || 'N/A'}</td>
                        <td>{p.bloodGroup || 'N/A'}</td>
                      </tr>
                    ))}
                    {patients.length === 0 && <tr><td colSpan="5" style={{textAlign: 'center', color: '#94a3b8'}}>No patients found</td></tr>}
                  </tbody>
                </table>
              </div>
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          )}

          {activeTab === 'prescriptions' && (
            <div className="form-card">
              <h3>{selectedAppointment ? `Create Prescription for ${selectedAppointment.patient?.name}` : 'Create Prescription'}</h3>
              {!selectedAppointment && (
                <p style={{ color: '#94a3b8', marginBottom: '20px' }}>Select an appointment from the Dashboard or Today's Appointments to create a prescription.</p>
              )}
              {selectedAppointment && (
                <form onSubmit={handleCreatePrescription}>
                  <div className="form-grid">
                    <div className="form-group-full">
                      <label>Diagnosis</label>
                      <textarea rows="3" value={prescriptionForm.diagnosis}
                        onChange={(e) => setPrescriptionForm({ ...prescriptionForm, diagnosis: e.target.value })} required />
                    </div>
                    <div className="form-group-full">
                      <label>Medications</label>
                      {prescriptionForm.medications.map((med, i) => (
                        <div key={i} className="form-grid" style={{ marginBottom: '15px', padding: '15px', background: '#f8fafc', borderRadius: '10px' }}>
                          <div className="form-group">
                            <label>Medicine Name</label>
                            <input type="text" value={med.name} onChange={(e) => handleMedicationChange(i, 'name', e.target.value)} required />
                          </div>
                          <div className="form-group">
                            <label>Dosage</label>
                            <input type="text" placeholder="e.g., 500mg" value={med.dosage} onChange={(e) => handleMedicationChange(i, 'dosage', e.target.value)} required />
                          </div>
                          <div className="form-group">
                            <label>Frequency</label>
                            <input type="text" placeholder="e.g., Twice daily" value={med.frequency} onChange={(e) => handleMedicationChange(i, 'frequency', e.target.value)} required />
                          </div>
                          <div className="form-group">
                            <label>Duration</label>
                            <input type="text" placeholder="e.g., 7 days" value={med.duration} onChange={(e) => handleMedicationChange(i, 'duration', e.target.value)} required />
                          </div>
                          {prescriptionForm.medications.length > 1 && (
                            <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
                              <button type="button" className="btn btn-danger btn-sm" onClick={() => handleRemoveMedication(i)}>
                                <i className="fas fa-minus"></i> Remove
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                      <button type="button" className="btn btn-outline btn-sm" onClick={handleAddMedication}>
                        <i className="fas fa-plus"></i> Add Medication
                      </button>
                    </div>
                    <div className="form-group-full">
                      <label>Additional Notes</label>
                      <textarea rows="2" value={prescriptionForm.notes}
                        onChange={(e) => setPrescriptionForm({ ...prescriptionForm, notes: e.target.value })} />
                    </div>
                  </div>
                  <div className="form-actions">
                    <button type="button" className="btn btn-outline" onClick={() => setSelectedAppointment(null)}>Cancel</button>
                    <button type="submit" className="btn btn-primary"><i className="fas fa-prescription"></i> Create Prescription</button>
                  </div>
                </form>
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="form-card">
              <h3>My Profile</h3>
              <div className="profile-view">
                <div className="profile-avatar">
                  <i className="fas fa-user-md"></i>
                  <h3>{user?.name}</h3>
                </div>
                <div className="profile-details">
                  <div className="detail-row"><span className="detail-label">Email</span><span className="detail-value">{user?.email}</span></div>
                  <div className="detail-row"><span className="detail-label">Phone</span><span className="detail-value">{user?.phone || 'N/A'}</span></div>
                  <div className="detail-row"><span className="detail-label">Specialization</span><span className="detail-value">{user?.specialization || 'N/A'}</span></div>
                  <div className="detail-row"><span className="detail-label">Experience</span><span className="detail-value">{user?.experience || '0'} years</span></div>
                  <div className="detail-row"><span className="detail-label">Status</span><span className="detail-value">
                    <span className={`status-badge ${isAvailable ? 'active' : 'inactive'}`}>{isAvailable ? 'Available' : 'Unavailable'}</span>
                  </span></div>
                </div>
              </div>
              <div style={{ marginTop: '20px' }}>
                <button className="btn btn-primary" onClick={handleToggleAvailability}>
                  <i className={`fas ${isAvailable ? 'fa-pause-circle' : 'fa-play-circle'}`}></i>
                  {isAvailable ? 'Go Unavailable' : 'Go Available'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;

