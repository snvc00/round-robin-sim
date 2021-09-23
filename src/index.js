import React from 'react'
import ReactDOM from 'react-dom'
import { ThemeProvider, GlobalStyle } from '@react95/core'

import './index.css'
import App from './App'

ReactDOM.render(
  <ThemeProvider>
    <GlobalStyle />
      <App />
  </ThemeProvider>,
  document.getElementById('root')
)
