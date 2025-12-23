/**
 * WooCommerce API Service - Kataraa
 */

const WOO_CONFIG = {
  baseURL: 'https://kataraa.com/wp-json/wc/v3',
  consumerKey: 'ck_9c64aa5537ea5b2c439fdd8e6928ddc30b4d88f2',
  consumerSecret: 'cs_709a363c9a045e61f717543c76221f00004bc9bb',
};

// Cache
let productsCache = null;
let categoriesCache = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const getAuthHeader = () => {
  const credentials = btoa(`${WOO_CONFIG.consumerKey}:${WOO_CONFIG.consumerSecret}`);
  return `Basic ${credentials}`;
};

const api = {
  // Get Products
  async getProducts(page = 1, perPage = 20, category = null) {
    try {
      let url = `${WOO_CONFIG.baseURL}/products?page=${page}&per_page=${perPage}&status=publish`;
      if (category) url += `&category=${category}`;

      const response = await fetch(url, {
        headers: { 'Authorization': getAuthHeader() }
      });

      if (!response.ok) throw new Error('Failed to fetch products');
      return await response.json();
    } catch (error) {
      console.error('getProducts error:', error);
      return [];
    }
  },

  // Get Single Product
  async getProduct(id) {
    try {
      const response = await fetch(`${WOO_CONFIG.baseURL}/products/${id}`, {
        headers: { 'Authorization': getAuthHeader() }
      });
      if (!response.ok) throw new Error('Product not found');
      return await response.json();
    } catch (error) {
      console.error('getProduct error:', error);
      return null;
    }
  },

  // Get Categories
  async getCategories() {
    try {
      if (categoriesCache && Date.now() - cacheTimestamp < CACHE_DURATION) {
        return categoriesCache;
      }

      const response = await fetch(`${WOO_CONFIG.baseURL}/products/categories?per_page=50`, {
        headers: { 'Authorization': getAuthHeader() }
      });

      if (!response.ok) throw new Error('Failed to fetch categories');
      categoriesCache = await response.json();
      cacheTimestamp = Date.now();
      return categoriesCache;
    } catch (error) {
      console.error('getCategories error:', error);
      return [];
    }
  },

  // Search Products
  async searchProducts(query) {
    try {
      const response = await fetch(
        `${WOO_CONFIG.baseURL}/products?search=${encodeURIComponent(query)}&status=publish`,
        { headers: { 'Authorization': getAuthHeader() } }
      );
      if (!response.ok) throw new Error('Search failed');
      return await response.json();
    } catch (error) {
      console.error('searchProducts error:', error);
      return [];
    }
  },

  // Create Order
  async createOrder(orderData) {
    try {
      const response = await fetch(`${WOO_CONFIG.baseURL}/orders`, {
        method: 'POST',
        headers: {
          'Authorization': getAuthHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) throw new Error('Failed to create order');
      return await response.json();
    } catch (error) {
      console.error('createOrder error:', error);
      throw error;
    }
  },
};

export default api;
