import React from 'react';
import './index.css';
import { Expand, Minimize , ChevronDown} from 'lucide-react';
const Header = ({ onExpand, isExpanded }) => {
  return (
    <div className='header-container'>
      <div className='left-section'>
        <div className='logo-container'>
          <img src="/images/image.jpg" alt="logo-image" className='logo' />
        </div>
        <div>
          <h3 className='title'>Consultor IA</h3>
        </div>
      </div>
      <div className='right-section'>
        <div className='expand-icon' onClick={onExpand}>
          {isExpanded ? <Minimize size={20} /> : <Expand size={20} />}
        </div>
        <div className='dropdown-icon'>
          <ChevronDown size={20} />
        </div>
      </div>
    </div>
  );
};

export default Header;