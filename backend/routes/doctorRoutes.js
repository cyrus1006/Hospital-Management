const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const {
  getMyAppointments,
  getTodayAppointments,
  updateAppointmentStatus,
  createPrescription,
  getMyPrescriptions,
  updateAvailability,
  getPatientDetails,
  getMyPatients,
  getUpcomingAppointments
} = require('../controllers/doctorController');

const router = express.Router();

router.use(protect, authorize('doctor'));

router.get('/appointments', getMyAppointments);
router.get('/today-appointments', getTodayAppointments);
router.put('/appointments/:id/status', updateAppointmentStatus);
router.post('/prescriptions', createPrescription);
router.get('/prescriptions', getMyPrescriptions);
router.put('/availability', updateAvailability);
router.get('/patients/:id', getPatientDetails);
router.get('/patients', getMyPatients);
router.get('/upcoming-appointments', getUpcomingAppointments);

module.exports = router;

