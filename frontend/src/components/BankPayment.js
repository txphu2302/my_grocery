import React, { useState } from 'react'
import { Row, Col, Card, Button, Image, Tab, Tabs } from 'react-bootstrap'

const BankPayment = ({ order }) => {
  const [activeTab, setActiveTab] = useState('dynamic')
  const [copiedText, setCopiedText] = useState('')
  
  // Bank account information
  const bankInfo = {
    bankName: 'TECHCOMBANK',
    accountName: 'NGUYEN THI VINH',     
    accountNumber: 'MS00P00000000637245'
  }

  // Format the payment amount
  const amount = parseInt(order.totalPrice).toLocaleString('vi-VN')
  
  // Create payment reference code
  const referenceCode = `HD${order._id.slice(-6)}`

  // VietQR URL to fetch the dynamic QR code image
  const BANK_ID = 'TCB'; // Techcombank abbreviation for VietQR
  const TEMPLATE = 'print'; // QR code template (print or compact)
  const dynamicQrImageUrl = `https://img.vietqr.io/image/${BANK_ID}-${bankInfo.accountNumber}-${TEMPLATE}.png?amount=${order.totalPrice}&addInfo=${encodeURIComponent(referenceCode)}&accountName=${encodeURIComponent(bankInfo.accountName)}`;
  
  // Path to static QR image
  const staticQrImagePath = '/images/qr-payment.png'
  
  // QR code size - increased for better visibility
  const qrSize = 300

  // Function to copy text to clipboard with feedback
  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text)
    setCopiedText(type)
    setTimeout(() => setCopiedText(''), 2000)
  }

  return (
    <Card className="mt-4 mb-4 border-primary">
      <Card.Header className="bg-primary text-white d-flex align-items-center">
        <i className="fas fa-university me-2 fs-5"></i>
        <h4 className="mb-0">Thanh toán chuyển khoản ngân hàng</h4>
      </Card.Header>
      <Card.Body>
        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k)}
          className="mb-4"
          fill
        >
          <Tab eventKey="dynamic" title={<span><i className="fas fa-qrcode me-2"></i>Mã QR tự động</span>}>
            <Row className="mt-3">
              <Col md={6}>
                <div className="card border-light bg-light mb-4">
                  <div className="card-body">
                    <h5 className="card-title mb-3 text-primary">
                      <i className="fas fa-info-circle me-2"></i>
                      Thông tin chuyển khoản
                    </h5>
                    <table className="table table-borderless mb-0">
                      <tbody>
                        <tr>
                          <td><strong>Ngân hàng:</strong></td>
                          <td>{bankInfo.bankName}</td>
                        </tr>
                        <tr>
                          <td><strong>Tên TK:</strong></td>
                          <td>{bankInfo.accountName}</td>
                        </tr>
                        <tr>
                          <td><strong>Số TK:</strong></td>
                          <td>
                            {bankInfo.accountNumber}
                            <Button 
                              variant="outline-primary" 
                              size="sm" 
                              className="ms-2"
                              onClick={() => copyToClipboard(bankInfo.accountNumber, 'stk')}
                            >
                              {copiedText === 'stk' ? 'Đã sao chép!' : <i className="fas fa-copy"></i>}
                            </Button>
                          </td>
                        </tr>
                        <tr>
                          <td><strong>Số tiền:</strong></td>
                          <td>
                            <span className="text-danger fw-bold">{amount}đ</span>
                            <Button 
                              variant="outline-primary" 
                              size="sm" 
                              className="ms-2"
                              onClick={() => copyToClipboard(order.totalPrice, 'amount')}
                            >
                              {copiedText === 'amount' ? 'Đã sao chép!' : <i className="fas fa-copy"></i>}
                            </Button>
                          </td>
                        </tr>
                        <tr>
                          <td><strong>Nội dung CK:</strong></td>
                          <td>
                            {referenceCode}
                            <Button 
                              variant="outline-primary" 
                              size="sm" 
                              className="ms-2"
                              onClick={() => copyToClipboard(referenceCode, 'ref')}
                            >
                              {copiedText === 'ref' ? 'Đã sao chép!' : <i className="fas fa-copy"></i>}
                            </Button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </Col>
              <Col md={6} className="text-center">
                <h5 className="mb-3 text-primary">Quét mã QR để thanh toán</h5>
                <div className="mb-3 p-4 bg-white d-inline-block border rounded shadow-sm">
                  <Image
                    src={dynamicQrImageUrl}
                    alt="Mã QR thanh toán động"
                    width={qrSize}
                    height={qrSize}
                    className="img-fluid"
                  />
                </div>
                <div className="mt-2 mb-3">
                  <span className="badge bg-success">
                    <i className="fas fa-check-circle me-1"></i>
                    Đã bao gồm số tiền {amount}đ
                  </span>
                </div>
                <p className="text-muted small">
                  <i className="fas fa-info-circle me-1"></i>
                  Sử dụng ứng dụng ngân hàng để quét mã QR. Mã này đã bao gồm số tiền và mã đơn hàng.
                </p>
              </Col>
            </Row>
          </Tab>
          <Tab eventKey="static" title={<span><i className="fas fa-store me-2"></i>Mã QR cửa hàng</span>}>
            <Row className="mt-3">
              <Col md={6}>
                <h5 className="mb-3 text-primary">
                  <i className="fas fa-file-invoice me-2"></i>
                  Hướng dẫn thanh toán
                </h5>
                <div className="card border-light bg-light mb-4">
                  <div className="card-body">
                    <h6 className="text-primary mb-3">Thực hiện theo các bước sau:</h6>
                    <ol className="mb-0">
                      <li className="mb-3">Mở ứng dụng ngân hàng và quét mã QR</li>
                      <li className="mb-3">
                        <strong>Nhập số tiền:</strong>{' '}
                        <span className="text-danger fw-bold">{amount}đ</span>
                        <Button 
                          variant="outline-primary" 
                          size="sm" 
                          className="ms-2"
                          onClick={() => copyToClipboard(order.totalPrice, 'amount2')}
                        >
                          {copiedText === 'amount2' ? 'Đã sao chép!' : <i className="fas fa-copy"></i>}
                        </Button>
                      </li>
                      <li className="mb-3">
                        <strong>Nhập nội dung chuyển khoản:</strong>{' '}
                        {referenceCode}
                        <Button 
                          variant="outline-primary" 
                          size="sm" 
                          className="ms-2"
                          onClick={() => copyToClipboard(referenceCode, 'ref2')}
                        >
                          {copiedText === 'ref2' ? 'Đã sao chép!' : <i className="fas fa-copy"></i>}
                        </Button>
                      </li>
                      <li>Xác nhận và hoàn tất thanh toán</li>
                    </ol>
                  </div>
                </div>
                <div className="alert alert-warning">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  Vui lòng nhập <strong>chính xác</strong> số tiền và nội dung chuyển khoản để đơn hàng được xử lý nhanh nhất.
                </div>
              </Col>
              <Col md={6} className="text-center">
                <h5 className="mb-3 text-primary">Mã QR Cửa hàng</h5>
                <div className="mb-3 p-4 bg-white d-inline-block border rounded shadow-sm">
                  <Image
                    src={staticQrImagePath}
                    alt="Mã QR thanh toán"
                    width={qrSize}
                    height={qrSize}
                    className="img-fluid"
                  />
                </div>
                <div className="mt-2 mb-3">
                  <span className="badge bg-warning text-dark">
                    <i className="fas fa-exclamation-circle me-1"></i>
                    Cần nhập số tiền: {amount}đ
                  </span>
                </div>
                <p className="text-muted small">
                  <i className="fas fa-info-circle me-1"></i>
                  Đây là mã QR thanh toán cố định của cửa hàng.
                  Khi quét, bạn <strong>cần tự nhập</strong> số tiền và nội dung chuyển khoản.
                </p>
              </Col>
            </Row>
          </Tab>
        </Tabs>
        
        <div className="alert alert-primary mt-4">
          <div className="d-flex">
            <div className="me-3 fs-4">
              <i className="fas fa-info-circle"></i>
            </div>
            <div>
              <h5 className="alert-heading">Thông tin thanh toán</h5>
              <p className="mb-0">
                Sau khi chuyển khoản thành công, đơn hàng của bạn sẽ được xử lý trong vòng 24 giờ.
                Chúng tôi sẽ liên hệ xác nhận khi nhận được thanh toán.
              </p>
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  )
}

export default BankPayment