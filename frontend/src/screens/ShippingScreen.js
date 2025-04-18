import React, { useState } from 'react'
import { Form, Button } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import FormContainer from '../components/FormContainer'
import CheckoutSteps from '../components/CheckoutSteps'
import { saveShippingAddress } from '../actions/cartActions'

const ShippingScreen = () => {
  const cart = useSelector((state) => state.cart)
  const { shippingAddress } = cart

  const [address, setAddress] = useState(shippingAddress?.address || '')
  const [city, setCity] = useState(shippingAddress?.city || '')
  const [postalCode, setPostalCode] = useState(shippingAddress?.postalCode || '')
  const [country, setCountry] = useState(shippingAddress?.country || '')
  const [phoneNumber, setPhoneNumber] = useState(shippingAddress?.phoneNumber || '')

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const submitHandler = (e) => {
    e.preventDefault()
    dispatch(saveShippingAddress({ address, city, postalCode, country, phoneNumber }))
    navigate('/payment')
  }

  return (
    <FormContainer>
      <CheckoutSteps step1 step2 />
      <h1>Thông tin giao hàng</h1>
      <Form onSubmit={submitHandler}>
        <Form.Group controlId='address' className='mb-3'>
          <Form.Label>Địa chỉ</Form.Label>
          <Form.Control
            type='text'
            placeholder='Nhập địa chỉ'
            value={address}
            required
            onChange={(e) => setAddress(e.target.value)}
          ></Form.Control>
        </Form.Group>

        <Form.Group controlId='city' className='mb-3'>
          <Form.Label>Thành phố</Form.Label>
          <Form.Control
            type='text'
            placeholder='Nhập thành phố'
            value={city}
            required
            onChange={(e) => setCity(e.target.value)}
          ></Form.Control>
        </Form.Group>

        <Form.Group controlId='postalCode' className='mb-3'>
          <Form.Label>Mã bưu điện</Form.Label>
          <Form.Control
            type='text'
            placeholder='Nhập mã bưu điện'
            value={postalCode}
            required
            onChange={(e) => setPostalCode(e.target.value)}
          ></Form.Control>
        </Form.Group>

        <Form.Group controlId='country' className='mb-3'>
          <Form.Label>Quốc gia</Form.Label>
          <Form.Control
            type='text'
            placeholder='Nhập quốc gia'
            value={country}
            required
            onChange={(e) => setCountry(e.target.value)}
          ></Form.Control>
        </Form.Group>
        
        <Form.Group controlId='phoneNumber' className='mb-3'>
          <Form.Label>Số điện thoại</Form.Label>
          <Form.Control
            type='text'
            placeholder='Nhập số điện thoại'
            value={phoneNumber}
            required
            onChange={(e) => setPhoneNumber(e.target.value)}
          ></Form.Control>
        </Form.Group>

        <Button type='submit' variant='primary' className='mt-2'>
          Tiếp tục
        </Button>
      </Form>
    </FormContainer>
  )
}

export default ShippingScreen