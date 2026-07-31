import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Unauthorized = () => {
  const { user } = useAuth();

  return (
    <div className="error-page">
      <div className="error-content">
        <div className="error-code">403</div>
        <h1>Access Denied</h1>
        <p>You don't have permission to access this page.</p>
        {user ? (
          <Link to={`/${user.role}-dashboard`} className="btn btn-primary">
            <i className="fas fa-tachometer-alt"></i> Go to Dashboard
          </Link>
        ) : (
          <Link to="/login" className="btn btn-primary">
            <i className="fas fa-sign-in-alt"></i> Login
          </Link>
        )}
      </div>
    </div>
  );
};

export default Unauthorized;

