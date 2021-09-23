import { TitleBar, Frame } from '@react95/core'
import PropTypes from 'prop-types'
import React from 'react'

const Window = ({ children, title, icon }) => {
  return (
    <Frame boxShadow='out' marginBottom='10px'>
      <TitleBar
        active
        icon={icon}
        title={title}
        width='100%'
      >
        <TitleBar.OptionsBox>
          <TitleBar.Option>X</TitleBar.Option>
        </TitleBar.OptionsBox>
      </TitleBar>
      <div style={{ minHeight: 200, padding: 10 }}>
        {children}
      </div>
    </Frame>
  )
}

Window.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.array
  ]),
  title: PropTypes.string,
  icon: PropTypes.object
}

export default Window
