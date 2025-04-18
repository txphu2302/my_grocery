import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Badge } from 'react-bootstrap';
import Rating from './Rating';

const Product = ({ product }) => {
  return (
    <Card className='h-100 shadow-sm'>
      <div className="text-center p-3" style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Link to={`/product/${product._id}`}>
          <Card.Img 
            src={product.image} 
            variant='top' 
            style={{ maxHeight: '180px', objectFit: 'contain' }}
          />
        </Link>
      </div>

      <Card.Body className="d-flex flex-column">
        <Link to={`/product/${product._id}`} className="text-decoration-none">
          <Card.Title 
            as='div' 
            className="mb-2"
            style={{ 
              height: '48px', 
              overflow: 'hidden', 
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical'
            }}
          >
            {product.name}
          </Card.Title>
        </Link>

        <div className="d-flex justify-content-between align-items-center mb-2">
          {product.countInStock > 0 ? (
            <Badge bg="success" pill>Còn hàng</Badge>
          ) : (
            <Badge bg="danger" pill>Hết hàng</Badge>
          )}
        </div>

        <Card.Text as='h4' className="text-primary mt-auto mb-0">
          {product.price.toLocaleString('vi-VN')}₫
        </Card.Text>
      </Card.Body>
      
      <Card.Footer className="bg-white border-top-0 pt-0">
        <Link to={`/product/${product._id}`} className="btn btn-outline-primary btn-sm w-100">
          Xem chi tiết
        </Link>
      </Card.Footer>
    </Card>
  );
};

export default Product;