import React, { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { Form, Button, Row, Col, Image } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import Message from '../components/Message'
import Loader from '../components/Loader'
import FormContainer from '../components/FormContainer'
import { listProductDetails, updateProduct } from '../actions/productActions'
import { PRODUCT_UPDATE_RESET } from '../constants/productConstants'
import axios from 'axios'

const ProductEditScreen = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [price, setPrice] = useState(0)
  const [image, setImage] = useState('')
  const [brand, setBrand] = useState('')
  const [category, setCategory] = useState('')
  const [countInStock, setCountInStock] = useState(0)
  const [description, setDescription] = useState('')
  const [barcode, setBarcode] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)

  const dispatch = useDispatch()

  const productDetails = useSelector((state) => state.productDetails)
  const { loading, error, product } = productDetails

  const productUpdate = useSelector((state) => state.productUpdate)
  const {
    loading: loadingUpdate,
    error: errorUpdate,
    success: successUpdate,
  } = productUpdate

  useEffect(() => {
    if (successUpdate) {
      dispatch({ type: PRODUCT_UPDATE_RESET })
      navigate('/admin/productlist')
    } else {
      if (!product.name || product._id !== id) {
        dispatch(listProductDetails(id))
      } else {
        setName(product.name)
        setPrice(product.price)
        setImage(product.image)
        setBrand(product.brand)
        setCategory(product.category)
        setCountInStock(product.countInStock)
        setDescription(product.description)
        setBarcode(product.barcode || '')
      }
    }
  }, [dispatch, id, product, successUpdate, navigate])

  const uploadFileHandler = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    // Validate file size and type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
    const maxSize = 5 * 1024 * 1024 // 5MB
    
    if (!validTypes.includes(file.type)) {
      setUploadError('Chỉ chấp nhận file JPG, JPEG, PNG hoặc WebP')
      return
    }
    
    if (file.size > maxSize) {
      setUploadError('Kích thước file không được vượt quá 5MB')
      return
    }
    
    setUploadError(null)
    const formData = new FormData()
    formData.append('image', file)
    setUploading(true)
  
    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
  
      const { data } = await axios.post('/api/upload', formData, config)
      console.log('Upload response:', data)
      setImage(data)
      setUploading(false)
    } catch (error) {
      console.error('Upload error:', error)
      setUploadError(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Có lỗi xảy ra khi tải ảnh lên'
      )
      setUploading(false)
    }
  }

  const submitHandler = (e) => {
    e.preventDefault()
    
    // Basic validation
    if (!name.trim()) {
      return alert('Vui lòng nhập tên sản phẩm')
    }
    
    if (!image.trim()) {
      return alert('Vui lòng thêm hình ảnh cho sản phẩm')
    }
    
    if (!category.trim()) {
      return alert('Vui lòng nhập danh mục sản phẩm')
    }
    
    // Set default values for optional fields
    const finalBrand = brand.trim() || 'Không có thương hiệu'
    const finalBarcode = barcode.trim() || `PROD${Date.now()}`
    
    dispatch(
      updateProduct({
        _id: id,
        name,
        price,
        image,
        brand: finalBrand, 
        category,
        description,
        countInStock,
        barcode: finalBarcode
      })
    )
  }

  return (
    <>
      <Link to='/admin/productlist' className='btn btn-light my-3'>
        <i className='fas fa-arrow-left'></i> Quay lại
      </Link>
      <FormContainer>
        <h1>Chỉnh sửa sản phẩm</h1>
        {loadingUpdate && <Loader />}
        {errorUpdate && <Message variant='danger'>{errorUpdate}</Message>}
        {loading ? (
          <Loader />
        ) : error ? (
          <Message variant='danger'>{error}</Message>
        ) : (
          <Form onSubmit={submitHandler}>
            <Form.Group controlId='name'>
              <Form.Label>Tên sản phẩm <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type='text'
                placeholder='Nhập tên sản phẩm'
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Form.Group>

            <Row className='mt-3'>
              <Col md={6}>
                <Form.Group controlId='price'>
                  <Form.Label>Giá (VNĐ)</Form.Label>
                  <Form.Control
                    type='number'
                    placeholder='Nhập giá'
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    min="0"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId='countInStock'>
                  <Form.Label>Số lượng trong kho</Form.Label>
                  <Form.Control
                    type='number'
                    placeholder='Nhập số lượng'
                    value={countInStock}
                    onChange={(e) => setCountInStock(e.target.value)}
                    min="0"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group controlId='image' className='mt-3'>
              <Form.Label>Hình ảnh <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type='text'
                placeholder='Nhập URL hình ảnh'
                value={image}
                onChange={(e) => setImage(e.target.value)}
              />
              <Form.Control
                type='file'
                id='image-file'
                label='Chọn file'
                onChange={uploadFileHandler}
                className='mt-2'
                accept=".jpg,.jpeg,.png,.webp"
              />
              {uploading && <Loader />}
              {uploadError && <Message variant='danger'>{uploadError}</Message>}
            
            </Form.Group>

            <Row className='mt-3'>
              <Col md={6}>
                <Form.Group controlId='brand'>
                  <Form.Label>Nhãn hiệu</Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='Nhập nhãn hiệu'
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId='category'>
                  <Form.Label>Danh mục <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type='text'
                    placeholder='Nhập danh mục'
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group controlId='barcode' className='mt-3'>
              <Form.Label>Mã vạch (Barcode)</Form.Label>
              <Form.Control
                type='text'
                placeholder='Nhập mã vạch hoặc để trống để tự động tạo'
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
              />
              <Form.Text className="text-muted">
                Nếu bỏ trống, hệ thống sẽ tự tạo mã vạch duy nhất
              </Form.Text>
            </Form.Group>

            <Form.Group controlId='description' className='mt-3'>
              <Form.Label>Mô tả <span className="text-danger">*</span></Form.Label>
              <Form.Control
                as='textarea'
                rows={4}
                placeholder='Nhập mô tả sản phẩm'
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </Form.Group>

            <Button type='submit' variant='primary' className='mt-4 w-100'>
              Cập nhật sản phẩm
            </Button>
          </Form>
        )}
      </FormContainer>
    </>
  )
}

export default ProductEditScreen