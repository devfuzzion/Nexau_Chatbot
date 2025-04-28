import Swal from 'sweetalert2';

/**
 * Shows a loading notification
 * @param {string} title - The title of the loading notification
 * @param {string} html - The HTML content of the loading notification
 * @param {boolean} isDarkMode - Whether the app is in dark mode
 * @returns {Object} - The Swal instance
 */
export const showLoading = (title, html, isDarkMode) => {
  return Swal.fire({
    title: title || 'Cargando...',
    html: html || 'Por favor espere',
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    background: isDarkMode ? '#2C2C2C' : '#fff',
    color: isDarkMode ? '#fff' : '#000',
    didOpen: () => {
      Swal.showLoading();
      // Apply dark theme to Swal if app is in dark mode
      if (isDarkMode) {
        document.body.classList.add('dark-mode');
      }
    }
  });
};

/**
 * Shows an error notification
 * @param {string} title - The title of the error notification
 * @param {string} text - The text content of the error notification
 * @param {boolean} isDarkMode - Whether the app is in dark mode
 */
export const showError = (title, text, isDarkMode) => {
  return Swal.fire({
    icon: 'error',
    title: title || 'Error',
    text: text || 'Ha ocurrido un error',
    background: isDarkMode ? '#2C2C2C' : '#fff',
    color: isDarkMode ? '#fff' : '#000',
  });
};

/**
 * Shows a success notification
 * @param {string} title - The title of the success notification
 * @param {string} text - The text content of the success notification
 * @param {boolean} isDarkMode - Whether the app is in dark mode
 */
export const showSuccess = (title, text, isDarkMode) => {
  return Swal.fire({
    icon: 'success',
    title: title || 'Éxito',
    text: text || 'Operación completada con éxito',
    background: isDarkMode ? '#2C2C2C' : '#fff',
    color: isDarkMode ? '#fff' : '#000',
  });
}; 