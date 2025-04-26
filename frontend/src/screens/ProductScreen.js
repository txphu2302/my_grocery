import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Image, ListGroup, Card, Button, Form, Badge } from 'react-bootstrap';
import Rating from '../components/Rating';
import { useDispatch, useSelector } from 'react-redux';
import { listProductDetails } from '../actions/productActions';
import Loader from '../components/Loader';
import Message from '../components/Message';
import Meta from '../components/Meta';

const ProductScreen = () => {
  const [qty, setQty] = useState(1);
  const [selectedUnit, setSelectedUnit] = useState('');
  const [displayedImage, setDisplayedImage] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const productDetails = useSelector((state) => state.productDetails);
  const { loading, error, product } = productDetails;

  // Add debug logs
  console.log('Product details:', product);

  useEffect(() => {
    dispatch(listProductDetails(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (product && product.image) {
      setDisplayedImage(product.image);
      
      if (product.units && product.units.length > 0) {
        const defaultUnit = product.units.find(unit => unit.isDefault) || product.units[0];
        setSelectedUnit(defaultUnit.name);
        if (defaultUnit.image) {
          setDisplayedImage(defaultUnit.image);
        }
      } else {
        setSelectedUnit('Sản phẩm');
      }
    }
  }, [product]);

  const addToCartHandler = () => {
    navigate(`/cart/${id}?qty=${qty}&unit=${encodeURIComponent(selectedUnit || 'Sản phẩm')}`);
  };

  const calculateUnitPrice = (unitName) => {
    if (!product || typeof product.price !== 'number') return 0;
    if (!product.units || product.units.length === 0) return product.price || 0;

    const unit = product.units.find(u => u.name === unitName);
    if (!unit) return product.price || 0;

    // Ensure we don't divide by zero
    const ratio = unit.ratio || 1;
    return unit.price || (product.price / ratio);
  };

  const getUnits = () => {
    if (!product || !product.units || !Array.isArray(product.units) || product.units.length === 0) {
      return [{ name: 'Sản phẩm', ratio: 1, isDefault: true }];
    }
    return product.units;
  };

  const handleUnitSelect = (unitName) => {
    setSelectedUnit(unitName);
    if (product && product.units && Array.isArray(product.units)) {
      const unit = product.units.find(u => u.name === unitName);
      if (unit && unit.image) {
        setDisplayedImage(unit.image);
      } else {
        setDisplayedImage(product?.image || '');
      }
    }
  };

  const formatPrice = (price) => {
    if (typeof price !== 'number') return '0';
    return price.toLocaleString('vi-VN');
  };

  return (
    <>
      <Link className='btn btn-light my-3' to='/'>
        <i className='fas fa-arrow-left me-2'></i>Quay lại
      </Link>
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>{error}</Message>
      ) : !product ? (
        <Message>Không tìm thấy sản phẩm</Message>
      ) : (
        <>
          <Meta title={product.name || 'Chi tiết sản phẩm'} />
          <Row>
            <Col md={6}>
              <Image 
                src={displayedImage || '/images/placeholder.jpg'} 
                alt={product.name || 'Sản phẩm'}
                fluid 
                className='product-image shadow-sm rounded' 
                style={{ maxHeight: '400px', objectFit: 'contain' }}
                onError={({currentTarget}) => {
                  currentTarget.onerror = null; // prevents looping
                  currentTarget.src="/images/placeholder.jpg";
                }}
              />
            </Col>
            <Col md={3}>
              <ListGroup variant='flush'>
                <ListGroup.Item>
                  <h3>{product.name || 'Chưa có tên sản phẩm'}</h3>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Rating
                    value={product.rating || 0}
                    text={`${product.numReviews || 0} đánh giá`}
                  />
                </ListGroup.Item>

                {/* Hiển thị giá theo đơn vị nếu có nhiều đơn vị */}
                <ListGroup.Item>
                  {product.units && Array.isArray(product.units) && product.units.length > 1 ? (
                    <>
                      <h5>Giá theo đơn vị:</h5>
                      <ListGroup variant="flush">
                        {product.units.map((unit, index) => (
                          <ListGroup.Item 
                            key={index} 
                            action 
                            onClick={() => handleUnitSelect(unit.name)} 
                            active={selectedUnit === unit.name}
                            className="d-flex justify-content-between align-items-center py-2"
                          >
                            <div className="d-flex align-items-center">
                              {unit.image ? (
                                <Image 
                                  src={unit.image} 
                                  alt={unit.name || 'Đơn vị'} 
                                  style={{ width: '40px', height: '40px', objectFit: 'cover', marginRight: '10px' }} 
                                  onError={({currentTarget}) => {
                                    currentTarget.onerror = null;
                                    currentTarget.src="/images/placeholder.jpg";
                                  }}
                                />
                              ) : (
                                <span className="me-2 text-muted">Không có hình</span>
                              )}
                              <span>{unit.name || 'Đơn vị'} {unit.description ? `(${unit.description})` : ''}</span>
                            </div>
                            <h5 className="mb-0">
                              {formatPrice(unit.price || (product.price ? product.price / (unit.ratio || 1) : 0))}đ
                            </h5>
                          </ListGroup.Item>
                        ))}
                      </ListGroup>
                    </>
                  ) : (
                    // Đây là dòng gây lỗi, sửa lại như sau:
                    <h4>Giá: {formatPrice(product.price || 0)}đ</h4>
                  )}
                </ListGroup.Item>

                <ListGroup.Item>
                  <Row>
                    <Col>Thương hiệu:</Col>
                    <Col><strong>{product.brand || 'Không có thương hiệu'}</strong></Col>
                  </Row>
                </ListGroup.Item>

                <ListGroup.Item>
                  <Row>
                    <Col>Danh mục:</Col>
                    <Col><strong>{product.category || 'Chưa phân loại'}</strong></Col>
                  </Row>
                </ListGroup.Item>

                <ListGroup.Item>
                  <p>{product.description || 'Không có mô tả sản phẩm'}</p>
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
                        <strong>{formatPrice(calculateUnitPrice(selectedUnit))}đ</strong>
                        {selectedUnit && selectedUnit !== 'Sản phẩm' && (
                          <Badge bg="secondary" className="ms-1">/{selectedUnit}</Badge>
                        )}
                      </Col>
                    </Row>
                  </ListGroup.Item>

                  <ListGroup.Item>
                    <Row>
                      <Col>Trạng thái:</Col>
                      <Col>
                        {(product.countInStock > 0) ? 'Còn hàng' : 'Hết hàng'}
                      </Col>
                    </Row>
                  </ListGroup.Item>

                  {(product.countInStock > 0) && (
                    <ListGroup.Item>
                      {/* Hiển thị dropdown chọn đơn vị nếu có nhiều đơn vị */}
                      {product.units && Array.isArray(product.units) && product.units.length > 1 && (
                        <Row className="mb-2">
                          <Col>Đơn vị:</Col>
                          <Col>
                            <Form.Select
                              value={selectedUnit}
                              onChange={(e) => handleUnitSelect(e.target.value)}
                            >
                              {getUnits().map((unit, index) => (
                                <option key={index} value={unit.name}>
                                  {unit.name || 'Đơn vị'} {unit.description ? `(${unit.description})` : ''} - {formatPrice(unit.price || (product.price ? product.price / (unit.ratio || 1) : 0))}đ
                                </option>
                              ))}
                            </Form.Select>
                          </Col>
                        </Row>
                      )}

                      <Row>
                        <Col>Số lượng</Col>
                        <Col>
                          <Form.Control
                            as='select'
                            value={qty}
                            onChange={(e) => setQty(Number(e.target.value))}
                          >
                            {[...Array(Math.min(product.countInStock || 0, 10)).keys()].map(
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
                      disabled={!product.countInStock || product.countInStock === 0}
                    >
                      <i className="fas fa-cart-plus me-2"></i>
                      Thêm vào giỏ
                    </Button>
                  </ListGroup.Item>
                </ListGroup>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </>
  );
};

export default ProductScreen;