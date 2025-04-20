import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Form, Button, Row, Col, Table } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import Message from '../components/Message';
import Loader from '../components/Loader';
import FormContainer from '../components/FormContainer';
import { listProductDetails, updateProduct } from '../actions/productActions';
import { PRODUCT_UPDATE_RESET } from '../constants/productConstants';
import axios from 'axios';

const ProductEditScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [image, setImage] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [countInStock, setCountInStock] = useState(0);
  const [description, setDescription] = useState('');
  const [barcode, setBarcode] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  
  // Thêm state để quản lý đơn vị sản phẩm
  const [units, setUnits] = useState([{ 
    name: 'Sản phẩm', 
    ratio: 1, 
    price: 0,
    description: '',
    isDefault: true 
  }]);
  
  const dispatch = useDispatch();

  const productDetails = useSelector((state) => state.productDetails);
  const { loading, error, product } = productDetails;

  const productUpdate = useSelector((state) => state.productUpdate);
  const { loading: loadingUpdate, error: errorUpdate, success: successUpdate } = productUpdate;

  useEffect(() => {
    if (successUpdate) {
      dispatch({ type: PRODUCT_UPDATE_RESET });
      navigate('/admin/productlist');
    } else {
      if (!product.name || product._id !== id) {
        dispatch(listProductDetails(id));
      } else {
        setName(product.name);
        setPrice(product.price);
        setImage(product.image);
        setBrand(product.brand);
        setCategory(product.category);
        setCountInStock(product.countInStock);
        setDescription(product.description);
        setBarcode(product.barcode || '');
        
        // Khởi tạo đơn vị sản phẩm từ dữ liệu hoặc đơn vị mặc định
        if (product.units && product.units.length > 0) {
          setUnits(product.units);
        } else {
          setUnits([{ 
            name: 'Sản phẩm', 
            ratio: 1, 
            price: product.price,
            description: '',
            isDefault: true 
          }]);
        }
      }
    }
  }, [dispatch, id, product, successUpdate, navigate]);

  // Hàm quản lý đơn vị sản phẩm
  const addUnit = () => {
    setUnits([
      ...units, 
      {
        name: '',
        ratio: 1,
        price: 0,
        description: '',
        isDefault: units.length === 0
      }
    ]);
  };

  const removeUnit = (index) => {
    if (units.length <= 1) {
      alert('Sản phẩm phải có ít nhất một đơn vị');
      return;
    }
    
    // Nếu xóa đơn vị mặc định, đặt đơn vị đầu tiên làm mặc định
    const isRemovingDefault = units[index].isDefault;
    const updatedUnits = [...units];
    updatedUnits.splice(index, 1);
    
    if (isRemovingDefault && updatedUnits.length > 0) {
      updatedUnits[0].isDefault = true;
    }
    
    setUnits(updatedUnits);
  };

  const updateUnit = (index, field, value) => {
    const updatedUnits = [...units];
    updatedUnits[index][field] = value;
    
    // Tự động tính giá theo tỷ lệ khi thay đổi ratio
    if (field === 'ratio' && value > 0) {
      // Chỉ tính toán tự động nếu giá chưa được đặt
      if (!updatedUnits[index].price || updatedUnits[index].price === 0) {
        updatedUnits[index].price = Math.round(price / value);
      }
    }
    
    setUnits(updatedUnits);
  };

  const setDefaultUnit = (index) => {
    const updatedUnits = units.map((unit, i) => ({
      ...unit,
      isDefault: i === index
    }));
    setUnits(updatedUnits);
  };

  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB
  
    if (!validTypes.includes(file.type)) {
      setUploadError('Chỉ chấp nhận file JPG, JPEG, PNG hoặc WebP');
      return;
    }
  
    if (file.size > maxSize) {
      setUploadError('Kích thước file không được vượt quá 5MB');
      return;
    }
  
    setUploadError(null);
    const formData = new FormData();
    formData.append('image', file);
    setUploading(true);
  
    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };
  
      const { data } = await axios.post(
        'https://taphoaanha-com.onrender.com/api/upload',
        formData,
        config
      );
      
      console.log('Upload response:', data);
      setImage(data);
      setUploading(false);
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(
        error.response && error.response.data.message
          ? error.response.data.message
          : 'Có lỗi xảy ra khi tải ảnh lên'
      );
      setUploading(false);
    }
  };

  const submitHandler = (e) => {
    e.preventDefault();

    if (!name.trim()) {
      return alert('Vui lòng nhập tên sản phẩm');
    }

    if (!image.trim()) {
      return alert('Vui lòng thêm hình ảnh cho sản phẩm');
    }

    if (!category.trim()) {
      return alert('Vui lòng nhập danh mục sản phẩm');
    }

    // Kiểm tra và làm sạch dữ liệu đơn vị
    const cleanedUnits = units.map(unit => ({
      ...unit,
      name: unit.name.trim() || 'Sản phẩm',
      ratio: Number(unit.ratio) || 1,
      price: unit.price ? Number(unit.price) : 0,
      description: unit.description || '',
      isDefault: !!unit.isDefault
    }));

    // Đảm bảo có ít nhất 1 đơn vị mặc định
    if (!cleanedUnits.some(unit => unit.isDefault)) {
      cleanedUnits[0].isDefault = true;
    }

    const finalBrand = brand.trim() || 'Không có thương hiệu';
    const finalBarcode = barcode.trim() || `PROD${Date.now()}`;

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
        barcode: finalBarcode,
        units: cleanedUnits // Thêm units vào dữ liệu cập nhật
      })
    );
  };

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

            <Form.Group controlId='price' className='mt-3'>
              <Form.Label>Giá sản phẩm (VNĐ) <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type='number'
                placeholder='Nhập giá sản phẩm'
                value={price}
                onChange={(e) => {
                  const newPrice = Number(e.target.value);
                  setPrice(newPrice);
                  
                  // Cập nhật giá đơn vị theo tỷ lệ khi giá gốc thay đổi
                  const updatedUnits = units.map(unit => {
                    // Nếu là đơn vị cơ bản (ratio = 1) hoặc giá chưa được thiết lập
                    if (unit.ratio === 1 || !unit.price || unit.price === 0) {
                      return {
                        ...unit,
                        price: newPrice / unit.ratio
                      };
                    }
                    return unit;
                  });
                  setUnits(updatedUnits);
                }}
                min="0"
                required
              />
            </Form.Group>

            <Form.Group controlId='image' className='mt-3'>
              <Form.Label>Hình ảnh <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type='text'
                placeholder='Nhập URL hình ảnh'
                value={image}
                onChange={(e) => setImage(e.target.value)}
              />
            </Form.Group>

            <Form.Group controlId='imageFile' className='mt-3'>
              <Form.Label>Upload hình ảnh</Form.Label>
              <Form.Control
                type='file'
                label='Chọn file'
                onChange={uploadFileHandler}
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

            <Row className='mt-3'>
              <Col md={6}>
                <Form.Group controlId='countInStock'>
                  <Form.Label>Số lượng trong kho</Form.Label>
                  <Form.Control
                    type='number'
                    placeholder='Nhập số lượng'
                    value={countInStock}
                    onChange={(e) => setCountInStock(Number(e.target.value))}
                    min="0"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId='barcode'>
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
              </Col>
            </Row>

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

            {/* Đơn vị sản phẩm */}
            <div className="mt-4 border rounded p-3 bg-light">
              <h4>Quản lý đơn vị sản phẩm</h4>
              <p className="text-muted">Thiết lập các đơn vị bán (Thùng, Lốc, Lon,...) và giá tương ứng</p>
              
              <Table striped bordered responsive className="mt-3">
                <thead>
                  <tr>
                    <th>Tên đơn vị</th>
                    <th>Tỷ lệ quy đổi</th>
                    <th>Giá (VNĐ)</th>
                    <th>Mô tả</th>
                    <th style={{ width: '80px' }}>Mặc định</th>
                    <th style={{ width: '80px' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {units.map((unit, index) => (
                    <tr key={index}>
                      <td>
                        <Form.Control
                          size="sm"
                          type="text"
                          value={unit.name}
                          onChange={(e) => updateUnit(index, 'name', e.target.value)}
                          placeholder="VD: Thùng/Lốc/Lon"
                        />
                      </td>
                      <td>
                        <Form.Control
                          size="sm"
                          type="number"
                          value={unit.ratio}
                          onChange={(e) => updateUnit(index, 'ratio', Number(e.target.value))}
                          min="1"
                        />
                      </td>
                      <td>
                        <Form.Control
                          size="sm"
                          type="number"
                          value={unit.price || ''}
                          onChange={(e) => updateUnit(index, 'price', e.target.value ? Number(e.target.value) : '')}
                          placeholder={`≈ ${Math.round(price / unit.ratio).toLocaleString('vi-VN')}`}
                        />
                        {!unit.price && (
                          <small className="text-muted">Tự động: {Math.round(price / unit.ratio).toLocaleString('vi-VN')}đ</small>
                        )}
                      </td>
                      <td>
                        <Form.Control
                          size="sm"
                          type="text"
                          value={unit.description || ''}
                          onChange={(e) => updateUnit(index, 'description', e.target.value)}
                          placeholder="VD: 24 lon x 330ml"
                        />
                      </td>
                      <td className="text-center">
                        <Form.Check
                          type="radio"
                          name="defaultUnit"
                          checked={unit.isDefault}
                          onChange={() => setDefaultUnit(index)}
                        />
                      </td>
                      <td className="text-center">
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => removeUnit(index)}
                          disabled={units.length <= 1}
                        >
                          <i className="fas fa-trash"></i>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              
              <Button variant="outline-primary" onClick={addUnit} className="mt-2">
                <i className="fas fa-plus me-1"></i> Thêm đơn vị
              </Button>
            </div>

            <Button type='submit' variant='primary' className='mt-4 w-100'>
              Cập nhật sản phẩm
            </Button>
          </Form>
        )}
      </FormContainer>
    </>
  );
};

export default ProductEditScreen;