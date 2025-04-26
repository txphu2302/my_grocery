import React, { useEffect } from 'react'
import { Link, useParams, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Row, Col, ListGroup, Image, Form, Button, Card, Badge } from 'react-bootstrap'
import Message from '../components/Message'
import { addToCart, removeFromCart } from '../actions/cartActions'

const CartScreen = () => {
  const params = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  
  const productId = params.id
  
  // Lấy thông tin quantity và unit từ URL
  const queryParams = new URLSearchParams(location.search);
  const qty = queryParams.get('qty') ? Number(queryParams.get('qty')) : 1;
  const unit = queryParams.get('unit') || 'Sản phẩm';
  
  const dispatch = useDispatch()
  
  const cart = useSelector((state) => state.cart)
  const { cartItems } = cart
  
  useEffect(() => {
    if (productId) {
      dispatch(addToCart(productId, qty, unit))
    }
  }, [dispatch, productId, qty, unit])
  
  const removeFromCartHandler = (id) => {
    dispatch(removeFromCart(id))
  }
  
  const checkoutHandler = () => {
    navigate('/login?redirect=/shipping')
  }
  
  // Định dạng tiền Việt Nam
  const formatPrice = (price) => {
    return price ? price.toLocaleString('vi-VN') : '0';
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
                    <Image 
                      src={item.image} 
                      alt={item.name} 
                      fluid 
                      rounded 
                      onError={({currentTarget}) => {
                        currentTarget.onerror = null;
                        currentTarget.src="/images/placeholder.jpg";
                      }}
                    />
                  </Col>
                  <Col md={3}>
                    <Link to={`/product/${item.product}`}>
                      {item.name}
                      {item.unit.description && (
                        <div>
                          <small className="text-muted">{item.unit.description}</small>
                        </div>
                      )}
                    </Link>
                  </Col>
                  <Col md={2}>
                    <div>
                      {formatPrice(item.price)}đ
                      {item.unit && item.unit.name !== 'Sản phẩm' && (
                        <Badge bg="secondary" className="ms-1">
                          /{item.unit.name}
                        </Badge>
                      )}
                    </div>
                  </Col>
                  <Col md={2}>
                    <Form.Control
                      as='select'
                      value={item.qty}
                      onChange={(e) =>
                        dispatch(
                          addToCart(item.product, Number(e.target.value), item.unit?.name)
                        )
                      }
                    >
                      {[...Array(Math.min(item.countInStock, 10)).keys()].map((x) => (
                        <option key={x + 1} value={x + 1}>
                          {x + 1}
                        </option>
                      ))}
                    </Form.Control>
                  </Col>
                  <Col md={2} className="text-center">
                    <Badge bg="info">{item.unit?.name || 'Sản phẩm'}</Badge>
                  </Col>
                  <Col md={1} className="text-end">
                    <Button
                      type='button'
                      variant='danger'
                      onClick={() => removeFromCartHandler(item.product)}
                    >
                      <i className='fas fa-trash'></i>
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
              <h2 className="fs-5">
                Tổng cộng ({cartItems.reduce((acc, item) => acc + item.qty, 0)}) sản phẩm
              </h2>
              <h4 className="mt-3 text-primary">
                {formatPrice(cartItems.reduce((acc, item) => acc + item.qty * item.price, 0))}đ
              </h4>
            </ListGroup.Item>
            <ListGroup.Item>
              <Button
                type='button'
                className='btn-block w-100'
                disabled={cartItems.length === 0}
                onClick={checkoutHandler}
              >
                <i className="fas fa-shopping-cart me-2"></i>
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