// src/actions/cartActions.js
import api from '../utils/api';
import {
  CART_ADD_ITEM,
  CART_REMOVE_ITEM,
  CART_SAVE_SHIPPING_ADDRESS,
  CART_SAVE_PAYMENT_METHOD,
} from '../constants/cartConstants';

export const addToCart = (id, qty, unitName = 'Sản phẩm') => async (dispatch, getState) => {
  const { data } = await api.get(`/api/products/${id}`);
  
  // Xác định đơn vị và giá
  let unit = { name: 'Sản phẩm', ratio: 1 };
  let price = data.price;
  
  // Nếu sản phẩm có units và có đơn vị được chọn
  if (data.units && data.units.length > 0 && unitName) {
    const selectedUnit = data.units.find(u => u.name === unitName);
    if (selectedUnit) {
      unit = {
        name: selectedUnit.name,
        ratio: selectedUnit.ratio
      };
      // Sử dụng giá của đơn vị nếu có, nếu không thì tính theo tỷ lệ
      price = selectedUnit.price || data.price / selectedUnit.ratio;
    }
  }

  dispatch({
    type: CART_ADD_ITEM,
    payload: {
      product: data._id,
      name: data.name,
      image: data.image,
      price: price,
      countInStock: data.countInStock,
      qty,
      unit
    },
  });

  localStorage.setItem('cartItems', JSON.stringify(getState().cart.cartItems));
};

// Các hàm khác giữ nguyên
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