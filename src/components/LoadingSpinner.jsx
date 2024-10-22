import React from 'react';
import { Puff } from 'react-loader-spinner';


const LoadingSpinner = () => {
    return (
      <div className="loader-container">
        <Puff color="#00BFFF" height={100} width={100} />
      </div>
    );
  };
  

export default LoadingSpinner;
