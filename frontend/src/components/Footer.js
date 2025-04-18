import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
  return (
    <footer>
      <Container>
        <Row>
          <Col className='text-center py-3'>
            <p>Tạp Hóa Online &copy; {new Date().getFullYear()}</p>
            <p>Địa chỉ: 123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh</p>
            <p>Điện thoại: 0123 456 789</p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;