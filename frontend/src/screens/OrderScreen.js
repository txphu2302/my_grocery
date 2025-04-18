import React, { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { Row, Col, ListGroup, Image, Card, Button, Badge } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import Message from '../components/Message'
import Loader from '../components/Loader'
import { getOrderDetails, payOrder, deliverOrder } from '../actions/orderActions'
import { ORDER_PAY_RESET, ORDER_DELIVER_RESET } from '../constants/orderConstants'
import BankPayment from '../components/BankPayment'
import Receipt from '../components/Receipt'


const OrderScreen = () => {
  const params = useParams()
  const navigate = useNavigate()
  const orderId = params.id
  
  // State for calculated prices
  const [calculatedPrices, setCalculatedPrices] = useState({
    itemsPrice: 0,
    totalPrice: 0
  })

  const dispatch = useDispatch()

  const orderDetails = useSelector((state) => state.orderDetails)
  const { order, loading, error } = orderDetails

  const orderPay = useSelector((state) => state.orderPay)
  const { loading: loadingPay, success: successPay } = orderPay

  const orderDeliver = useSelector((state) => state.orderDeliver)
  const { loading: loadingDeliver, success: successDeliver } = orderDeliver

  const userLogin = useSelector((state) => state.userLogin)
  const { userInfo } = userLogin

  // Add debugging logging
  useEffect(() => {
    console.log('Current Order ID in URL:', orderId)
    console.log('Current Order in state:', order?._id)
    console.log('Payment Method:', order?.paymentMethod)
  }, [orderId, order])

  // Calculate prices if they're not available in the order
  useEffect(() => {
    if (order && order.orderItems && order.orderItems.length > 0) {
      const itemsPrice = order.orderItems.reduce(
        (acc, item) => acc + (item.price * item.qty), 
        0
      )
      
      // Total price equals item price
      const totalPrice = itemsPrice
      
      setCalculatedPrices({
        itemsPrice,
        totalPrice
      })
    }
  }, [order])

  // Fetch order details whenever orderId changes or after payment/delivery status changes
  useEffect(() => {
    if (!userInfo) {
      navigate('/login')
      return
    }
    
    // Always fetch fresh order details on initial load and ID change
    if (!order || order._id !== orderId || successPay || successDeliver) {
      // Reset payment and delivery state if needed
      if (successPay) {
        dispatch({ type: ORDER_PAY_RESET })
      }
      if (successDeliver) {
        dispatch({ type: ORDER_DELIVER_RESET })
      }
      
      console.log('Fetching order details for:', orderId)
      dispatch(getOrderDetails(orderId))
    }
  }, [dispatch, orderId, successPay, successDeliver, order, userInfo, navigate])

  // Handle payment confirmation
  const successPaymentHandler = () => {
    dispatch(
      payOrder(orderId, {
        id: Date.now().toString(),
        status: 'COMPLETED',
        update_time: new Date().toISOString(),
        payer: {
          email_address: userInfo.email,
        },
      })
    )
  }

  // Handle delivery confirmation
  const deliverHandler = () => {
    dispatch(deliverOrder(order))
  }

  // Get price values, either from order or from calculated values
  const getPrice = (type) => {
    if (order && order[type] !== undefined && order[type] !== null) {
      return Number(order[type])
    }
    return calculatedPrices[type]
  }

  // Format date for better display
  const formatDate = (dateString) => {
    if (!dateString) return ''
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }
    return new Date(dateString).toLocaleDateString('vi-VN', options)
  }

  // Get payment method display name with debugging
  const getPaymentMethodName = (method) => {
    console.log('Payment method to display:', method)
    switch(method) {
      case 'PayPal':
        return 'PayPal / Thẻ tín dụng'
      case 'COD':
        return 'Thanh toán khi nhận hàng (COD)'
      case 'BankTransfer':
        return 'Chuyển khoản ngân hàng'
      case 'EWallet':
        return 'Ví điện tử'
      default:
        return method || 'Không xác định'
    }
  }

  // Conditional rendering for payment method badge
  const renderPaymentBadge = (method) => {
    let variant = 'secondary'
    let icon = 'fa-money-bill-wave'
    
    switch(method) {
      case 'PayPal':
        variant = 'info'
        icon = 'fa-paypal'
        break
      case 'COD':
        variant = 'warning'
        icon = 'fa-money-bill-wave'
        break
      case 'BankTransfer':
        variant = 'primary'
        icon = 'fa-university'
        break
      case 'EWallet':
        variant = 'success'
        icon = 'fa-wallet'
        break
      default:
        break
    }
    
    return (
      <Badge bg={variant} className="me-2 p-2">
        <i className={`fas ${icon} me-1`}></i>
        {getPaymentMethodName(method)}
      </Badge>
    )
  }

  // If loading, show loader
  if (loading) return <Loader />
  
  // If error, show error message
  if (error) return <Message variant='danger'>{error}</Message>
  
  // If no order, show loading message
  if (!order) return <Message variant='info'>Đang tải thông tin đơn hàng...</Message>
  
  // Order details loaded
  return (
    <>
      <Row>
        <Col>
          <h2 className='mb-4'>
            Đơn hàng #{orderId}
            <span className='float-end'>
              <Button 
                variant='outline-secondary' 
                size='sm' 
                onClick={() => navigate('/profile')}
              >
                <i className='fas fa-arrow-left me-1'></i> Quay lại
              </Button>
            </span>
          </h2>
        </Col>
      </Row>
      
      <Row>
        <Col md={8}>
          <ListGroup variant='flush'>
            <ListGroup.Item>
              <h3 className='mb-3'>Thông tin giao hàng</h3>
              {order.user && (
                <>
                  <p className='mb-2'>
                    <strong>Tên người nhận: </strong> {order.user.name}
                  </p>
                  <p className='mb-2'>
                    <strong>Email: </strong>
                    <a href={`mailto:${order.user.email}`}>{order.user.email}</a>
                  </p>
                </>
              )}
              <p className='mb-2'>
                <strong>Địa chỉ: </strong>
                {order.shippingAddress.address}, {order.shippingAddress.city}{' '}
                {order.shippingAddress.postalCode},{' '}
                {order.shippingAddress.country}
              </p>
              {order.shippingAddress.phoneNumber && (
                <p className='mb-2'>
                  <strong>Số điện thoại: </strong>
                  {order.shippingAddress.phoneNumber}
                </p>
              )}
              {order.isDelivered ? (
                <Message variant='success'>
                  <i className='fas fa-check-circle me-2'></i>
                  Đã giao hàng vào {formatDate(order.deliveredAt)}
                </Message>
              ) : (
                <Message variant='warning'>
                  <i className='fas fa-clock me-2'></i>
                  Chưa giao hàng
                </Message>
              )}
            </ListGroup.Item>

            <ListGroup.Item>
              <h3 className='mb-3'>Thanh toán</h3>
              <p className='mb-2'>
                <strong>Phương thức: </strong>
                {renderPaymentBadge(order.paymentMethod)}
              </p>
              {order.isPaid ? (
                <Message variant='success'>
                  <i className='fas fa-check-circle me-2'></i>
                  Đã thanh toán vào {formatDate(order.paidAt)}
                </Message>
              ) : (
                <Message variant='warning'>
                  <i className='fas fa-clock me-2'></i>
                  Chưa thanh toán
                </Message>
              )}
            </ListGroup.Item>

            {/* Only show bank payment QR if payment method is BankTransfer */}
            {!order.isPaid && order.paymentMethod === 'BankTransfer' && (
              <ListGroup.Item>
                <BankPayment order={order} />
              </ListGroup.Item>
            )}

            <ListGroup.Item>
              <h3 className='mb-3'>Sản phẩm đặt hàng</h3>
              {!order.orderItems || order.orderItems.length === 0 ? (
                <Message>Đơn hàng không có sản phẩm</Message>
              ) : (
                <ListGroup variant='flush'>
                  {order.orderItems.map((item, index) => (
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
                          <Link to={`/product/${item.product}`}>
                            {item.name}
                          </Link>
                        </Col>
                        <Col md={4} className="text-end">
                          {item.qty} x {item.price.toLocaleString('vi-VN')}đ ={' '}
                          <strong>{(item.qty * item.price).toLocaleString('vi-VN')}đ</strong>
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
          <Card className='mb-4'>
            <Card.Header className='bg-light'>
              <h3 className='mb-0'>Tổng đơn hàng</h3>
            </Card.Header>
            <ListGroup variant='flush'>
              <ListGroup.Item>
                <Row>
                  <Col>Tổng tiền sản phẩm:</Col>
                  <Col className="text-end">{getPrice('itemsPrice').toLocaleString('vi-VN')}đ</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col><strong>Tổng cộng:</strong></Col>
                  <Col className="text-end">
                    <strong>{getPrice('totalPrice').toLocaleString('vi-VN')}đ</strong>
                  </Col>
                </Row>
              </ListGroup.Item>
            </ListGroup>
          </Card>
          
          {userInfo && userInfo.isAdmin && (
            <Card className='mb-4'>
              <Card.Header className='bg-light'>
                <h3 className='mb-0'>Quản lý đơn hàng</h3>
              </Card.Header>
              <ListGroup variant='flush'>
                {!order.isPaid && (
                  <ListGroup.Item>
                    {loadingPay ? (
                      <Loader />
                    ) : (
                      <Button
                        type='button'
                        className='btn btn-success w-100'
                        onClick={successPaymentHandler}
                      >
                        <i className="fas fa-money-bill-wave me-2"></i>
                        Đánh dấu đã thanh toán
                      </Button>
                    )}
                  </ListGroup.Item>
                )}
                
                {order.isPaid && !order.isDelivered && (
                  <ListGroup.Item>
                    {loadingDeliver ? (
                      <Loader />
                    ) : (
                      <Button
                        type='button'
                        className='btn btn-success w-100'
                        onClick={deliverHandler}
                      >
                        <i className="fas fa-truck me-2"></i>
                        Đánh dấu đã giao hàng
                      </Button>
                    )}
                  </ListGroup.Item>
                )}
                {/* Thêm component in hóa đơn */}
                <ListGroup.Item>
                  <Receipt order={order} />
                </ListGroup.Item>
              </ListGroup>
            </Card>
          )}
          
          <Card>
            <Card.Header className='bg-light'>
              <h3 className='mb-0'>Trạng thái đơn hàng</h3>
            </Card.Header>
            <Card.Body>
              <div className='d-flex justify-content-between mb-2'>
                <span>Đặt hàng:</span>
                <span className='text-success'>
                  <i className='fas fa-check-circle me-1'></i>
                  {formatDate(order.createdAt)}
                </span>
              </div>
              <div className='d-flex justify-content-between mb-2'>
                <span>Thanh toán:</span>
                <span className={order.isPaid ? 'text-success' : 'text-muted'}>
                  {order.isPaid ? (
                    <>
                      <i className='fas fa-check-circle me-1'></i>
                      {formatDate(order.paidAt)}
                    </>
                  ) : (
                    <>
                      <i className='fas fa-clock me-1'></i>
                      Đang chờ
                    </>
                  )}
                </span>
              </div>
              <div className='d-flex justify-content-between'>
                <span>Giao hàng:</span>
                <span className={order.isDelivered ? 'text-success' : 'text-muted'}>
                  {order.isDelivered ? (
                    <>
                      <i className='fas fa-check-circle me-1'></i>
                      {formatDate(order.deliveredAt)}
                    </>
                  ) : (
                    <>
                      <i className='fas fa-clock me-1'></i>
                      Đang chờ
                    </>
                  )}
                </span>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  )
}

export default OrderScreen