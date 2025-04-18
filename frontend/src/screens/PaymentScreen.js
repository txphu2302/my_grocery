import React, { useState, useEffect } from 'react'
import { Form, Button, Col } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import FormContainer from '../components/FormContainer'
import CheckoutSteps from '../components/CheckoutSteps'
import { savePaymentMethod } from '../actions/cartActions'

const PaymentScreen = () => {
  const cart = useSelector((state) => state.cart)
  const { shippingAddress } = cart

  const navigate = useNavigate()
  const dispatch = useDispatch()

  // Redirect to shipping if shipping address is not entered
  useEffect(() => {
    if (!shippingAddress || !shippingAddress.address) {
      navigate('/shipping')
    }
  }, [navigate, shippingAddress])

  const [paymentMethod, setPaymentMethod] = useState('PayPal')

  const submitHandler = (e) => {
    e.preventDefault()
    dispatch(savePaymentMethod(paymentMethod))
    navigate('/placeorder')
  }

  return (
    <FormContainer>
      <CheckoutSteps step1 step2 step3 />
      <h1>Phương thức thanh toán</h1>
      <Form onSubmit={submitHandler}>
        <Form.Group>
          <Form.Label as='legend'>Chọn phương thức</Form.Label>
          <Col>
            <Form.Check
              type='radio'
              label='PayPal hoặc Thẻ tín dụng'
              id='PayPal'
              name='paymentMethod'
              value='PayPal'
              checked={paymentMethod === 'PayPal'}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className='mb-2'
            ></Form.Check>
            
            <Form.Check
              type='radio'
              label='Thanh toán khi nhận hàng (COD)'
              id='COD'
              name='paymentMethod'
              value='COD'
              checked={paymentMethod === 'COD'}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className='mb-2'
            ></Form.Check>
            
            <Form.Check
              type='radio'
              label='Chuyển khoản ngân hàng'
              id='BankTransfer'
              name='paymentMethod'
              value='BankTransfer'
              checked={paymentMethod === 'BankTransfer'}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className='mb-2'
            ></Form.Check>
            
            <Form.Check
              type='radio'
              label='Ví điện tử (MoMo, ZaloPay, VNPay)'
              id='EWallet'
              name='paymentMethod'
              value='EWallet'
              checked={paymentMethod === 'EWallet'}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className='mb-2'
            ></Form.Check>
          </Col>
        </Form.Group>

        <Button type='submit' variant='primary' className='mt-3'>
          Tiếp tục
        </Button>
      </Form>
    </FormContainer>
  )
}

export default PaymentScreen