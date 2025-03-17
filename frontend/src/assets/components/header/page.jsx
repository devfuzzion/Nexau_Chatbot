import React from 'react';
import './index.css';
import { Expand, Minimize, ChevronDown, User, LifeBuoy, Search } from 'lucide-react';

const Header = ({ onExpand, isExpanded }) => {
  return (
    <div className={`header-container ${isExpanded ? 'expanded' : ''}`}>
      <div className='left-section'>
        <div className='logo-container'>
          <img src="/images/image.jpg" alt="logo-image" className='logo' />
        </div>
        <div>
          <h3 className='title'>Consultor IA</h3>
        </div>
      </div>

      {/* Horizontal Div (visible only when expanded) */}
      {isExpanded && (
        <div className='middle-section'>
          {/* Recommend to a Friend Button */}
          <button className='recommend-button'>
  Recommend to a Friend ❤️
</button>


          {/* Profile Greeting Dropdown */}
          <div className='profile-dropdown'>
            <User size={16} /> {/* Profile Icon */}
            <span>Hello, Pablo de la Vega</span>
            <ChevronDown size={16} /> {/* Chevron Down Icon */}
          </div>

          {/* Aid Button */}
          <button className='aid-button'>
            <LifeBuoy size={16} /> {/* Aid Icon */}
            <span>Aid</span>
            <ChevronDown size={16} /> {/* Chevron Down Icon */}
          </button>

          {/* Search Icon Button */}
          <button className='search-button'>
            <Search size={16} /> {/* Search Icon */}
          </button>
        </div>
      )}

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