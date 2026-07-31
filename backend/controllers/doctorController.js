const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');

// @desc    Get doctor's appointments
// @route   GET /api/doctor/appointments
// @access  Private/Doctor
const getMyAppointments = async (req, res) => {
  try {
    const { status, date, page = 1, limit = 10 } = req.query;
    let query = { doctor: req.user._id };

    if (status) query.status = status;
    if (date) {
      const searchDate = new Date(date);
      query.appointmentDate = {
        $gte: new Date(searchDate.setHours(0, 0, 0, 0)),
        $lte: new Date(searchDate.setHours(23, 59, 59, 999))
      };
    }

    const total = await Appointment.countDocuments(query);
    const appointments = await Appointment.find(query)
      .populate('patient', 'name email phone gender dateOfBirth bloodGroup address profileImage')
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

// @desc    Get today's appointments
// @route   GET /api/doctor/today-appointments
// @access  Private/Doctor
const getTodayAppointments = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const appointments = await Appointment.find({
      doctor: req.user._id,
      appointmentDate: {
        $gte: today,
        $lt: tomorrow
      }
    })
      .populate('patient', 'name email phone gender dateOfBirth bloodGroup')
      .sort({ appointmentTime: 1 });

    res.json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update appointment status
// @route   PUT /api/doctor/appointments/:id/status
// @access  Private/Doctor
const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['confirmed', 'completed', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.id, doctor: req.user._id },
      { status },
      { new: true }
    )
      .populate('patient', 'name email phone')
      .populate('doctor', 'name specialization');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.json(appointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create prescription
// @route   POST /api/doctor/prescriptions
// @access  Private/Doctor
const createPrescription = async (req, res) => {
  try {
    const { patient, appointment, diagnosis, medications, tests, notes, followUpDate } = req.body;

    // Verify that the doctor has an appointment with this patient
    const appointmentExists = await Appointment.findOne({
      _id: appointment,
      doctor: req.user._id,
      patient
    });

    if (!appointmentExists) {
      return res.status(400).json({ message: 'No valid appointment found for this patient' });
    }

    const prescription = await Prescription.create({
      patient,
      doctor: req.user._id,
      appointment,
      diagnosis,
      medications,
      tests,
      notes,
      followUpDate
    });

    const populatedPrescription = await Prescription.findById(prescription._id)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name specialization');

    // Update appointment status to completed
    await Appointment.findByIdAndUpdate(appointment, { status: 'completed' });

    res.status(201).json(populatedPrescription);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get doctor's prescriptions
// @route   GET /api/doctor/prescriptions
// @access  Private/Doctor
const getMyPrescriptions = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const total = await Prescription.countDocuments({ doctor: req.user._id });
    const prescriptions = await Prescription.find({ doctor: req.user._id })
      .populate('patient', 'name email phone')
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

// @desc    Update doctor availability
// @route   PUT /api/doctor/availability
// @access  Private/Doctor
const updateAvailability = async (req, res) => {
  try {
    const { availability } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { availability },
      { new: true }
    );
    res.json({ availability: user.availability });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get patient details
// @route   GET /api/doctor/patients/:id
// @access  Private/Doctor
const getPatientDetails = async (req, res) => {
  try {
    const patient = await User.findOne({ _id: req.params.id, role: 'patient' });
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Get patient's appointment history with this doctor
    const appointments = await Appointment.find({
      patient: patient._id,
      doctor: req.user._id
    }).sort({ createdAt: -1 });

    const prescriptions = await Prescription.find({
      patient: patient._id,
      doctor: req.user._id
    }).sort({ createdAt: -1 });

    res.json({
      patient,
      appointments,
      prescriptions
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get doctor's patient list
// @route   GET /api/doctor/patients
// @access  Private/Doctor
const getMyPatients = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;

    // Find distinct patients who have appointments with this doctor
    const patientIds = await Appointment.distinct('patient', { doctor: req.user._id });

    let query = { _id: { $in: patientIds }, role: 'patient' };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await User.countDocuments(query);
    const patients = await User.find(query)
      .select('name email phone gender dateOfBirth bloodGroup address profileImage')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      patients,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get upcoming appointments
// @route   GET /api/doctor/upcoming-appointments
// @access  Private/Doctor
const getUpcomingAppointments = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const appointments = await Appointment.find({
      doctor: req.user._id,
      appointmentDate: { $gte: today },
      status: { $in: ['pending', 'confirmed'] }
    })
      .populate('patient', 'name email phone gender dateOfBirth bloodGroup')
      .sort({ appointmentDate: 1, appointmentTime: 1 })
      .limit(20);

    res.json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getMyAppointments, getTodayAppointments, updateAppointmentStatus, createPrescription, getMyPrescriptions, updateAvailability, getPatientDetails, getMyPatients, getUpcomingAppointments };

