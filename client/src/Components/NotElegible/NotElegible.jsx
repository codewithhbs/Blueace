import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotElegible = () => {
  const navigate = useNavigate();

  return (
    <div className="container d-flex flex-column justify-content-center align-items-center vh-100 text-center">
      <div className="card shadow-lg p-5 border-0" style={{ maxWidth: '500px', width: '100%' }}>
        <img
          src="https://cdn-icons-png.flaticon.com/512/463/463612.png"
          alt="Not Eligible"
          className="mb-4"
          style={{ width: '100px' }}
        />

        <h2 className="text-danger mb-3">You're Not Eligible</h2>

        <p className="text-muted">
          Unfortunately, you did not pass the test to become a BlueAce vendor.
          Don’t worry — you can try again after some time!
        </p>

        <p className="fw-semibold mt-3">Please come back later to retake the test and complete your registration.</p>

        <button className="btn btn-primary mt-4" onClick={() => navigate('/')}>
          Return to Home
        </button>
      </div>
    </div>
  );
};

export default NotElegible;
