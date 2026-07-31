const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Appointment = require('./models/Appointment');
const Prescription = require('./models/Prescription');
const Bill = require('./models/Bill');

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected...');

    // Clear existing data
    await User.deleteMany({});
    await Appointment.deleteMany({});
    await Prescription.deleteMany({});
    await Bill.deleteMany({});
    console.log('Cleared existing data...');

    // Create Admin
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@hospital.com',
      password: 'admin123',
      role: 'admin',
      phone: '1234567890',
      address: 'Hospital Admin Office',
      gender: 'male'
    });
    console.log('Admin created:', admin.email);

    // Create Doctors
    const doctors = await User.create([
      {
        name: 'Dr. John Smith',
        email: 'john.smith@hospital.com',
        password: 'doctor123',
        role: 'doctor',
        phone: '9876543210',
        specialization: 'General Medicine',
        department: 'General Medicine',
        experience: 15,
        qualifications: ['MBBS', 'MD - General Medicine'],
        consultationFee: 500,
        availability: true,
        gender: 'male'
      },
      {
        name: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@hospital.com',
        password: 'doctor123',
        role: 'doctor',
        phone: '9876543211',
        specialization: 'Cardiology',
        department: 'Cardiology',
        experience: 12,
        qualifications: ['MBBS', 'MD - Cardiology', 'DM - Cardiology'],
        consultationFee: 1000,
        availability: true,
        gender: 'female'
      },
      {
        name: 'Dr. Michael Brown',
        email: 'michael.brown@hospital.com',
        password: 'doctor123',
        role: 'doctor',
        phone: '9876543212',
        specialization: 'Orthopedics',
        department: 'Orthopedics',
        experience: 10,
        qualifications: ['MBBS', 'MS - Orthopedics'],
        consultationFee: 800,
        availability: true,
        gender: 'male'
      },
      {
        name: 'Dr. Emily Wilson',
        email: 'emily.wilson@hospital.com',
        password: 'doctor123',
        role: 'doctor',
        phone: '9876543213',
        specialization: 'Pediatrics',
        department: 'Pediatrics',
        experience: 8,
        qualifications: ['MBBS', 'MD - Pediatrics'],
        consultationFee: 600,
        availability: true,
        gender: 'female'
      },
      {
        name: 'Dr. Robert Davis',
        email: 'robert.davis@hospital.com',
        password: 'doctor123',
        role: 'doctor',
        phone: '9876543214',
        specialization: 'Neurology',
        department: 'Neurology',
        experience: 14,
        qualifications: ['MBBS', 'MD - Neurology', 'DM - Neurology'],
        consultationFee: 1200,
        availability: true,
        gender: 'male'
      },
      {
        name: 'Dr. Lisa Anderson',
        email: 'lisa.anderson@hospital.com',
        password: 'doctor123',
        role: 'doctor',
        phone: '9876543215',
        specialization: 'Emergency Care',
        department: 'Emergency Care',
        experience: 9,
        qualifications: ['MBBS', 'MD - Emergency Medicine'],
        consultationFee: 700,
        availability: true,
        gender: 'female'
      }
    ]);
    console.log(`${doctors.length} Doctors created`);

    // Create Patients
    const patients = await User.create([
      {
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'patient123',
        role: 'patient',
        phone: '9988776655',
        address: '123 Main Street, New York',
        gender: 'male',
        dateOfBirth: new Date('1990-05-15'),
        bloodGroup: 'A+'
      },
      {
        name: 'Jane Smith',
        email: 'jane.smith@gmail.com',
        password: 'patient123',
        role: 'patient',
        phone: '9988776654',
        address: '456 Oak Avenue, Los Angeles',
        gender: 'female',
        dateOfBirth: new Date('1995-08-20'),
        bloodGroup: 'B+'
      },
      {
        name: 'Bob Wilson',
        email: 'bob.wilson@example.com',
        password: 'patient123',
        role: 'patient',
        phone: '9988776653',
        address: '789 Pine Road, Chicago',
        gender: 'male',
        dateOfBirth: new Date('1985-12-10'),
        bloodGroup: 'O+'
      },
      {
        name: 'Alice Brown',
        email: 'alice.brown@gmail.com',
        password: 'patient123',
        role: 'patient',
        phone: '9988776652',
        address: '321 Elm Street, Houston',
        gender: 'female',
        dateOfBirth: new Date('1992-03-25'),
        bloodGroup: 'AB+'
      }
    ]);
    console.log(`${patients.length} Patients created`);

    // Create sample appointments
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const appointments = await Appointment.create([
      {
        patient: patients[0]._id,
        doctor: doctors[0]._id,
        appointmentDate: tomorrow,
        appointmentTime: '09:00 AM',
        status: 'confirmed',
        reason: 'Regular checkup and fever',
        department: 'General Medicine'
      },
      {
        patient: patients[1]._id,
        doctor: doctors[1]._id,
        appointmentDate: tomorrow,
        appointmentTime: '10:00 AM',
        status: 'confirmed',
        reason: 'Heart checkup',
        department: 'Cardiology'
      },
      {
        patient: patients[2]._id,
        doctor: doctors[2]._id,
        appointmentDate: tomorrow,
        appointmentTime: '11:00 AM',
        status: 'pending',
        reason: 'Knee pain',
        department: 'Orthopedics'
      },
      {
        patient: patients[3]._id,
        doctor: doctors[3]._id,
        appointmentDate: tomorrow,
        appointmentTime: '02:00 PM',
        status: 'pending',
        reason: 'Child vaccination',
        department: 'Pediatrics'
      }
    ]);
    console.log(`${appointments.length} Appointments created`);

    // Create sample prescription
    const prescription = await Prescription.create({
      patient: patients[0]._id,
      doctor: doctors[0]._id,
      appointment: appointments[0]._id,
      diagnosis: 'Viral fever and mild dehydration',
      medications: [
        {
          name: 'Paracetamol',
          dosage: '500mg',
          frequency: 'Twice a day',
          duration: '5 days',
          instructions: 'Take after meals'
        },
        {
          name: 'ORS',
          dosage: '1 sachet',
          frequency: 'As needed',
          duration: '3 days',
          instructions: 'Mix in 1 liter water and drink'
        }
      ],
      tests: [
        {
          name: 'Complete Blood Count',
          instructions: 'Fasting required'
        }
      ],
      notes: 'Rest for 2 days. Stay hydrated.',
      followUpDate: new Date(tomorrow.getTime() + 3 * 24 * 60 * 60 * 1000)
    });
    console.log('Sample prescription created');

    // Create sample bill
    const bill = await Bill.create({
      patient: patients[0]._id,
      appointment: appointments[0]._id,
      items: [
        { description: 'Consultation Fee', amount: 500 },
        { description: 'Blood Test', amount: 300 },
        { description: 'Medicine', amount: 250 }
      ],
      consultationFee: 500,
      totalAmount: 1050,
      paymentStatus: 'paid',
      paymentMethod: 'cash',
      paymentDate: new Date(),
      generatedBy: admin._id
    });
    console.log('Sample bill created');

    console.log('\n==========================================');
    console.log('  SEED DATA CREATED SUCCESSFULLY!');
    console.log('==========================================');
    console.log('\n--- Login Credentials ---');
    console.log('Admin:         admin@hospital.com / admin123');
    console.log('Doctor:        john.smith@hospital.com / doctor123');
    console.log('Patient:       john.doe@example.com / patient123');
    console.log('==========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();

