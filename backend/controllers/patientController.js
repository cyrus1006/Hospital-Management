const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const Bill = require('../models/Bill');

// @desc    Get patient dashboard data
// @route   GET /api/patient/dashboard
// @access  Private/Patient
const getDashboard = async (req, res) => {
  try {
    const totalAppointments = await Appointment.countDocuments({ patient: req.user._id });
    const upcomingAppointments = await Appointment.countDocuments({
      patient: req.user._id,
      appointmentDate: { $gte: new Date() },
      status: { $in: ['pending', 'confirmed'] }
    });
    const totalPrescriptions = await Prescription.countDocuments({ patient: req.user._id });
    const totalBills = await Bill.countDocuments({ patient: req.user._id });
    const pendingBills = await Bill.countDocuments({ patient: req.user._id, paymentStatus: 'pending' });

    res.json({
      totalAppointments,
      upcomingAppointments,
      totalPrescriptions,
      totalBills,
      pendingBills
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get patient appointments
// @route   GET /api/patient/appointments
// @access  Private/Patient
const getMyAppointments = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    let query = { patient: req.user._id };
    if (status) query.status = status;

    const total = await Appointment.countDocuments(query);
    const appointments = await Appointment.find(query)
      .populate('doctor', 'name email specialization profileImage consultationFee')
      .sort({ appointmentDate: -1, appointmentTime: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      appointments,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Book appointment
// @route   POST /api/patient/appointments
// @access  Private/Patient
const bookAppointment = async (req, res) => {
  try {
    const { doctor, appointmentDate, appointmentTime, reason, department } = req.body;

    // Check if doctor exists and is available
    const doctorExists = await User.findOne({ _id: doctor, role: 'doctor', isActive: true });
    if (!doctorExists) {
      return res.status(400).json({ message: 'Doctor not found or not available' });
    }

    // Check if patient already has an appointment at the same time
    const existingAppointment = await Appointment.findOne({
      patient: req.user._id,
      appointmentDate: new Date(appointmentDate),
      appointmentTime,
      status: { $nin: ['cancelled'] }
    });

    if (existingAppointment) {
      return res.status(400).json({ message: 'You already have an appointment at this time' });
    }

    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor,
      appointmentDate: new Date(appointmentDate),
      appointmentTime,
      reason,
      department
    });

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('doctor', 'name email specialization profileImage');

    res.status(201).json(populatedAppointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Cancel appointment
// @route   PUT /api/patient/appointments/:id/cancel
// @access  Private/Patient
const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.id, patient: req.user._id, status: { $in: ['pending', 'confirmed'] } },
      { status: 'cancelled' },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found or cannot be cancelled' });
    }

    res.json(appointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get patient prescriptions
// @route   GET /api/patient/prescriptions
// @access  Private/Patient
const getMyPrescriptions = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const total = await Prescription.countDocuments({ patient: req.user._id });
    const prescriptions = await Prescription.find({ patient: req.user._id })
      .populate('doctor', 'name specialization')
      .populate('appointment')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      prescriptions,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get patient bills
// @route   GET /api/patient/bills
// @access  Private/Patient
const getMyBills = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    let query = { patient: req.user._id };
    if (status) query.paymentStatus = status;

    const total = await Bill.countDocuments(query);
    const bills = await Bill.find(query)
      .populate('appointment')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      bills,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get available doctors
// @route   GET /api/patient/doctors
// @access  Private/Patient
const getAvailableDoctors = async (req, res) => {
  try {
    const { specialization } = req.query;
    let query = { role: 'doctor', isActive: true, availability: true };
    if (specialization) query.specialization = { $regex: specialization, $options: 'i' };

    const doctors = await User.find(query).select('name email phone specialization experience qualifications consultationFee profileImage availability');
    res.json(doctors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get patient medical records
// @route   GET /api/patient/medical-records
// @access  Private/Patient
const getMedicalRecords = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const total = await Prescription.countDocuments({ patient: req.user._id });
    const prescriptions = await Prescription.find({ patient: req.user._id })
      .populate('doctor', 'name specialization')
      .populate('appointment')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      records: prescriptions,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get patient notifications
// @route   GET /api/patient/notifications
// @access  Private/Patient
const getNotifications = async (req, res) => {
  try {
    const today = new Date();
    
    // Get upcoming appointments as notifications
    const upcomingAppointments = await Appointment.find({
      patient: req.user._id,
      appointmentDate: { $gte: today },
      status: { $in: ['pending', 'confirmed'] }
    })
      .populate('doctor', 'name specialization')
      .sort({ appointmentDate: 1 })
      .limit(10);

    // Get recent bills as notifications
    const recentBills = await Bill.find({ patient: req.user._id, paymentStatus: 'pending' })
      .sort({ createdAt: -1 })
      .limit(5);

    const notifications = [];

    upcomingAppointments.forEach(apt => {
      notifications.push({
        type: 'appointment',
        message: `Upcoming appointment with Dr. ${apt.doctor?.name} on ${new Date(apt.appointmentDate).toLocaleDateString()} at ${apt.appointmentTime}`,
        date: apt.createdAt,
        status: apt.status,
        relatedId: apt._id
      });
    });

    recentBills.forEach(bill => {
      notifications.push({
        type: 'bill',
        message: `Pending bill of $${bill.totalAmount} requires payment`,
        date: bill.createdAt,
        status: bill.paymentStatus,
        relatedId: bill._id
      });
    });

    // Sort by date descending
    notifications.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json(notifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getDashboard, getMyAppointments, bookAppointment, cancelAppointment, getMyPrescriptions, getMyBills, getAvailableDoctors, getMedicalRecords, getNotifications };

