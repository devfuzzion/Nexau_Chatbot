import React from 'react';
import './index.css';

const Body = () => {
  return (
    <div className='body-container'>
      <div className='bot-message-container'>
        This is a bot response. It can be a longer message to test scrolling.
      </div>
      <div className='client-message-container'>
        This is a client query. It can also be a longer message to test scrolling.
      </div>
      {/* Add more messages for testing scrolling */}
      <div className='bot-message-container'>
        Another bot response with some extra text to see how scrolling works.
      </div>
      <div className='client-message-container'>
        Another client query with more content to test the scrolling behavior.
      </div>
      <div className='bot-message-container'>
        Yet another bot response to ensure scrolling is working properly.
      </div>
      <div className='client-message-container'>
        Yet another client query to test the scrollbar invisibility.
      </div>
    </div>
  );
};

export default Body;