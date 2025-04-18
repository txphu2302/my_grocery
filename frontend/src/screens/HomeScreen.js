import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Tab, Nav, Container } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import Product from '../components/Product';
import Message from '../components/Message';
import Loader from '../components/Loader';
import Paginate from '../components/Paginate';
import { listProducts } from '../actions/productActions';
import Meta from '../components/Meta';

const HomeScreen = () => {
  const dispatch = useDispatch();
  const params = useParams();

  const keyword = params.keyword || '';
  const pageNumber = params.pageNumber || 1;

  const [activeCategory, setActiveCategory] = useState('all');

  const productList = useSelector((state) => state.productList);
  const { loading, error, products, page, pages } = productList;

  // Get unique categories when products are loaded
  const categories = products && products.length > 0 
    ? ['all', ...new Set(products.map(p => p.category))]
    : ['all'];

  useEffect(() => {
    dispatch(listProducts(keyword, pageNumber));
  }, [dispatch, keyword, pageNumber]);

  return (
    <>
      <Meta title={keyword ? `Kết quả tìm kiếm: ${keyword}` : 'Sản phẩm mới nhất'} />
      
      <h2 className="section-title border-bottom pb-3 mb-4">
        {keyword ? `Kết quả tìm kiếm: ${keyword}` : 'Sản phẩm theo danh mục'}
      </h2>
      
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>{error}</Message>
      ) : (
        <>
          {/* Category Navigation */}
          {!keyword && (
            <Nav 
              variant="tabs" 
              className="mb-4 category-tabs"
              activeKey={activeCategory}
              onSelect={(selectedKey) => setActiveCategory(selectedKey)}
            >
              {categories.map(category => (
                <Nav.Item key={category}>
                  <Nav.Link 
                    eventKey={category}
                    className="text-capitalize"
                  >
                    {category === 'all' ? 'Tất cả sản phẩm' : category}
                  </Nav.Link>
                </Nav.Item>
              ))}
            </Nav>
          )}
          
          {/* Products Display */}
          <div className="products-container">
            <Row className="g-4">
              {products && products.length > 0 ? (
                products
                  .filter(product => activeCategory === 'all' || product.category === activeCategory)
                  .map((product) => (
                    <Col key={product._id} xs={6} sm={6} md={4} lg={3} className="mb-4">
                      <div className="h-100">
                        <Product product={product} />
                      </div>
                    </Col>
                  ))
              ) : (
                <Col>
                  <Message>Không có sản phẩm nào.</Message>
                </Col>
              )}
            </Row>
          </div>
          
          {/* Only show pagination if not filtering by category or showing all */}
          {(activeCategory === 'all' || keyword) && (
            <Paginate
              pages={pages}
              page={page}
              keyword={keyword ? keyword : ''}
            />
          )}
          
          {/* Featured Categories Section */}
          {!keyword && activeCategory === 'all' && (
            <div className="mt-5 pt-4 border-top">
              <h3 className="mb-4">Danh mục nổi bật</h3>
              <Row className="g-4">
                {categories
                  .filter(category => category !== 'all')
                  .slice(0, 4)  // Take only first 4 categories
                  .map(category => (
                  <Col key={category} md={3} sm={6} className="mb-3">
                    <div 
                      className="category-card shadow-sm p-4 text-center rounded h-100 d-flex flex-column align-items-center justify-content-center"
                      onClick={() => setActiveCategory(category)}
                      style={{ cursor: 'pointer', backgroundColor: '#f8f9fa', transition: 'all 0.3s' }}
                      onMouseOver={(e) => {e.currentTarget.style.backgroundColor = '#e9ecef'}}
                      onMouseOut={(e) => {e.currentTarget.style.backgroundColor = '#f8f9fa'}}
                    >
                      <div className="category-icon mb-3" style={{ fontSize: '2rem', color: '#007bff' }}>
                        <i className="fas fa-folder"></i>
                      </div>
                      <h5>{category}</h5>
                      <p className="mb-0 text-muted">
                        {products.filter(p => p.category === category).length} sản phẩm
                      </p>
                    </div>
                  </Col>
                ))}
              </Row>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default HomeScreen;