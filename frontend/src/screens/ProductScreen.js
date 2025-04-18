import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Image, ListGroup, Card, Button, Form } from 'react-bootstrap';
import Rating from '../components/Rating';
import Message from '../components/Message';
import Loader from '../components/Loader';
import { listProductDetails } from '../actions/productActions';

const ProductScreen = () => {
  const [qty, setQty] = useState(1);
  const dispatch = useDispatch();
  const params = useParams();
  const navigate = useNavigate();

  const productDetails = useSelector((state) => state.productDetails);
  const { loading, error, product = {} } = productDetails;

  useEffect(() => {
    dispatch(listProductDetails(params.id));
  }, [dispatch, params.id]);

  const addToCartHandler = () => {
    navigate(`/cart/${params.id}?qty=${qty}`);
  };

  return (
    <>
      <Link className='btn btn-light my-3' to='/'>
        Quay lại
      </Link>
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>{error}</Message>
      ) : !product || Object.keys(product).length === 0 ? (
        <Message>Không tìm thấy thông tin sản phẩm</Message>
      ) : (
        <Row>
          <Col md={6}>
            <Image src={product.image} alt={product.name || 'Sản phẩm'} fluid />
          </Col>
          <Col md={3}>
            <ListGroup variant='flush'>
              <ListGroup.Item>
                <h3>{product.name}</h3>
              </ListGroup.Item>
              <ListGroup.Item>
                <Rating
                  value={product.rating || 0}
                  text={`${product.numReviews || 0} đánh giá`}
                />
              </ListGroup.Item>
              <ListGroup.Item>
                Giá: {product.price ? product.price.toLocaleString('vi-VN') : 0}đ
              </ListGroup.Item>
              <ListGroup.Item>Mô tả: {product.description}</ListGroup.Item>
            </ListGroup>
          </Col>
          <Col md={3}>
            <Card>
              <ListGroup variant='flush'>
                <ListGroup.Item>
                  <Row>
                    <Col>Giá:</Col>
                    <Col>
                      <strong>{product.price ? product.price.toLocaleString('vi-VN') : 0}đ</strong>
                    </Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Tình trạng:</Col>
                    <Col>
                      {product.countInStock > 0 ? 'Còn hàng' : 'Hết hàng'}
                    </Col>
                  </Row>
                </ListGroup.Item>
                {product.countInStock > 0 && (
                  <ListGroup.Item>
                    <Row>
                      <Col>Số lượng</Col>
                      <Col>
                        <Form.Control
                          as='select'
                          value={qty}
                          onChange={(e) => setQty(e.target.value)}
                        >
                          {[...Array(Math.min(product.countInStock, 10)).keys()].map((x) => (
                            <option key={x + 1} value={x + 1}>
                              {x + 1}
                            </option>
                          ))}
                        </Form.Control>
                      </Col>
                    </Row>
                  </ListGroup.Item>
                )}
                <ListGroup.Item>
                  <Button
                    onClick={addToCartHandler}
                    className='btn-block'
                    type='button'
                    disabled={product.countInStock === 0}
                  >
                    Thêm vào giỏ hàng
                  </Button>
                </ListGroup.Item>
                </ListGroup>
            </Card>
            </Col>
        </Row>
        )}
    </>
    );
}
export default ProductScreen;