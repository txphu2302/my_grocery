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

  // Tìm thông tin đơn vị được chọn
  let selectedUnit = { name: unitName || 'Sản phẩm', ratio: 1 };
  
  // Nếu product có units và tìm thấy đơn vị đã chọn
  if (product.units && product.units.length > 0) {
    const unit = product.units.find(u => u.name === unitName) || 
                 product.units.find(u => u.isDefault) ||
                 product.units[0];
    
    if (unit) {
      selectedUnit = {
        name: unit.name,
        ratio: unit.ratio,
        // Sử dụng giá của đơn vị nếu có, nếu không thì tính theo tỷ lệ
        price: unit.price || (product.retailPrice || product.price) / unit.ratio
      };
    }
  }
  
  // Giá mặc định là giá bán lẻ hoặc giá gốc
  const basePrice = product.retailPrice && product.retailPrice > 0 ? 
                    product.retailPrice : product.price;
  
  // Nếu không có giá theo đơn vị, tính theo tỷ lệ
  const unitPrice = selectedUnit.price || basePrice / selectedUnit.ratio;

  dispatch({
    type: CART_ADD_ITEM,
    payload: {
      product: product._id,
      name: product.name,
      image: product.image,
      price: unitPrice,
      countInStock: product.countInStock,
      qty,
      unit: selectedUnit
    },
  });

  localStorage.setItem('cartItems', JSON.stringify(getState().cart.cartItems));
};

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