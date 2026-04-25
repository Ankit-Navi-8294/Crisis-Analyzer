import React from 'react';

const Loader = () => {
  return (
    <div className="loader-container">
      <div className="spinner"></div>
      <div className="loader-text">Fetching live news & running AI analysis...</div>
    </div>
  );
};

export default Loader;
