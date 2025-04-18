import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { LinkContainer } from 'react-router-bootstrap';
import { Navbar, Nav, Container, NavDropdown, Badge } from 'react-bootstrap';
import SearchBox from './SearchBox';
import { logout } from '../actions/userActions';

const Header = () => {
  const dispatch = useDispatch();

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  const cart = useSelector((state) => state.cart);
  const { cartItems } = cart;

  const logoutHandler = () => {
    dispatch(logout());
  };

  return (
    <header>
      <Navbar bg='primary' variant='dark' expand='lg' collapseOnSelect className="py-2 shadow-sm">
        <Container>
          <LinkContainer to='/'>
            <Navbar.Brand className="fw-bold">
              <i className="fas fa-store me-2"></i>
              Tạp Hóa Online
            </Navbar.Brand>
          </LinkContainer>
          
          <Navbar.Toggle aria-controls='basic-navbar-nav' />
          <Navbar.Collapse id='basic-navbar-nav'>
            <Nav className="me-auto">
              <LinkContainer to='/'>
                <Nav.Link>
                  <i className="fas fa-home me-1"></i> Trang chủ
                </Nav.Link>
              </LinkContainer>
              <LinkContainer to='/products'>
                <Nav.Link>
                  <i className="fas fa-box me-1"></i> Sản phẩm
                </Nav.Link>
              </LinkContainer>
              <LinkContainer to='/contact'>
                <Nav.Link>
                  <i className="fas fa-envelope me-1"></i> Liên hệ
                </Nav.Link>
              </LinkContainer>
            </Nav>
            
            <SearchBox />
            
            <Nav className='ms-auto'>
              <LinkContainer to='/cart'>
                <Nav.Link className="position-relative">
                  <i className='fas fa-shopping-cart me-1'></i> Giỏ hàng
                  {cartItems.length > 0 && (
                    <Badge 
                      bg="danger" 
                      pill 
                      className="position-absolute top-0 start-100 translate-middle"
                    >
                      {cartItems.reduce((acc, item) => acc + item.qty, 0)}
                    </Badge>
                  )}
                </Nav.Link>
              </LinkContainer>
              
              {userInfo ? (
                <NavDropdown 
                  title={<><i className="fas fa-user-circle me-1"></i> {userInfo.name}</>} 
                  id='username'
                >
                  <LinkContainer to='/profile'>
                    <NavDropdown.Item>
                      <i className="fas fa-user me-2 text-primary"></i>
                      Thông tin tài khoản
                    </NavDropdown.Item>
                  </LinkContainer>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={logoutHandler}>
                    <i className="fas fa-sign-out-alt me-2 text-danger"></i>
                    Đăng xuất
                  </NavDropdown.Item>
                </NavDropdown>
              ) : (
                <LinkContainer to='/login'>
                  <Nav.Link>
                    <i className='fas fa-user me-1'></i> Đăng nhập
                  </Nav.Link>
                </LinkContainer>
              )}
              
              {userInfo && userInfo.isAdmin && (
                <NavDropdown 
                  title={<><i className="fas fa-tools me-1"></i> Quản trị</>}
                  id='adminmenu'
                >
                  <LinkContainer to='/admin/userlist'>
                    <NavDropdown.Item>
                      <i className="fas fa-users me-2 text-info"></i>
                      Quản lý người dùng
                    </NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer to='/admin/productlist'>
                    <NavDropdown.Item>
                      <i className="fas fa-boxes me-2 text-success"></i>
                      Quản lý sản phẩm
                    </NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer to='/admin/orderlist'>
                    <NavDropdown.Item>
                      <i className="fas fa-list me-2 text-warning"></i>
                      Quản lý đơn hàng
                    </NavDropdown.Item>
                  </LinkContainer>
                </NavDropdown>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};

export default Header;