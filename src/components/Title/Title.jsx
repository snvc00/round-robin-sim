import './Title.css'
import PropTypes from 'prop-types'
import React from 'react'

const Title = ({ children }) => {
  return (
    <h1 className='title'>{children}</h1>
  )
}

Title.propTypes = {
  children: PropTypes.string
}

export default Title
