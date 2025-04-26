import React, { useRef } from 'react'
import { Button } from 'react-bootstrap'

// Định nghĩa styles trực tiếp trong component
const styles = {
  receipt: {
    fontFamily: 'monospace',
    width: '58mm',
    padding: '3mm',
    backgroundColor: 'white',
  },
  header: {
    textAlign: 'center',
    marginBottom: '10px',
  },
  title: {
    fontSize: '14px',
    margin: '5px 0',
    fontWeight: 'bold',
  },
  text: {
    fontSize: '12px',
    margin: '5px 0',
  },
  divider: {
    borderTop: '1px dashed #000',
    margin: '8px 0',
  },
  table: {
    width: '100%',
    fontSize: '12px',
    borderCollapse: 'collapse',
  },
  tableCell: {
    padding: '3px 0',
  },
  total: {
    fontWeight: 'bold',
    marginTop: '5px',
  },
  footer: {
    marginTop: '10px',
    textAlign: 'center',
    fontSize: '12px',
  },
}

const Receipt = ({ order }) => {
  const printRef = useRef()

  const handlePrint = () => {
    const content = printRef.current
    const windowPrint = window.open('', '', 'width=500,height=700')
    
    windowPrint.document.write('<html><head><title>Hóa Đơn</title>')
    windowPrint.document.write('<style>')
    windowPrint.document.write(`
      body { 
        font-family: monospace; 
        width: 58mm; 
        margin: 0; 
        padding: 0 3mm;
      }
      .receipt-header { text-align: center; margin-bottom: 10px; }
      .receipt-header h2, h3 { font-size: 14px; margin: 5px 0; font-weight: bold; }
      .receipt-header p { font-size: 12px; margin: 5px 0; }
      .receipt-items { width: 100%; font-size: 12px; border-collapse: collapse; }
      .receipt-items td, .receipt-items th { padding: 3px 0; }
      .receipt-footer { margin-top: 10px; text-align: center; font-size: 12px; }
      .receipt-total { font-weight: bold; border-top: 1px dashed #000; padding-top: 5px; }
      .divider { border-top: 1px dashed #000; margin: 8px 0; }
      .product-name { font-size: 12px; }
      .unit-info { font-size: 10px; color: #555; }
      @page { margin: 0; size: 58mm 100%; }
    `)
    windowPrint.document.write('</style></head><body>')
    windowPrint.document.write(content.innerHTML)
    windowPrint.document.write('</body></html>')
    
    windowPrint.document.close()
    windowPrint.focus()
    
    // Chờ nội dung tải xong rồi in
    setTimeout(() => {
      windowPrint.print()
      setTimeout(() => {
        windowPrint.close()
      }, 100)
    }, 250)
  }

  const formatDate = (date) => {
    if (!date) return 'N/A'
    try {
      return new Date(date).toLocaleString('vi-VN')
    } catch (e) {
      return 'Invalid Date'
    }
  }

  const formatPrice = (price) => {
    if (!price && price !== 0) return '0'
    return price.toLocaleString('vi-VN')
  }

  // Kiểm tra dữ liệu trước khi render
  if (!order) {
    return <div>Đang tải dữ liệu đơn hàng...</div>
  }

  if (!order.orderItems || order.orderItems.length === 0) {
    return <div>Không có sản phẩm để in.</div>
  }

  return (
    <>
      <Button
        variant="info"
        onClick={handlePrint}
        className="mb-3 w-100"
      >
        <i className="fas fa-print me-2"></i> In hóa đơn
      </Button>
      
      <div style={{ display: 'none' }}>
        <div ref={printRef}>
          <div className="receipt-header">
            <h2>TẠP HÓA AN HÀ</h2>
            <p>Địa chỉ: 75/3, ĐƯỜNG LÊ NGUYÊN ĐẠT</p>
            <p>SĐT: 0348227858</p>
            <div className="divider"></div>
            <h3>HÓA ĐƠN BÁN HÀNG</h3>
            <p>Mã đơn: {order._id}</p>
            <p>Ngày: {formatDate(order.createdAt)}</p>
            <p>Khách hàng: {order.user?.name || 'Khách lẻ'}</p>
            <div className="divider"></div>
          </div>
          
          <table className="receipt-items">
            <thead>
              <tr>
                <th align="left">Sản phẩm</th>
                <th align="right">SL</th>
                <th align="right">Giá</th>
                <th align="right">T.Tiền</th>
              </tr>
            </thead>
            <tbody>
              {order.orderItems.map((item, index) => (
                <tr key={index}>
                  <td align="left">
                    <div className="product-name">{item.name}</div>
                    {item.unit && item.unit.name !== 'Sản phẩm' && (
                      <div className="unit-info">
                        {item.unit.name}
                        {item.unit.description && ` (${item.unit.description})`}
                      </div>
                    )}
                  </td>
                  <td align="right">{item.qty}</td>
                  <td align="right">
                    {formatPrice(item.price)}đ
                    {item.unit && item.unit.name !== 'Sản phẩm' && (
                      <div className="unit-info">/{item.unit.name}</div>
                    )}
                  </td>
                  <td align="right">{formatPrice(item.qty * (item.price || 0))}đ</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="divider"></div>
          
          <div className="receipt-total">
            <p>Tổng tiền: {formatPrice(order.totalPrice)}đ</p>
            <p>Phương thức: {order.paymentMethod}</p>
            <p>Trạng thái: {order.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}</p>
          </div>
          
          <div className="receipt-footer">
            <p>Cảm ơn quý khách đã mua hàng!</p>
            <p>Hẹn gặp lại!</p>
          </div>
        </div>
      </div>
    </>
  )
}

export default Receipt