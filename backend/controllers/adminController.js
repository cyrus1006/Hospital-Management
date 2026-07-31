const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const Bill = require('../models/Bill');

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getStats = async (req, res) => {
  try {
    const totalPatients = await User.countDocuments({ role: 'patient', isActive: true });
    const totalDoctors = await User.countDocuments({ role: 'doctor', isActive: true });
    const totalAppointments = await Appointment.countDocuments();
    const totalBills = await Bill.countDocuments();
    const totalRevenue = await Bill.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    // Get recent appointments
    const recentAppointments = await Appointment.find()
      .populate('patient', 'name email phone')
      .populate('doctor', 'name email specialization')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get recent registrations (patients)
    const recentRegistrations = await User.find({ role: 'patient' })
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalPatients,
      totalDoctors,
      totalAppointments,
      totalBills,
      totalRevenue: totalRevenue[0]?.total || 0,
      recentAppointments,
      recentRegistrations
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all users by role
// @route   GET /api/admin/users/:role
// @access  Private/Admin
const getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;
    const { search, page = 1, limit = 10 } = req.query;

    const validRoles = ['patient', 'doctor'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    let query = { role };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      users,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create doctor (admin creates doctor accounts)
// @route   POST /api/admin/users
// @access  Private/Admin
const createUser = async (req, res) => {
  try {
    const { name, email, password, phone, address, gender, specialization, experience, qualifications, department, consultationFee } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      address,
      gender,
      role: 'doctor',
      specialization,
      experience,
      qualifications: qualifications || [],
      department,
      consultationFee: consultationFee || 0,
      availability: true,
      isActive: true
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      specialization: user.specialization
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
  try {
    const { name, email, phone, address, gender, specialization, experience, qualifications, isActive, department, consultationFee } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (gender) user.gender = gender;
    if (typeof isActive === 'boolean') user.isActive = isActive;

    if (user.role === 'doctor') {
      if (specialization) user.specialization = specialization;
      if (experience) user.experience = experience;
      if (qualifications) user.qualifications = qualifications;
      if (department) user.department = department;
      if (consultationFee) user.consultationFee = consultationFee;
    }

    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Soft delete
    user.isActive = false;
    await user.save();
    res.json({ message: 'User deactivated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Manage all appointments
// @route   GET /api/admin/appointments
// @access  Private/Admin
const getAllAppointments = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;
    let query = {};

    if (status) query.status = status;
    if (search) {
      query.$or = [
        { reason: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Appointment.countDocuments(query);
    const appointments = await Appointment.find(query)
      .populate('patient', 'name email phone')
      .populate('doctor', 'name email specialization')
      .sort({ createdAt: -1 })
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

// @desc    Manage all prescriptions
// @route   GET /api/admin/prescriptions
// @access  Private/Admin
const getAllPrescriptions = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const total = await Prescription.countDocuments();
    const prescriptions = await Prescription.find()
      .populate('patient', 'name email')
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

// @desc    Manage all bills
// @route   GET /api/admin/bills
// @access  Private/Admin
const getAllBills = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    let query = {};
    if (status) query.paymentStatus = status;

    const total = await Bill.countDocuments(query);
    const bills = await Bill.find(query)
      .populate('patient', 'name email phone')
      .populate('generatedBy', 'name')
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

// @desc    Update appointment status
// @route   PUT /api/admin/appointments/:id/status
// @access  Private/Admin
const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
      .populate('patient', 'name email phone')
      .populate('doctor', 'name email specialization');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.json(appointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create bill
// @route   POST /api/admin/bills
// @access  Private/Admin
const createBill = async (req, res) => {
  try {
    const { patient, appointment, items, consultationFee, notes, paymentStatus, paymentMethod } = req.body;

    const totalAmount = items.reduce((sum, item) => sum + item.amount, 0) + (consultationFee || 0);

    const bill = await Bill.create({
      patient,
      appointment,
      items: items || [],
      consultationFee: consultationFee || 0,
      totalAmount,
      paymentStatus: paymentStatus || 'pending',
      paymentMethod: paymentMethod || '',
      generatedBy: req.user._id,
      notes
    });

    const populatedBill = await Bill.findById(bill._id)
      .populate('patient', 'name email phone')
      .populate('appointment');

    res.status(201).json(populatedBill);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update bill
// @route   PUT /api/admin/bills/:id
// @access  Private/Admin
const updateBill = async (req, res) => {
  try {
    const { items, consultationFee, paymentStatus, paymentMethod, notes } = req.body;
    
    const bill = await Bill.findById(req.params.id);
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    if (items) bill.items = items;
    if (consultationFee !== undefined) bill.consultationFee = consultationFee;
    if (paymentStatus) bill.paymentStatus = paymentStatus;
    if (paymentMethod) bill.paymentMethod = paymentMethod;
    if (notes) bill.notes = notes;

    // Recalculate total if items or consultationFee changed
    if (items || consultationFee !== undefined) {
      bill.totalAmount = bill.items.reduce((sum, item) => sum + item.amount, 0) + (bill.consultationFee || 0);
    }

    if (paymentStatus === 'paid' && !bill.paymentDate) {
      bill.paymentDate = new Date();
    }

    const updatedBill = await bill.save();
    const populatedBill = await Bill.findById(updatedBill._id)
      .populate('patient', 'name email phone')
      .populate('appointment');

    res.json(populatedBill);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete bill
// @route   DELETE /api/admin/bills/:id
// @access  Private/Admin
const deleteBill = async (req, res) => {
  try {
    const bill = await Bill.findByIdAndDelete(req.params.id);
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }
    res.json({ message: 'Bill deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getStats, getUsersByRole, createUser, updateUser, deleteUser, getAllAppointments, getAllPrescriptions, getAllBills, updateAppointmentStatus, createBill, updateBill, deleteBill };

