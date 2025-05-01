// src/components/CategoryMenu.js
import React, { useEffect, useState } from 'react'
import { NavDropdown } from 'react-bootstrap'
import { LinkContainer } from 'react-router-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { listCategories } from '../actions/productActions' // Cần thêm action này

const CategoryMenu = () => {
  const dispatch = useDispatch()
  const categoryList = useSelector((state) => state.categoryList)
  const { categories } = categoryList

  useEffect(() => {
    dispatch(listCategories())
  }, [dispatch])

  return (
    <NavDropdown title="Danh mục" id="category">
      <LinkContainer to="/">
        <NavDropdown.Item>Tất cả sản phẩm</NavDropdown.Item>
      </LinkContainer>
      
      {categories.map((category) => (
        <LinkContainer key={category} to={`/category/${category}`}>
          <NavDropdown.Item>{category}</NavDropdown.Item>
        </LinkContainer>
      ))}
    </NavDropdown>
  )
}

export default CategoryMenu