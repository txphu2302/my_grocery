import React, { useEffect, useState } from 'react'
import { LinkContainer } from 'react-router-bootstrap'
import { Table, Button, Row, Col, Form } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import Message from '../components/Message'
import Loader from '../components/Loader'
import Paginate from '../components/Paginate'
import { listProducts, deleteProduct, createProduct } from '../actions/productActions'
import { PRODUCT_CREATE_RESET } from '../constants/productConstants'
import { useNavigate, useParams } from 'react-router-dom'

const ProductListScreen = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { pageNumber = 1 } = useParams()
  
  const [searchKeyword, setSearchKeyword] = useState('')

  const productList = useSelector((state) => state.productList)
  const { loading, error, products, page, pages, count } = productList

  const productDelete = useSelector((state) => state.productDelete)
  const { loading: loadingDelete, error: errorDelete, success: successDelete } = productDelete

  const productCreate = useSelector((state) => state.productCreate)
  const { loading: loadingCreate, error: errorCreate, success: successCreate, product: createdProduct } = productCreate

  const userLogin = useSelector((state) => state.userLogin)
  const { userInfo } = userLogin

  useEffect(() => {
    dispatch({ type: PRODUCT_CREATE_RESET })

    if (!userInfo || !userInfo.isAdmin) {
      navigate('/login')
    } 

    if (successCreate) {
      navigate(`/admin/product/${createdProduct._id}/edit`)
    } else {
      // Thêm tham số isAdmin=true để lấy nhiều sản phẩm hơn
      dispatch(listProducts('', pageNumber, '', '', true))
    }
  }, [
    dispatch, 
    navigate, 
    userInfo, 
    successDelete, 
    successCreate, 
    createdProduct, 
    pageNumber
  ])

  const deleteHandler = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      dispatch(deleteProduct(id))
    }
  }

  const createProductHandler = () => {
    dispatch(createProduct())
  }
  
  const handleSearch = (e) => {
    e.preventDefault()
    dispatch(listProducts(searchKeyword, 1, '', '', true))
  }
  
  const clearSearch = () => {
    setSearchKeyword('')
    dispatch(listProducts('', 1, '', '', true))
  }

  return (
    <>
      <Row className='align-items-center'>
        <Col>
          <h1>Sản phẩm ({count || 0})</h1>
        </Col>
        <Col className='text-end'>
          <Button className='my-3' onClick={createProductHandler}>
            <i className='fas fa-plus'></i> Thêm sản phẩm
          </Button>
        </Col>
      </Row>
      
      {/* Thêm thanh tìm kiếm */}
      <Form onSubmit={handleSearch} className="d-flex mb-3">
        <Form.Control
          type="text"
          placeholder="Tìm sản phẩm..."
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          className="me-2"
        />
        <Button type="submit" variant="outline-success">
          <i className="fas fa-search"></i>
        </Button>
        {searchKeyword && (
          <Button variant="outline-secondary" onClick={clearSearch} className="ms-2">
            <i className="fas fa-times"></i>
          </Button>
        )}
      </Form>
      
      {loadingDelete && <Loader />}
      {errorDelete && <Message variant='danger'>{errorDelete}</Message>}
      {loadingCreate && <Loader />}
      {errorCreate && <Message variant='danger'>{errorCreate}</Message>}
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>{error}</Message>
      ) : (
        <>
          <Table striped bordered hover responsive className='table-sm'>
            <thead>
              <tr>
                <th>ID</th>
                <th>TÊN</th>
                <th>GIÁ</th>
                <th>NHÃN HIỆU</th>
                <th>DANH MỤC</th>
                <th>KHO</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id}>
                  <td>{product._id}</td>
                  <td>{product.name}</td>
                  <td>{product.price.toLocaleString('vi-VN')}đ</td>
                  <td>{product.brand}</td>
                  <td>{product.category}</td>
                  <td className="text-center">
                    {product.countInStock > 0 ? product.countInStock : (
                      <span className="text-danger">Hết hàng</span>
                    )}
                  </td>
                  <td className="text-center">
                    <LinkContainer to={`/admin/product/${product._id}/edit`}>
                      <Button variant='light' className='btn-sm mx-1'>
                        <i className='fas fa-edit'></i>
                      </Button>
                    </LinkContainer>
                    <Button
                      variant='danger'
                      className='btn-sm mx-1'
                      onClick={() => deleteHandler(product._id)}
                    >
                      <i className='fas fa-trash'></i>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Paginate pages={pages} page={page} isAdmin={true} />
        </>
      )}
    </>
  )
}

export default ProductListScreen