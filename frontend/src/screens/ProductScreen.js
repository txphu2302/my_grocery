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
  const [displayedImage, setDisplayedImage] = useState(''); // Add state for the displayed image

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const productDetails = useSelector((state) => state.productDetails);
  const { loading, error, product } = productDetails;

  useEffect(() => {
    dispatch(listProductDetails(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (product && product.units && product.units.length > 0) {
      const defaultUnit = product.units.find(unit => unit.isDefault) || product.units[0];
      setSelectedUnit(defaultUnit.name);
      setDisplayedImage(defaultUnit.image || product.image); // Set initial image to default unit's image or product image
    } else {
      setSelectedUnit('Sản phẩm');
      setDisplayedImage(product.image); // Fallback to product image if no units
    }
  }, [product]);

  const addToCartHandler = () => {
    navigate(`/cart/${id}?qty=${qty}&unit=${encodeURIComponent(selectedUnit)}`);
  };

  const calculateUnitPrice = (unitName) => {
    if (!product || !product.units) return product?.price || 0;

    const unit = product.units.find(u => u.name === unitName);
    if (!unit) return product.price;

    return unit.price || (product.price / unit.ratio);
  };

  const getUnits = () => {
    if (!product || !product.units || product.units.length === 0) {
      return [{ name: 'Sản phẩm', ratio: 1, isDefault: true, image: '' }];
    }
    return product.units;
  };

  const handleUnitSelect = (unitName) => {
    setSelectedUnit(unitName);
    const unit = product.units.find(u => u.name === unitName);
    setDisplayedImage(unit?.image || product.image); // Update displayed image when unit changes
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
      ) : (
        <>
          <Meta title={product.name} />
          <Row>
            <Col md={6}>
              <Image 
                src={displayedImage} 
                alt={product.name} 
                fluid 
                className='product-image shadow-sm rounded' 
                style={{ maxHeight: '400px', objectFit: 'contain' }} // Ensure consistent image size
              />
            </Col>
            <Col md={3}>
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

                {/* Hiển thị giá theo đơn vị nếu có nhiều đơn vị */}
                <ListGroup.Item>
                  {product.units && product.units.length > 1 ? (
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
                                  alt={unit.name} 
                                  style={{ width: '40px', height: '40px', objectFit: 'cover', marginRight: '10px' }} 
                                />
                              ) : (
                                <span className="me-2 text-muted">No Image</span>
                              )}
                              <span>{unit.name} {unit.description ? `(${unit.description})` : ''}</span>
                            </div>
                            <h5 className="mb-0">{(unit.price || (product.price / unit.ratio)).toLocaleString('vi-VN')}đ</h5>
                          </ListGroup.Item>
                        ))}
                      </ListGroup>
                    </>
                  ) : (
                    <h4>Giá: {product.price.toLocaleString('vi-VN')}đ</h4>
                  )}
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

                <ListGroup.Item>
                  <p>{product.description}</p>
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
                        <strong>{calculateUnitPrice(selectedUnit).toLocaleString('vi-VN')}đ</strong>
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
                        {product.countInStock > 0 ? 'Còn hàng' : 'Hết hàng'}
                      </Col>
                    </Row>
                  </ListGroup.Item>

                  {product.countInStock > 0 && (
                    <ListGroup.Item>
                      {/* Hiển thị dropdown chọn đơn vị nếu có nhiều đơn vị */}
                      {product.units && product.units.length > 1 && (
                        <Row className="mb-2">
                          <Col>Đơn vị:</Col>
                          <Col>
                            <Form.Select
                              value={selectedUnit}
                              onChange={(e) => handleUnitSelect(e.target.value)}
                            >
                              {getUnits().map((unit, index) => (
                                <option key={index} value={unit.name}>
                                  {unit.name} {unit.description ? `(${unit.description})` : ''} - {(unit.price || (product.price / unit.ratio)).toLocaleString('vi-VN')}đ
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
        </>
      )}
    </>
  );
};

export default ProductScreen;