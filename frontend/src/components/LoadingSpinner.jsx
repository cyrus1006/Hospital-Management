const LoadingSpinner = ({ fullScreen = true }) => {
  return (
    <div className={`${fullScreen ? 'loading-spinner-full' : 'loading-spinner-inline'}`}>
      <div className="spinner">
        <i className="fas fa-circle-notch fa-spin"></i>
      </div>
      <p>Loading...</p>
    </div>
  );
};

export default LoadingSpinner;

