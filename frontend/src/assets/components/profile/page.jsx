import React, { useState, useEffect } from "react";
import { ChartNoAxesColumnDecreasing, X } from "lucide-react";
import "./index.css";
import { updateUserData } from "../../../api/chatService.js"; // adjust path as needed

const ProfileOverlay = ({
  userData,
  setUserData,
  isDarkMode,
  isVisible,
  onClose,
}) => {
  const [storeInfo, setStoreInfo] = useState({
    storeName: "",
    website: "",
    ecommerce_platform: "",
    products: "",
    story: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState(localStorage.getItem('userId') || "guest");

  useEffect(() => {
    console.log("userData", userData);
    if (userData) {
      setStoreInfo({
        storeName: userData.storeName || userData.store_name || "",
        website: userData.website || "",
        ecommerce_platform: userData.ecommerce_platform || "",
        products: userData.products || "",
        story: userData.story || "",
      });
    }
  }, []);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setStoreInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    console.log("handleSubmit", storeInfo);
    
    try {
      // Convert storeInfo to match backend expectations
      const dataToUpdate = {
        store_name: storeInfo.storeName,
        website: storeInfo.website,
        ecommerce_platform: storeInfo.ecommerce_platform,
        products: storeInfo.products,
        story: storeInfo.story,
      };
      
      const response = await updateUserData(userId, dataToUpdate);
      
      if (response.success) {
        // Update the userData with the new values
        setUserData({
          ...userData,
          // Include both versions to ensure compatibility
          store_name: storeInfo.storeName,
          storeName: storeInfo.storeName,
          website: storeInfo.website,
          ecommerce_platform: storeInfo.ecommerce_platform,
          products: storeInfo.products,
          story: storeInfo.story,
        });
      } else {
        console.log(response.message);
      }
    } catch (err) {
      console.log("Error del servidor. Intenta nuevamente.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className={`profile-overlay ${isDarkMode ? "dark" : ""}`}>
      <div className="profile-header">
        <h2 className="profile-title">Perfil</h2>
        <button className="bk-button" onClick={onClose}>
          <X size={24} />
        </button>
      </div>

      <form className="profile-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <h3 className="section-title">Información de tu ecommerce</h3>
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
          <select
            name="ecommerce_platform"
            value={storeInfo.ecommerce_platform}
            onChange={handleChange}
            className="form-input form-select"
          >
            <option value="" disabled>Plataforma de ecommerce</option>
            <option value="Shopify">Shopify</option>
            <option value="Prestashop">Prestashop</option>
            <option value="Woocommerce">Woocommerce</option>
            <option value="Otra">Otra</option>
          </select>
        </div>

        <div className="form-section text-area-section">
          <h3 className="section-title">¿Qué vendes?</h3>
          <p className="section-description">
            ¿De qué trata tu ecommerce, qué productos vendes, para qué sirven,
            etc.?
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
            ¿Cuándo se fundó, quiénes son los fundadores, cuál es vuestra
            propuesta de valor, etc.?
          </p>
          <textarea
            name="story"
            value={storeInfo.story}
            onChange={handleChange}
            className="form-textarea"
            rows={4}
          />
        </div>
        <button type="submit" className="update-btn" disabled={isSubmitting}>
          {isSubmitting ? "Actualizando..." : "Actualizar"}
        </button>
      </form>
    </div>
  );
};

export default ProfileOverlay;
