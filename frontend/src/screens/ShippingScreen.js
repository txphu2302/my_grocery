import React, { useEffect, useState } from 'react'
import { Form, Button, Row, Col, Card } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import FormContainer from '../components/FormContainer'
import CheckoutSteps from '../components/CheckoutSteps'
import { saveShippingAddress } from '../actions/cartActions'
import Message from '../components/Message'

const ShippingScreen = () => {
  const cart = useSelector((state) => state.cart)
  const { shippingAddress } = cart

  // Phương thức giao hàng
  const [deliveryMethod, setDeliveryMethod] = useState(
    shippingAddress?.deliveryMethod || 'home'
  )
  
  // Thông tin người nhận
  const [fullName, setFullName] = useState(shippingAddress?.fullName || '')
  const [address, setAddress] = useState(shippingAddress?.address || '')
  const [postalCode, setPostalCode] = useState(shippingAddress?.postalCode || '')
  const [country, setCountry] = useState(shippingAddress?.country || 'Việt Nam')
  const [phoneNumber, setPhoneNumber] = useState(shippingAddress?.phoneNumber || '')
  const [formErrors, setFormErrors] = useState({})

  // Địa lý
  const [provinces, setProvinces] = useState([])
  const [districts, setDistricts] = useState([])
  const [wards, setWards] = useState([])

  const [selectedProvince, setSelectedProvince] = useState(shippingAddress?.selectedProvince || '')
  const [selectedDistrict, setSelectedDistrict] = useState(shippingAddress?.selectedDistrict || '')
  const [selectedWard, setSelectedWard] = useState(shippingAddress?.selectedWard || '')

  // Thông tin cửa hàng
  const storeAddress = {
    name: 'Tạp Hóa An Hà',
    address: '75/3, ĐƯỜNG LÊ NGUYÊN ĐẠT',
    ward: 'Phường Long Bình',
    district: 'Thành phố Biên Hòa',
    province: 'Tỉnh Đồng Nai',
    phone: '0348227858'
  }

  const dispatch = useDispatch()
  const navigate = useNavigate()

  // Load tỉnh
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const { data } = await axios.get('https://provinces.open-api.vn/api/p/')
        setProvinces(data)
      } catch (error) {
        console.error('Error fetching provinces:', error)
      }
    }
    fetchProvinces()
  }, [])

  // Load huyện khi chọn tỉnh
  useEffect(() => {
    if (selectedProvince) {
      const fetchDistricts = async () => {
        try {
          const { data } = await axios.get(`https://provinces.open-api.vn/api/p/${selectedProvince}?depth=2`)
          setDistricts(data.districts)
        } catch (error) {
          console.error('Error fetching districts:', error)
        }
      }
      fetchDistricts()
    } else {
      setDistricts([])
      setWards([])
    }
    if (!shippingAddress?.selectedDistrict) {
      setSelectedDistrict('')
      setSelectedWard('')
    }
  }, [selectedProvince, shippingAddress])

  // Load xã khi chọn huyện
  useEffect(() => {
    if (selectedDistrict) {
      const fetchWards = async () => {
        try {
          const { data } = await axios.get(`https://provinces.open-api.vn/api/d/${selectedDistrict}?depth=2`)
          setWards(data.wards)
        } catch (error) {
          console.error('Error fetching wards:', error)
        }
      }
      fetchWards()
    } else {
      setWards([])
    }
    if (!shippingAddress?.selectedWard) {
      setSelectedWard('')
    }
  }, [selectedDistrict, shippingAddress])

  const getNameById = (arr, id) => {
    const found = arr.find(item => item.code.toString() === id.toString())
    return found ? found.name : ''
  }

  // Kiểm tra form
  const validateForm = () => {
    const errors = {}
    
    if (deliveryMethod === 'home') {
      if (!fullName.trim()) errors.fullName = 'Vui lòng nhập họ tên'
      if (!phoneNumber.trim()) errors.phoneNumber = 'Vui lòng nhập số điện thoại'
      else if (!/^[0-9]{10,11}$/.test(phoneNumber)) 
        errors.phoneNumber = 'Số điện thoại không hợp lệ'
      if (!address.trim()) errors.address = 'Vui lòng nhập địa chỉ'
      if (!selectedProvince) errors.selectedProvince = 'Vui lòng chọn tỉnh/thành phố'
      if (!selectedDistrict) errors.selectedDistrict = 'Vui lòng chọn quận/huyện'
      if (!selectedWard) errors.selectedWard = 'Vui lòng chọn phường/xã'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const submitHandler = (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    if (deliveryMethod === 'store') {
      // Nhận tại cửa hàng - lưu thông tin cửa hàng
      dispatch(
        saveShippingAddress({
          deliveryMethod: 'store',
          fullName: storeAddress.name,
          address: storeAddress.address,
          city: `${storeAddress.ward}, ${storeAddress.district}, ${storeAddress.province}`,
          postalCode: '',
          country: 'Việt Nam',
          phoneNumber: storeAddress.phone,
          isStorePickup: true
        })
      )
    } else {
      // Giao hàng tận nhà - lưu thông tin người nhận
      const provinceName = getNameById(provinces, selectedProvince)
      const districtName = getNameById(districts, selectedDistrict)
      const fullCity = `${selectedWard}, ${districtName}, ${provinceName}`
      
      dispatch(
        saveShippingAddress({
          deliveryMethod: 'home',
          fullName,
          address,
          city: fullCity,
          postalCode,
          country,
          phoneNumber,
          selectedProvince,
          selectedDistrict,
          selectedWard,
          isStorePickup: false
        })
      )
    }
    
    navigate('/payment')
  }

  return (
    <FormContainer>
      <CheckoutSteps step1 step2 />
      <h1>Thông tin giao hàng</h1>
      
      {/* Phương thức nhận hàng */}
      <Form onSubmit={submitHandler}>
        <Form.Group className="mb-4">
          <Form.Label as="legend" className="mb-3">
            Chọn phương thức nhận hàng
          </Form.Label>
          <Row>
            <Col xs={12} md={6}>
              <Card 
                className={`mb-3 delivery-option ${deliveryMethod === 'store' ? 'border-primary' : ''}`}
                style={{cursor: 'pointer'}}
                onClick={() => setDeliveryMethod('store')}
              >
                <Card.Body>
                  <Form.Check
                    type="radio"
                    label="Nhận tại cửa hàng"
                    id="pickup-store"
                    name="deliveryMethod"
                    value="store"
                    checked={deliveryMethod === 'store'}
                    onChange={() => setDeliveryMethod('store')}
                    className="mb-2"
                  />
                  <div className="mt-2">
                    <small className="text-muted d-block">
                      <i className="fas fa-map-marker-alt me-1"></i> {storeAddress.address}
                    </small>
                    <small className="text-muted d-block">
                      <i className="fas fa-phone me-1"></i> {storeAddress.phone}
                    </small>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} md={6}>
              <Card 
                className={`mb-3 delivery-option ${deliveryMethod === 'home' ? 'border-primary' : ''}`}
                style={{cursor: 'pointer'}}
                onClick={() => setDeliveryMethod('home')}
              >
                <Card.Body>
                  <Form.Check
                    type="radio"
                    label="Giao hàng tận nhà"
                    id="delivery-home"
                    name="deliveryMethod"
                    value="home"
                    checked={deliveryMethod === 'home'}
                    onChange={() => setDeliveryMethod('home')}
                    className="mb-2"
                  />
                  <div className="mt-2">
                    <small className="text-muted">
                      Nhập thông tin địa chỉ giao hàng
                    </small>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Form.Group>
        
        {deliveryMethod === 'store' && (
          <div className="mb-4">
            <Message variant="info">
              <p className="mb-0"><strong>Thông tin cửa hàng:</strong></p>
              <p className="mb-0">{storeAddress.name}</p>
              <p className="mb-0">Địa chỉ: {storeAddress.address}, {storeAddress.ward}, {storeAddress.district}, {storeAddress.province}</p>
              <p className="mb-0">SĐT: {storeAddress.phone}</p>
              <small>Quý khách vui lòng mang theo CMND/CCCD khi đến nhận hàng</small>
            </Message>
          </div>
        )}

        {/* Form điền thông tin giao hàng */}
        {deliveryMethod === 'home' && (
          <>
            <Form.Group controlId='fullName' className='mb-3'>
              <Form.Label>Họ và tên <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type='text'
                placeholder='Nhập họ và tên người nhận'
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                isInvalid={!!formErrors.fullName}
                required
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.fullName}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group controlId='phoneNumber' className='mb-3'>
              <Form.Label>Số điện thoại <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type='text'
                placeholder='Nhập số điện thoại'
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                isInvalid={!!formErrors.phoneNumber}
                required
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.phoneNumber}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group controlId='province' className='mb-3'>
              <Form.Label>Tỉnh/Thành phố <span className="text-danger">*</span></Form.Label>
              <Form.Select
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
                isInvalid={!!formErrors.selectedProvince}
                required
              >
                <option value=''>Chọn tỉnh/thành</option>
                {provinces.map((p) => (
                  <option key={p.code} value={p.code}>{p.name}</option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {formErrors.selectedProvince}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group controlId='district' className='mb-3'>
              <Form.Label>Quận/Huyện <span className="text-danger">*</span></Form.Label>
              <Form.Select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                disabled={!districts.length}
                isInvalid={!!formErrors.selectedDistrict}
                required
              >
                <option value=''>Chọn quận/huyện</option>
                {districts.map((d) => (
                  <option key={d.code} value={d.code}>{d.name}</option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {formErrors.selectedDistrict}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group controlId='ward' className='mb-3'>
              <Form.Label>Phường/Xã <span className="text-danger">*</span></Form.Label>
              <Form.Select
                value={selectedWard}
                onChange={(e) => setSelectedWard(e.target.value)}
                disabled={!wards.length}
                isInvalid={!!formErrors.selectedWard}
                required
              >
                <option value=''>Chọn phường/xã</option>
                {wards.map((w) => (
                  <option key={w.code} value={w.name}>{w.name}</option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {formErrors.selectedWard}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group controlId='address' className='mb-3'>
              <Form.Label>Địa chỉ chi tiết <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type='text'
                placeholder='Nhập số nhà, tên đường'
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                isInvalid={!!formErrors.address}
                required
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.address}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group controlId='postalCode' className='mb-3'>
              <Form.Label>Mã bưu điện</Form.Label>
              <Form.Control
                type='text'
                placeholder='Nhập mã bưu điện (không bắt buộc)'
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
              />
            </Form.Group>
          </>
        )}

        <Button type='submit' variant='primary' className='mt-2 w-100'>
          Tiếp tục
        </Button>
      </Form>
    </FormContainer>
  )
}

export default ShippingScreen