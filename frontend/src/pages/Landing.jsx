import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../assets/styles/landing.css';

const Landing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [counters, setCounters] = useState({
    doctors: 0,
    patients: 0,
    appointments: 0,
    departments: 0
  });
  const statsRef = useRef(null);
  const [statsVisible, setStatsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsVisible(true);
        }
      },
      { threshold: 0.5 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => {
      if (statsRef.current) {
        observer.unobserve(statsRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!statsVisible) return;

    const targets = { doctors: 150, patients: 5000, appointments: 12000, departments: 15 };
    const duration = 2000;
    const steps = 60;
    const increment = {};

    Object.keys(targets).forEach(key => {
      increment[key] = targets[key] / steps;
    });

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      setCounters(prev => {
        const newCounters = {};
        Object.keys(targets).forEach(key => {
          newCounters[key] = Math.min(Math.round(increment[key] * currentStep), targets[key]);
        });
        return newCounters;
      });

      if (currentStep >= steps) {
        clearInterval(timer);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [statsVisible]);

  const handleBookAppointment = () => {
    if (user) {
      navigate(`/${user.role}-dashboard/book-appointment`);
    } else {
      navigate('/login', { state: { from: { pathname: '/patient-dashboard/book-appointment' } } });
    }
  };

  const services = [
    { icon: 'fa-stethoscope', title: 'General Medicine', desc: 'Comprehensive primary healthcare services for all ages with expert physicians.' },
    { icon: 'fa-heartbeat', title: 'Cardiology', desc: 'Advanced cardiac care including diagnostics, treatment, and preventive cardiology.' },
    { icon: 'fa-bone', title: 'Orthopedics', desc: 'Expert care for bones, joints, and muscles with modern surgical techniques.' },
    { icon: 'fa-baby', title: 'Pediatrics', desc: 'Specialized healthcare for infants, children, and adolescents.' },
    { icon: 'fa-brain', title: 'Neurology', desc: 'Comprehensive neurological care for disorders of the nervous system.' },
    { icon: 'fa-ambulance', title: 'Emergency Care', desc: '24/7 emergency medical services with rapid response and critical care.' }
  ];

  const doctors = [
    { name: 'Dr. John Smith', dept: 'General Medicine', exp: '15 Years', img: 'https://ui-avatars.com/api/?name=John+Smith&background=4f46e5&color=fff&size=200', available: true },
    { name: 'Dr. Sarah Johnson', dept: 'Cardiology', exp: '12 Years', img: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=7c3aed&color=fff&size=200', available: true },
    { name: 'Dr. Michael Brown', dept: 'Orthopedics', exp: '10 Years', img: 'https://ui-avatars.com/api/?name=Michael+Brown&background=2563eb&color=fff&size=200', available: true },
    { name: 'Dr. Emily Wilson', dept: 'Pediatrics', exp: '8 Years', img: 'https://ui-avatars.com/api/?name=Emily+Wilson&background=059669&color=fff&size=200', available: true },
    { name: 'Dr. Robert Davis', dept: 'Neurology', exp: '14 Years', img: 'https://ui-avatars.com/api/?name=Robert+Davis&background=dc2626&color=fff&size=200', available: false },
    { name: 'Dr. Lisa Anderson', dept: 'Emergency Care', exp: '9 Years', img: 'https://ui-avatars.com/api/?name=Lisa+Anderson&background=0891b2&color=fff&size=200', available: true }
  ];

  const features = [
    { icon: 'fa-calendar-alt', title: 'Online Appointment Booking', desc: 'Book appointments online with your preferred doctors at your convenience.' },
    { icon: 'fa-folder-open', title: 'Digital Patient Records', desc: 'Secure digital storage of all your medical records and history.' },
    { icon: 'fa-user-md', title: 'Qualified Doctors', desc: 'Experienced and certified doctors across all specialties.' },
    { icon: 'fa-shield-alt', title: 'Secure Medical Data', desc: 'Your medical data is encrypted and protected with advanced security.' },
    { icon: 'fa-file-invoice', title: 'Easy Billing', desc: 'Transparent billing process with multiple payment options.' },
    { icon: 'fa-tachometer-alt', title: 'Fast Patient Management', desc: 'Efficient queue management and reduced waiting times.' }
  ];

  const testimonials = [
    { name: 'John Doe', text: 'Excellent healthcare services! The doctors are very professional and caring. The online appointment system made everything so easy.', rating: 5, img: 'https://ui-avatars.com/api/?name=John+Doe&background=4f46e5&color=fff&size=100' },
    { name: 'Jane Smith', text: 'I had a wonderful experience at CityCare. The staff was friendly and the facilities are world-class.', rating: 5, img: 'https://ui-avatars.com/api/?name=Jane+Smith&background=7c3aed&color=fff&size=100' },
    { name: 'Bob Wilson', text: 'The cardiology department saved my life. Grateful for the quick response and expert treatment.', rating: 4, img: 'https://ui-avatars.com/api/?name=Bob+Wilson&background=2563eb&color=fff&size=100' },
    { name: 'Alice Brown', text: 'Best pediatric care for my children. The doctors are patient and explain everything clearly.', rating: 5, img: 'https://ui-avatars.com/api/?name=Alice+Brown&background=059669&color=fff&size=100' }
  ];

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(<i key={i} className={`fas fa-star ${i <= rating ? 'star-filled' : 'star-empty'}`}></i>);
    }
    return stars;
  };

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section id="home" className="hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="hero-badge">
            <i className="fas fa-certificate"></i>
            <span>Advanced Healthcare Since 2005</span>
          </div>
          <h1 className="hero-title">Your Health,<br />Our Priority</h1>
          <p className="hero-subtitle">
            Welcome to CityCare Hospital — where compassionate care meets medical excellence.
            We provide world-class healthcare services with state-of-the-art technology
            and a team of highly qualified medical professionals.
          </p>
          <div className="hero-buttons">
            <Link to="/login" className="btn btn-primary btn-lg">
              <i className="fas fa-sign-in-alt"></i> Login
            </Link>
            <Link to="/register" className="btn btn-secondary btn-lg">
              <i className="fas fa-user-plus"></i> Register
            </Link>
            <button onClick={handleBookAppointment} className="btn btn-accent btn-lg">
              <i className="fas fa-calendar-check"></i> Book Appointment
            </button>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-number">24/7</span>
              <span className="hero-stat-label">Emergency</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-number">500+</span>
              <span className="hero-stat-label">Medical Staff</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-number">50K+</span>
              <span className="hero-stat-label">Happy Patients</span>
            </div>
          </div>
        </div>
        <div className="hero-shape">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
          </svg>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">About Us</span>
            <h2>Welcome to CityCare Hospital</h2>
            <p>Providing compassionate healthcare with advanced medical technology</p>
          </div>
          <div className="about-content">
            <div className="about-image">
              <div className="about-image-wrapper">
                <i className="fas fa-hospital-alt about-icon-bg"></i>
                <div className="about-experience">
                  <span className="about-exp-number">18+</span>
                  <span>Years of Excellence</span>
                </div>
              </div>
            </div>
            <div className="about-text">
              <p>CityCare Hospital is a premier healthcare institution dedicated to providing comprehensive medical services with a patient-centered approach. Our team of experienced doctors, nurses, and healthcare professionals work tirelessly to ensure the best outcomes for our patients.</p>
              <div className="about-cards">
                <div className="about-card">
                  <i className="fas fa-eye"></i>
                  <h4>Our Mission</h4>
                  <p>To deliver exceptional healthcare services that improve the quality of life for our community through innovation, compassion, and excellence.</p>
                </div>
                <div className="about-card">
                  <i className="fas fa-bullseye"></i>
                  <h4>Our Vision</h4>
                  <p>To be the most trusted healthcare provider, recognized for clinical excellence and compassionate patient care.</p>
                </div>
                <div className="about-card about-card-wide">
                  <i className="fas fa-check-circle"></i>
                  <h4>Why Choose Us</h4>
                  <ul>
                    <li><i className="fas fa-check"></i> Board-certified specialists</li>
                    <li><i className="fas fa-check"></i> Advanced medical technology</li>
                    <li><i className="fas fa-check"></i> 24/7 emergency services</li>
                    <li><i className="fas fa-check"></i> Affordable healthcare</li>
                    <li><i className="fas fa-check"></i> Digital health records</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="services">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Our Services</span>
            <h2>Comprehensive Medical Services</h2>
            <p>We offer a wide range of medical services to meet all your healthcare needs</p>
          </div>
          <div className="services-grid">
            {services.map((service, index) => (
              <div key={index} className="service-card">
                <div className="service-icon">
                  <i className={`fas ${service.icon}`}></i>
                </div>
                <h3>{service.title}</h3>
                <p>{service.desc}</p>
                <Link to="/login" className="service-link">
                  Learn More <i className="fas fa-arrow-right"></i>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Doctors Section */}
      <section id="doctors" className="doctors">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Our Doctors</span>
            <h2>Meet Our Expert Doctors</h2>
            <p>Highly qualified and experienced medical professionals dedicated to your health</p>
          </div>
          <div className="doctors-grid">
            {doctors.map((doctor, index) => (
              <div key={index} className="doctor-card">
                <div className="doctor-image">
                  <img src={doctor.img} alt={doctor.name} />
                  <div className={`doctor-status ${doctor.available ? 'available' : 'unavailable'}`}>
                    {doctor.available ? 'Available' : 'Not Available'}
                  </div>
                </div>
                <div className="doctor-info">
                  <h3>{doctor.name}</h3>
                  <p className="doctor-dept">{doctor.dept}</p>
                  <p className="doctor-exp"><i className="fas fa-briefcase"></i> {doctor.exp}</p>
                  <button onClick={handleBookAppointment} className="btn btn-primary btn-sm" disabled={!doctor.available}>
                    <i className="fas fa-calendar-plus"></i> Book Appointment
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Features</span>
            <h2>Why Choose CityCare Hospital</h2>
            <p>We provide the best healthcare experience with modern features</p>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">
                  <i className={`fas ${feature.icon}`}></i>
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section id="statistics" className="statistics" ref={statsRef}>
        <div className="statistics-overlay"></div>
        <div className="container">
          <div className="section-header light">
            <span className="section-tag">Our Achievements</span>
            <h2>CityCare by the Numbers</h2>
          </div>
          <div className="statistics-grid">
            <div className="stat-card">
              <i className="fas fa-user-md"></i>
              <h3 className="stat-number">{counters.doctors}</h3>
              <p>Expert Doctors</p>
            </div>
            <div className="stat-card">
              <i className="fas fa-users"></i>
              <h3 className="stat-number">{counters.patients.toLocaleString()}</h3>
              <p>Happy Patients</p>
            </div>
            <div className="stat-card">
              <i className="fas fa-calendar-check"></i>
              <h3 className="stat-number">{counters.appointments.toLocaleString()}</h3>
              <p>Appointments</p>
            </div>
            <div className="stat-card">
              <i className="fas fa-building"></i>
              <h3 className="stat-number">{counters.departments}</h3>
              <p>Departments</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="testimonials">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Testimonials</span>
            <h2>What Our Patients Say</h2>
            <p>Read the experiences of our patients and their families</p>
          </div>
          <div className="testimonials-grid">
            {testimonials.map((item, index) => (
              <div key={index} className="testimonial-card">
                <div className="testimonial-stars">
                  {renderStars(item.rating)}
                </div>
                <p className="testimonial-text">"{item.text}"</p>
                <div className="testimonial-author">
                  <img src={item.img} alt={item.name} />
                  <div>
                    <h4>{item.name}</h4>
                    <p>Patient</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Contact Us</span>
            <h2>Get In Touch</h2>
            <p>We're here to help you. Reach out to us anytime.</p>
          </div>
          <div className="contact-content">
            <div className="contact-info">
              <div className="contact-item">
                <i className="fas fa-map-marker-alt"></i>
                <div>
                  <h4>Our Location</h4>
                  <p>123 Healthcare Avenue, Medical District, City - 100001</p>
                </div>
              </div>
              <div className="contact-item">
                <i className="fas fa-phone-alt"></i>
                <div>
                  <h4>Phone Number</h4>
                  <p>+1 234 567 8900<br />+1 234 567 8901</p>
                </div>
              </div>
              <div className="contact-item">
                <i className="fas fa-envelope"></i>
                <div>
                  <h4>Email Address</h4>
                  <p>info@citycarehospital.com<br />emergency@citycarehospital.com</p>
                </div>
              </div>
              <div className="contact-item">
                <i className="fas fa-clock"></i>
                <div>
                  <h4>Working Hours</h4>
                  <p>Monday - Saturday: 8:00 AM - 8:00 PM<br />Sunday: 9:00 AM - 2:00 PM<br />Emergency: 24/7</p>
                </div>
              </div>
              <div className="contact-map">
                <div className="map-placeholder">
                  <i className="fas fa-map-marked-alt"></i>
                  <p>Google Map Location</p>
                  <span>123 Healthcare Avenue, Medical District</span>
                </div>
              </div>
            </div>
            <div className="contact-form">
              <h3>Send us a Message</h3>
              <form onSubmit={(e) => e.preventDefault()}>
                <div className="form-row">
                  <div className="form-group">
                    <input type="text" placeholder="Your Name" required />
                  </div>
                  <div className="form-group">
                    <input type="email" placeholder="Your Email" required />
                  </div>
                </div>
                <div className="form-group">
                  <input type="text" placeholder="Subject" required />
                </div>
                <div className="form-group">
                  <textarea rows="5" placeholder="Your Message" required></textarea>
                </div>
                <button type="submit" className="btn btn-primary btn-block">
                  <i className="fas fa-paper-plane"></i> Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;

