// src/components/Meta.js
import React from 'react'
import { Helmet } from 'react-helmet-async'  // Updated import

const Meta = ({ title, description, keywords }) => {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name='description' content={description} />
      <meta name='keyword' content={keywords} />
    </Helmet>
  )
}

Meta.defaultProps = {
  title: 'Chào mừng đến với Shop',
  description: 'Chúng tôi bán những sản phẩm tốt nhất với giá cả phải chăng',
  keywords: 'mua sắm, giá rẻ, hàng chính hãng',
}

export default Meta