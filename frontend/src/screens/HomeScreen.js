import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Tab, Nav, Container, Button } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import Product from '../components/Product';
import Message from '../components/Message';
import Loader from '../components/Loader';
import Paginate from '../components/Paginate';
import { listProducts } from '../actions/productActions';
import Meta from '../components/Meta';

const HomeScreen = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const params = useParams();

  const keyword = params.keyword || '';
  const pageNumber = params.pageNumber || 1;
  const categoryParam = params.category || '';

  // Theo dõi danh mục đang active
  const [activeCategory, setActiveCategory] = useState(categoryParam || 'all');
  const [allCategories, setAllCategories] = useState(['all']);
  
  const productList = useSelector((state) => state.productList);
  const { loading, error, products, page, pages } = productList;

  // Lấy danh sách tất cả danh mục (chỉ cần chạy một lần khi component mount)
  useEffect(() => {
    // Gọi API để lấy tất cả danh mục
    const fetchAllCategories = async () => {
      try {
        const res = await fetch('/api/products/categories');
        const data = await res.json();
        setAllCategories(['all', ...data]);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        // Fallback: Lấy từ sản phẩm hiện có
        if (products && products.length > 0) {
          const categories = ['all', ...new Set(products.map(p => p.category))];
          setAllCategories(categories);
        }
      }
    };
    
    fetchAllCategories();
  }, []);

  // Cập nhật danh mục từ sản phẩm nếu cần
  useEffect(() => {
    if (products && products.length > 0 && allCategories.length <= 1) {
      const categories = ['all', ...new Set(products.map(p => p.category))];
      setAllCategories(categories);
    }
    
    // Cập nhật danh mục active từ URL
    if (categoryParam) {
      setActiveCategory(categoryParam);
    }
  }, [products, categoryParam]);

  // Fetch sản phẩm khi danh mục, keyword hoặc trang thay đổi
  useEffect(() => {
    dispatch(listProducts(keyword, pageNumber, categoryParam));
  }, [dispatch, keyword, pageNumber, categoryParam]);

  // Xử lý khi chọn danh mục
  const handleCategoryChange = (category) => {
    if (category === 'all') {
      // Reset về trang chủ
      navigate('/');
    } else {
      // Điều hướng đến URL danh mục
      navigate(`/category/${category}`);
    }
    setActiveCategory(category);
  };

  return (
    <>
      <Meta title={
        keyword ? `Kết quả tìm kiếm: ${keyword}` : 
        categoryParam ? `Danh mục: ${categoryParam}` : 
        'Sản phẩm mới nhất'
      } />
      
      <h2 className="section-title border-bottom pb-3 mb-4">
        {keyword ? `Kết quả tìm kiếm: ${keyword}` : 
         categoryParam ? `Danh mục: ${categoryParam}` : 
         'Sản phẩm theo danh mục'}
      </h2>
      
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>{error}</Message>
      ) : (
        <>
          {/* Category Navigation */}
          <Nav 
            variant="tabs" 
            className="mb-4 category-tabs"
            activeKey={activeCategory}
            onSelect={handleCategoryChange}
          >
            {allCategories.map(category => (
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
          
          {/* Products Display */}
          <div className="products-container">
            <Row className="g-4">
              {products && products.length > 0 ? (
                products.map((product) => (
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
          
          {/* Chỉ hiển thị phân trang khi không lọc theo danh mục */}
          {!categoryParam && !keyword && (
            <Paginate
              pages={pages}
              page={page}
              keyword={keyword ? keyword : ''}
            />
          )}
          
          {/* Featured Categories Section */}
          {!keyword && !categoryParam && (
            <div className="mt-5 pt-4 border-top">
              <h3 className="mb-4">Danh mục nổi bật</h3>
              <Row className="g-4">
                {allCategories
                  .filter(category => category !== 'all')
                  .slice(0, 4)  // Take only first 4 categories
                  .map(category => (
                  <Col key={category} md={3} sm={6} className="mb-3">
                    <div 
                      className="category-card shadow-sm p-4 text-center rounded h-100 d-flex flex-column align-items-center justify-content-center"
                      onClick={() => handleCategoryChange(category)}
                      style={{ cursor: 'pointer', backgroundColor: '#f8f9fa', transition: 'all 0.3s' }}
                      onMouseOver={(e) => {e.currentTarget.style.backgroundColor = '#e9ecef'}}
                      onMouseOut={(e) => {e.currentTarget.style.backgroundColor = '#f8f9fa'}}
                    >
                      <div className="category-icon mb-3" style={{ fontSize: '2rem', color: '#007bff' }}>
                        <i className="fas fa-folder"></i>
                      </div>
                      <h5>{category}</h5>
                      <p className="mb-0 text-muted">
                        {products.filter(p => p.category === category).length}+ sản phẩm
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