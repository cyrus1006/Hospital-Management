const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const {
  getDashboard,
  getMyAppointments,
  bookAppointment,
  cancelAppointment,
  getMyPrescriptions,
  getMyBills,
  getAvailableDoctors,
  getMedicalRecords,
  getNotifications
} = require('../controllers/patientController');

const router = express.Router();

router.use(protect, authorize('patient'));

router.get('/dashboard', getDashboard);
router.get('/appointments', getMyAppointments);
router.post('/appointments', bookAppointment);
router.put('/appointments/:id/cancel', cancelAppointment);
router.get('/prescriptions', getMyPrescriptions);
router.get('/bills', getMyBills);
router.get('/doctors', getAvailableDoctors);
router.get('/medical-records', getMedicalRecords);
router.get('/notifications', getNotifications);

module.exports = router;

