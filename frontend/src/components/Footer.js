import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
  return (
    <footer>
      <Container>
        <Row>
          <Col className='text-center py-3'>
            <p>Tạp Hóa Online &copy; {new Date().getFullYear()}</p>
            <p>Địa chỉ: 75 / 3 Đường Lê Nguyên Đạt, Tp. Biên Hòa, Đồng Nai </p>
            <p>Điện thoại: 034 822 7858</p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;