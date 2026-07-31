const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const {
  getStats,
  getUsersByRole,
  createUser,
  updateUser,
  deleteUser,
  getAllAppointments,
  getAllPrescriptions,
  getAllBills,
  updateAppointmentStatus,
  createBill,
  updateBill,
  deleteBill
} = require('../controllers/adminController');

const router = express.Router();

// All routes require admin access
router.use(protect, authorize('admin'));

router.get('/stats', getStats);
router.get('/users/:role', getUsersByRole);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.get('/appointments', getAllAppointments);
router.put('/appointments/:id/status', updateAppointmentStatus);
router.get('/prescriptions', getAllPrescriptions);
router.get('/bills', getAllBills);
router.post('/bills', createBill);
router.put('/bills/:id', updateBill);
router.delete('/bills/:id', deleteBill);

module.exports = router;

