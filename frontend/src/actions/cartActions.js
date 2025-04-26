// src/actions/cartActions.js
import api from '../utils/api';
import {
  CART_ADD_ITEM,
  CART_REMOVE_ITEM,
  CART_SAVE_SHIPPING_ADDRESS,
  CART_SAVE_PAYMENT_METHOD,
} from '../constants/cartConstants';

export const addToCart = (id, qty, unitName = 'Sản phẩm') => async (dispatch, getState) => {
  const { data: product } = await api.get(`/api/products/${id}`);
  
  // Khởi tạo thông tin mặc định của đơn vị
  let selectedUnit = { 
    name: 'Sản phẩm', 
    ratio: 1,
    image: product.image // Mặc định dùng hình ảnh của sản phẩm
  };
  
  let productName = product.name;
  let productImage = product.image;
  let price = product.price;
  
  // Nếu sản phẩm có units và có đơn vị được chọn
  if (product.units && product.units.length > 0 && unitName) {
    const unit = product.units.find(u => u.name === unitName);
    if (unit) {
      selectedUnit = {
        name: unit.name,
        ratio: unit.ratio || 1,
        description: unit.description || '',
        image: unit.image || product.image // Ưu tiên dùng hình ảnh của đơn vị, nếu không có thì dùng hình sản phẩm
      };
      
      // Nếu có hình ảnh riêng của đơn vị, sử dụng nó
      if (unit.image) {
        productImage = unit.image;
      }
      
      // Tính giá theo đơn vị
      price = unit.price || (product.price / (unit.ratio || 1));
    }
  }

  dispatch({
    type: CART_ADD_ITEM,
    payload: {
      product: product._id,
      name: productName,
      image: productImage, // Sử dụng hình ảnh phù hợp với đơn vị
      price: price,
      countInStock: product.countInStock,
      qty,
      unit: selectedUnit
    },
  });

  localStorage.setItem('cartItems', JSON.stringify(getState().cart.cartItems));
};

// Các hàm khác không thay đổi
export const removeFromCart = (id) => (dispatch, getState) => {
  dispatch({
    type: CART_REMOVE_ITEM,
    payload: id,
  });

  localStorage.setItem('cartItems', JSON.stringify(getState().cart.cartItems));
};

export const saveShippingAddress = (data) => (dispatch) => {
  dispatch({
    type: CART_SAVE_SHIPPING_ADDRESS,
    payload: data,
  });

  localStorage.setItem('shippingAddress', JSON.stringify(data));
};

export const savePaymentMethod = (data) => (dispatch) => {
  dispatch({
    type: CART_SAVE_PAYMENT_METHOD,
    payload: data,
  });

  localStorage.setItem('paymentMethod', JSON.stringify(data));
};