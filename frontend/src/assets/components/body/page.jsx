import React from 'react';
import './index.css';

const Body = () => {
  return (
    <div className='body-container'>
      <div className='bot-message-container'>
        This is a bot response
      </div>
      <div className='client-message-container'>
        This is a client query
      </div>
    </div>
  );
};

export default Body;