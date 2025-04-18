// In src/screens/CartScreen.js

import React, { useEffect } from 'react'
import { Link, useParams, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Row, Col, ListGroup, Image, Form, Button, Card } from 'react-bootstrap'
import Message from '../components/Message'
import { addToCart, removeFromCart } from '../actions/cartActions'

const CartScreen = () => {
  const params = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  
  const productId = params.id
  const qty = location.search ? Number(location.search.split('=')[1]) : 1
  
  const dispatch = useDispatch()
  
  const cart = useSelector((state) => state.cart)
  const { cartItems } = cart
  
  useEffect(() => {
    if (productId) {
      dispatch(addToCart(productId, qty))
    }
  }, [dispatch, productId, qty])
  
  const removeFromCartHandler = (id) => {
    dispatch(removeFromCart(id))
  }
  
  const checkoutHandler = () => {
    navigate('/login?redirect=/shipping')
  }
  
  return (
    <Row>
      <Col md={8}>
        <h1>Giỏ hàng</h1>
        {cartItems.length === 0 ? (
          <Message>
            Giỏ hàng của bạn đang trống <Link to='/'>Quay lại</Link>
          </Message>
        ) : (
          <ListGroup variant='flush'>
            {cartItems.map((item) => (
              <ListGroup.Item key={item.product}>
                <Row className="align-items-center">
                  <Col md={2}>
                    <Image src={item.image} alt={item.name} fluid rounded />
                  </Col>
                  <Col md={3}>
                    <Link to={`/product/${item.product}`}>{item.name}</Link>
                  </Col>
                  <Col md={2}>{item.price.toLocaleString('vi-VN')}đ</Col>
                  <Col md={2}>
                    <Form.Control
                      as='select'
                      value={item.qty}
                      onChange={(e) =>
                        dispatch(
                          addToCart(item.product, Number(e.target.value))
                        )
                      }
                    >
                      {[...Array(item.countInStock).keys()].map((x) => (
                        <option key={x + 1} value={x + 1}>
                          {x + 1}
                        </option>
                      ))}
                    </Form.Control>
                  </Col>
                  <Col md={2}>
                    <Button
                      type='button'
                      variant='danger'
                      onClick={() => removeFromCartHandler(item.product)}
                    >
                      <i className='fas fa-trash'></i> Xóa
                    </Button>
                  </Col>
                </Row>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Col>
      <Col md={4}>
        <Card>
          <ListGroup variant='flush'>
            <ListGroup.Item>
              <h2>
                Tổng cộng ({cartItems.reduce((acc, item) => acc + item.qty, 0)}) sản phẩm
              </h2>
              {cartItems
                .reduce((acc, item) => acc + item.qty * item.price, 0)
                .toLocaleString('vi-VN')}đ
            </ListGroup.Item>
            <ListGroup.Item>
              <Button
                type='button'
                className='btn-block w-100'
                disabled={cartItems.length === 0}
                onClick={checkoutHandler}
              >
                Tiến hành thanh toán
              </Button>
            </ListGroup.Item>
          </ListGroup>
        </Card>
      </Col>
    </Row>
  )
}

export default CartScreen