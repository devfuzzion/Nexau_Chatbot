import React, { useState } from 'react';
import { X } from 'lucide-react';
import './index.css';

const ProfileOverlay = ({ isDarkMode, isVisible, onClose }) => {
  const [storeInfo, setStoreInfo] = useState({
    storeName: '',
    website: '',
    products: '',
    story: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStoreInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Store info updated:', storeInfo);
    onClose();
  };

  if (!isVisible) return null;

  return (
    <div className={`profile-overlay ${isDarkMode ? 'dark' : ''}`}>
      <div className="profile-header">
        <h2 className="profile-title">Perfil</h2>
        <button className="bk-button" onClick={onClose}>
          <X size={24} />
        </button>
      </div>

      <form className="profile-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <h3 className="section-title">información de tu ecommerce</h3>
          <input
            type="text"
            name="storeName"
            value={storeInfo.storeName}
            onChange={handleChange}
            placeholder="Nombre de tu tienda"
            className="form-input"
          />
          <input
            type="url"
            name="website"
            value={storeInfo.website}
            onChange={handleChange}
            placeholder="Página web"
            className="form-input"
          />
        </div>

        <div className="form-section text-area-section">
          <h3 className="section-title">¿Qué vendes?</h3>
          <p className="section-description">
          ¿De qué trata tu ecommerce, qué productos vendes, para qué sirven, etc.?
          </p>
          <textarea
            name="products"
            value={storeInfo.products}
            onChange={handleChange}
            className="form-textarea"
            rows={4}
          />
        </div>

        <div className="form-section text-area-section">
          <h3 className="section-title">¿Cual es tu historia?</h3>
          <p className="section-description">
          ¿Cuándo se fundó, quiénes son los fundadores, cuál es vuestra propuesta de valor, etc.?
          </p>
          <textarea
            name="story"
            value={storeInfo.story}
            onChange={handleChange}
            className="form-textarea"
            rows={4}
          />
        </div>

        <button type="submit" className="update-btn">
          Actualizar
        </button>
      </form>
    </div>
  );
};

export default ProfileOverlay;