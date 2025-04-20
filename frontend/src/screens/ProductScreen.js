import React, { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { Row, Col, Image, ListGroup, Card, Button, Form, Badge, Tab, Nav } from 'react-bootstrap'
import Rating from '../components/Rating'
import { useDispatch, useSelector } from 'react-redux'
import { listProductDetails } from '../actions/productActions'
import Loader from '../components/Loader'
import Message from '../components/Message'
import Meta from '../components/Meta'

const ProductScreen = () => {
  const [qty, setQty] = useState(1)
  const [selectedUnitName, setSelectedUnitName] = useState('')
  
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { id } = useParams()

  const productDetails = useSelector((state) => state.productDetails)
  const { loading, error, product } = productDetails

  useEffect(() => {
    dispatch(listProductDetails(id))
  }, [dispatch, id])

  // Thiết lập đơn vị mặc định khi product được tải
  useEffect(() => {
    if (product && product.units && product.units.length > 0) {
      const defaultUnit = product.units.find(unit => unit.isDefault) || product.units[0];
      setSelectedUnitName(defaultUnit.name);
    } else {
      setSelectedUnitName('Sản phẩm');
    }
  }, [product])

  const addToCartHandler = () => {
    navigate(`/cart/${id}?qty=${qty}&unit=${encodeURIComponent(selectedUnitName)}`);
  }

  // Lấy danh sách đơn vị và thông tin
  const getUnitsInfo = () => {
    // Nếu sản phẩm có units được cấu hình
    if (product.units && product.units.length > 0) {
      return product.units;
    }

    // Nếu không, tự động tạo đơn vị mặc định dựa vào danh mục
    if (product.category?.toLowerCase().includes('nước giải khát')) {
      return [
        { name: 'Thùng', ratio: 1, isDefault: true },
        { name: 'Lốc', ratio: 4 },
        { name: 'Lon/Chai', ratio: 24 }
      ];
    } 
    else if (product.category?.toLowerCase().includes('bánh kẹo')) {
      return [
        { name: 'Hộp', ratio: 1, isDefault: true },
        { name: 'Gói', ratio: 10 },
        { name: 'Cái', ratio: 50 }
      ];
    }
    else if (product.category?.toLowerCase().includes('mì')) {
      return [
        { name: 'Thùng', ratio: 1, isDefault: true },
        { name: 'Gói', ratio: 30 }
      ];
    }
    
    // Mặc định
    return [{ name: 'Sản phẩm', ratio: 1, isDefault: true }];
  }

  // Tính giá theo đơn vị
  const calculatePriceByUnit = (unit) => {
    if (!product || !product.price) return 0;
    
    const basePrice = product.retailPrice && product.retailPrice > 0 
      ? product.retailPrice 
      : product.price;
    
    // Nếu đơn vị có giá riêng, sử dụng nó
    if (unit.price && unit.price > 0) {
      return unit.price;
    }
    
    // Nếu không, tính theo tỷ lệ
    return unit.ratio === 1 ? basePrice : Math.round(basePrice / unit.ratio);
  }

  // Format giá tiền
  const formatPrice = (price) => {
    return price?.toLocaleString('vi-VN') + 'đ';
  }

  // Tìm đơn vị được chọn
  const findSelectedUnit = () => {
    const units = getUnitsInfo();
    return units.find(u => u.name === selectedUnitName) || units[0];
  }

  const selectedUnit = findSelectedUnit();

  return (
    <>
      <Link className='btn btn-light my-3' to='/'>
        <i className='fas fa-arrow-left me-2'></i>Quay lại
      </Link>
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>{error}</Message>
      ) : (
        <>
          <Meta title={product.name} />
          <Row>
            <Col md={5}>
              <Image src={product.image} alt={product.name} fluid className='product-image shadow-sm rounded' />
            </Col>
            <Col md={4}>
              <ListGroup variant='flush'>
                <ListGroup.Item>
                  <h3>{product.name}</h3>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Rating
                    value={product.rating}
                    text={`${product.numReviews} đánh giá`}
                  />
                </ListGroup.Item>
                
                {/* Hiển thị bảng giá theo đơn vị khác nhau */}
                <ListGroup.Item>
                  <h5>Giá bán theo đơn vị</h5>
                  <Tab.Container defaultActiveKey={selectedUnitName}>
                    <Nav variant="tabs" className="mb-3">
                      {getUnitsInfo().map((unit, index) => (
                        <Nav.Item key={index}>
                          <Nav.Link 
                            eventKey={unit.name} 
                            onClick={() => setSelectedUnitName(unit.name)}
                            className="py-1 px-3"
                          >
                            {unit.name}
                          </Nav.Link>
                        </Nav.Item>
                      ))}
                    </Nav>
                    <Tab.Content>
                      {getUnitsInfo().map((unit, index) => (
                        <Tab.Pane key={index} eventKey={unit.name}>
                          <div className="d-flex justify-content-between align-items-center">
                            <h4 className="mb-0">
                              <span className="text-danger fw-bold">
                                {formatPrice(calculatePriceByUnit(unit))}
                              </span>
                              <small className="text-muted ms-2">/{unit.name}</small>
                            </h4>
                            {unit.ratio !== 1 && (
                              <Badge bg="info">
                                {unit.ratio} {unit.name} = 1 {getUnitsInfo().find(u => u.ratio === 1)?.name || 'Đơn vị gốc'}
                              </Badge>
                            )}
                            {unit.description && (
                              <div className="text-muted small">{unit.description}</div>
                            )}
                          </div>
                        </Tab.Pane>
                      ))}
                    </Tab.Content>
                  </Tab.Container>
                </ListGroup.Item>
                
                <ListGroup.Item>
                  <Row>
                    <Col>Thương hiệu:</Col>
                    <Col><strong>{product.brand}</strong></Col>
                  </Row>
                </ListGroup.Item>
                
                <ListGroup.Item>
                  <Row>
                    <Col>Danh mục:</Col>
                    <Col><strong>{product.category}</strong></Col>
                  </Row>
                </ListGroup.Item>
              </ListGroup>
            </Col>
            
            <Col md={3}>
              <Card>
                <ListGroup variant='flush'>
                  <ListGroup.Item>
                    <Row>
                      <Col>Giá:</Col>
                      <Col>
                        <strong className="text-danger">
                          {formatPrice(calculatePriceByUnit(selectedUnit))}
                        </strong>
                        <small className="text-muted">/{selectedUnitName}</small>
                      </Col>
                    </Row>
                  </ListGroup.Item>

                  <ListGroup.Item>
                    <Row>
                      <Col>Trạng thái:</Col>
                      <Col>
                        {product.countInStock > 0 ? 'Còn hàng' : 'Hết hàng'}
                      </Col>
                    </Row>
                  </ListGroup.Item>

                  {product.countInStock > 0 && (
                    <ListGroup.Item>
                      <Row className="mb-2">
                        <Col>Đơn vị:</Col>
                        <Col>
                          <Form.Select
                            value={selectedUnitName}
                            onChange={(e) => setSelectedUnitName(e.target.value)}
                          >
                            {getUnitsInfo().map((unit, index) => (
                              <option key={index} value={unit.name}>
                                {unit.name}
                              </option>
                            ))}
                          </Form.Select>
                        </Col>
                      </Row>
                      
                      <Row>
                        <Col>Số lượng:</Col>
                        <Col>
                          <Form.Control
                            as="select"
                            value={qty}
                            onChange={(e) => setQty(e.target.value)}
                          >
                            {[...Array(Math.min(product.countInStock, 10)).keys()].map(
                              (x) => (
                                <option key={x + 1} value={x + 1}>
                                  {x + 1}
                                </option>
                              )
                            )}
                          </Form.Control>
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  )}

                  <ListGroup.Item>
                    <Button
                      onClick={addToCartHandler}
                      className='btn-block w-100'
                      type='button'
                      disabled={product.countInStock === 0}
                    >
                      <i className="fas fa-cart-plus me-2"></i>
                      Thêm vào giỏ
                    </Button>
                  </ListGroup.Item>
                </ListGroup>
              </Card>
            </Col>
          </Row>
          
          <Row className="mt-4">
            <Col>
              <h4>Mô tả sản phẩm</h4>
              <p>{product.description}</p>
            </Col>
          </Row>
        </>
      )}
    </>
  )
}

export default ProductScreen