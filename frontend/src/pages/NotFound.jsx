import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="error-page">
      <div className="error-content">
        <div className="error-code">404</div>
        <h1>Page Not Found</h1>
        <p>The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/" className="btn btn-primary">
          <i className="fas fa-home"></i> Back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;

