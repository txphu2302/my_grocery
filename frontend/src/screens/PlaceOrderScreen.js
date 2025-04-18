import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Row, Col, ListGroup, Image, Card } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import Message from '../components/Message'
import CheckoutSteps from '../components/CheckoutSteps'
import { createOrder } from '../actions/orderActions'
import Loader from '../components/Loader'

const PlaceOrderScreen = () => {
  const dispatch = useDispatch()
  const cart = useSelector((state) => state.cart)
  const navigate = useNavigate()
  
  // Get order create state from Redux
  const orderCreate = useSelector((state) => state.orderCreate)
  const { order, success, error, loading } = orderCreate

  // Calculate only item price now, no tax or shipping
  const addDecimals = (num) => {
    return (Math.round(num * 100) / 100).toFixed(0)
  }

  cart.itemsPrice = addDecimals(
    cart.cartItems.reduce((acc, item) => acc + item.price * item.qty, 0)
  )
  
  // Total price is now the same as items price
  cart.totalPrice = cart.itemsPrice

  // Check if user has completed previous steps
  useEffect(() => {
    if (!cart.shippingAddress.address) {
      navigate('/shipping')
    } else if (!cart.paymentMethod) {
      navigate('/payment')
    }
  }, [navigate, cart.shippingAddress, cart.paymentMethod])

  // Redirect to order page on successful order creation
  useEffect(() => {
    if (success) {
      navigate(`/orders/${order._id}`)
    }
    // eslint-disable-next-line
  }, [navigate, success, order])

  const placeOrderHandler = () => {
    if (!cart.paymentMethod) {
      alert('Vui lòng chọn phương thức thanh toán')
      navigate('/payment')
      return
    }
    
    dispatch(
      createOrder({
        orderItems: cart.cartItems,
        shippingAddress: cart.shippingAddress,
        paymentMethod: cart.paymentMethod,
        itemsPrice: cart.itemsPrice,
        totalPrice: cart.totalPrice,
      })
    )
  }

  return (
    <>
      <CheckoutSteps step1 step2 step3 step4 />
      <Row>
        <Col md={8}>
          <ListGroup variant='flush'>
            <ListGroup.Item>
              <h2>Thông tin giao hàng</h2>
              <p>
                <strong>Địa chỉ: </strong>
                {cart.shippingAddress.address}, {cart.shippingAddress.city}{' '}
                {cart.shippingAddress.postalCode},{' '}
                {cart.shippingAddress.country}
              </p>
              <p>
                <strong>Số điện thoại: </strong>
                {cart.shippingAddress.phoneNumber}
              </p>
            </ListGroup.Item>

            <ListGroup.Item>
              <h2>Phương thức thanh toán</h2>
              {cart.paymentMethod ? (
                <p>
                  <strong>Phương thức: </strong>
                  {cart.paymentMethod}
                </p>
              ) : (
                <Message variant="warning">
                  Bạn chưa chọn phương thức thanh toán.{' '}
                  <Button 
                    variant="link" 
                    className="p-0"
                    onClick={() => navigate('/payment')}
                  >
                    Chọn ngay
                  </Button>
                </Message>
              )}
            </ListGroup.Item>

            <ListGroup.Item>
              <h2>Sản phẩm đặt hàng</h2>
              {cart.cartItems.length === 0 ? (
                <Message>
                  Giỏ hàng của bạn đang trống.{' '}
                  <Button 
                    variant="link" 
                    className="p-0"
                    onClick={() => navigate('/')}
                  >
                    Tiếp tục mua sắm
                  </Button>
                </Message>
              ) : (
                <ListGroup variant='flush'>
                  {cart.cartItems.map((item, index) => (
                    <ListGroup.Item key={index}>
                      <Row className="align-items-center">
                        <Col md={1}>
                          <Image
                            src={item.image}
                            alt={item.name}
                            fluid
                            rounded
                          />
                        </Col>
                        <Col>
                          <a href={`/product/${item.product}`}>{item.name}</a>
                        </Col>
                        <Col md={4} className="text-end">
                          {item.qty} x {item.price.toLocaleString('vi-VN')}đ = <strong>{(item.qty * item.price).toLocaleString('vi-VN')}đ</strong>
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </ListGroup.Item>
          </ListGroup>
        </Col>
        <Col md={4}>
          <Card>
            <ListGroup variant='flush'>
              <ListGroup.Item>
                <h2>Tổng đơn hàng</h2>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row className="align-items-center">
                  <Col>Số lượng:</Col>
                  <Col className="text-end">
                    {cart.cartItems.reduce((acc, item) => acc + item.qty, 0)} sản phẩm
                  </Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col><strong>Tổng cộng:</strong></Col>
                  <Col className="text-end"><strong>{Number(cart.totalPrice).toLocaleString('vi-VN')}đ</strong></Col>
                </Row>
              </ListGroup.Item>
              
              {error && (
                <ListGroup.Item>
                  <Message variant='danger'>{error}</Message>
                </ListGroup.Item>
              )}
              
              <ListGroup.Item>
                {loading ? <Loader /> : (
                  <Button
                    type='button'
                    className='btn-block w-100'
                    disabled={cart.cartItems.length === 0 || !cart.paymentMethod}
                    onClick={placeOrderHandler}
                  >
                    Đặt hàng
                  </Button>
                )}
              </ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </>
  )
}

export default PlaceOrderScreen