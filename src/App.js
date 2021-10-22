import styled from 'styled-components'

import { Button, Input } from '@react95/core'
import React, { useState } from 'react'

import Title from './components/Title'
import RoundRobin from './pages/RoundRobin'

const Form = styled.form`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
`

function App () {
  const [totalProcesses, setTotalProcesses] = useState(0)
  const [quantum, setQuantum] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)

  const startProcessing = e => {
    e.preventDefault()
    setIsProcessing(true)
  }

  const processingDone = () => {
    setIsProcessing(false)
  }

  return (
    isProcessing === false
      ? (
          <Form onSubmit={startProcessing}>
            <Title>Round Robin</Title>
            <Input
              placeholder='# of processes'
              style={{ marginBottom: 10 }}
              type='number'
              min='1'
              onChange={({ target }) => setTotalProcesses(target.value)}
              required
            />
            <br />
            <Input
              placeholder='Quantum'
              style={{ marginBottom: 10 }}
              type='number'
              min='1'
              onChange={({ target }) => setQuantum(target.value)}
              required
            />
            <br />
            <Button>Start</Button>
          </Form>
        )
      : (<RoundRobin totalProcesses={parseInt(totalProcesses)} processingDone={processingDone} quantum={parseInt(quantum)} />)
  )
}

export default App
