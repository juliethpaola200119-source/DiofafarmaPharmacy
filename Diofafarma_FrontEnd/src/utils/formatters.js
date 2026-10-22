/**
 * Utilidades de formato para DioFaFarma
 */

/**
 * Formatea un valor numérico como moneda (COP / General)
 * @param {number|string} amount 
 * @returns {string} Ejemplo: "$ 3.500"
 */
export const formatCurrency = (amount) => {
  const numericAmount = Number(amount);
  if (isNaN(numericAmount)) return '$ 0';
  
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(numericAmount);
};

/**
 * Formatea una cantidad de stock numérico
 * @param {number|string} stock 
 * @returns {string}
 */
export const formatStock = (stock) => {
  const num = Number(stock);
  return isNaN(num) ? '0 unidades' : `${num} uds`;
};

/**
 * Retorna la información de etiqueta y clase para el nivel de stock
 * @param {number} stock 
 * @returns {{ label: string, className: string }}
 */
export const getStockBadgeInfo = (stock) => {
  const num = Number(stock);
  if (isNaN(num) || num <= 0) {
    return {
      label: 'Agotado (0)',
      className: 'badge-stock-out'
    };
  }
  if (num <= 10) {
    return {
      label: `Stock Bajo (${num})`,
      className: 'badge-stock-low'
    };
  }
  return {
    label: `Disponible (${num})`,
    className: 'badge-stock-normal'
  };
};

/**
 * Retorna la información visual del estado del producto
 * @param {boolean|string} estado 
 * @returns {{ label: string, className: string }}
 */
export const getEstadoBadgeInfo = (estado) => {
  const isActive = estado === true || estado === 'true' || estado === 1 || estado === '1';
  return {
    label: isActive ? 'Activo' : 'Inactivo',
    className: isActive ? 'badge-active' : 'badge-inactive'
  };
};
