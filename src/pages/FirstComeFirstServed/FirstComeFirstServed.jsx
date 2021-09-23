import './FirstComeFirstServed.css'
import styled from 'styled-components'

import { ProgressBar, Fieldset, TextArea, TaskBar, List, Button } from '@react95/core'
import { Notepad, BatWait, BatExec2, Qfecheck111, RecycleEmpty, User2 } from '@react95/icons'
import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'

import Window from '../../components/Window'
import { INTERRUPTIONS, generateProcesses, Process } from '../../utils'

const Container = styled.div`
  margin: auto;
  padding: 10px;
  display: block;
  width: 60%;
`

const FirstComeFirstServed = ({ totalProcesses, processingDone }) => {
  const [globalTime, setGlobalTime] = useState(0)
  const [actionLogs, setActionLogs] = useState('')
  const [newProcesses, setNewProcesses] = useState([])
  const [readyProcesses, setReadyProcesses] = useState([])
  const [processInExecution, setProcessInExecution] = useState()
  const [blockedProcesses, setBlockedProcesses] = useState([])
  const [terminatedProcesses, setTerminatedProcesses] = useState([])
  const [isPaused, setIsPaused] = useState(false)
  const [isProcessing, setIsProcessing] = useState(true)
  const [lastKeyDown, setLastKeyDown] = useState(new Date())
  const [reportLogged, setReportLogged] = useState(false)

  const MAX_PROCESSES_ON_MEMORY = 4

  onkeydown = ({ key }) => {
    key = key.toLowerCase()
    let operationWasPerformed = false
    const now = new Date()
    setLastKeyDown(now)

    if ((now - lastKeyDown) < 1000) {
      setActionLogs(actionLogs + `[${now.toLocaleTimeString()}, Global Time: ${globalTime} seconds] - Actions are limited to 1 per second\n`)
      return
    }

    if (INTERRUPTIONS?.[key]) {
      switch (key) {
        case 'e':
          if (isPaused === false && processInExecution instanceof Process) {
            processInExecution.block()
            blockedProcesses.push(processInExecution)
            const nextProc = readyProcesses.shift()
            if (nextProc.startTime === -1) {
              nextProc.startTime = globalTime
            }
            setProcessInExecution(nextProc)
            operationWasPerformed = true
          }
          break
        case 'w':
          if (isPaused === false && processInExecution instanceof Process) {
            processInExecution.throwError()
            operationWasPerformed = true
          }
          break
        case 'p':
          if (isPaused === false) {
            setIsPaused(true)
            operationWasPerformed = true
          }
          break
        case 'c':
          if (isPaused === true) {
            setIsPaused(false)
            operationWasPerformed = true
          }
          break
        default:
          console.log(`Not implemented action triggered with ${key}`)
      }

      if (operationWasPerformed === true) {
        setActionLogs(actionLogs + `[${new Date().toLocaleTimeString()}, Global Time: ${globalTime} seconds] - ${INTERRUPTIONS[key].description}\n`)
      }
    }
  }

  useEffect(() => {
    const newProcs = generateProcesses(totalProcesses)
    const readyProcs = []

    const procToExecute = newProcs.shift()
    procToExecute.arrivalTime = 0
    procToExecute.startTime = 0

    const totalReadyProcesses = Math.min(newProcs.length, MAX_PROCESSES_ON_MEMORY - 1)
    for (let i = 0; i < totalReadyProcesses; ++i) {
      const process = newProcs.shift()
      process.arrivalTime = 0
      readyProcs.push(process)
    }
    setNewProcesses(newProcs)
    setReadyProcesses(readyProcs)
    setProcessInExecution(procToExecute)
  }, [totalProcesses])

  const updateBlockedProcesses = () => {
    let procsToUnblock = 0
    blockedProcesses.forEach((process) => {
      if (process.timeToUnblock === 0) {
        ++procsToUnblock
      } else {
        process.update()
      }
    })

    for (let i = 0; i < procsToUnblock; ++i) {
      readyProcesses.push(blockedProcesses.shift())
    }
  }

  useEffect(() => {
    if (isProcessing === false && reportLogged === false) {
      let report = `[${new Date().toLocaleTimeString()}, Global Time: ${globalTime} seconds] - All process were terminated, generating report...\n--------------------\n`
      terminatedProcesses.forEach(proc => {
        report += proc.log() + '\n'
      })
      report += '--------------------\n'

      setActionLogs(actionLogs + report)
      setReportLogged(true)
      setProcessInExecution(null)
    }

    setTimeout(() => {
      if (isPaused === false && isProcessing === true) {
        updateBlockedProcesses()

        if (processInExecution instanceof Process) {
          if (processInExecution.isTerminated()) {
            // Push to terminated
            processInExecution.endTime = globalTime
            terminatedProcesses.push(processInExecution)

            // Add a new process if there is one and define the next process to execute
            if (newProcesses.length > 0 || readyProcesses.length > 0) {
              if (newProcesses.length > 0) {
                const process = newProcesses.shift()
                if (process.arrivalTime === -1) {
                  process.arrivalTime = globalTime
                }
                readyProcesses.push(process)
              }

              const nextProc = readyProcesses.shift()
              if (nextProc.startTime === -1) {
                nextProc.startTime = globalTime
              }
              setProcessInExecution(nextProc)
            } else {
              // If all process are terminated, end simulation
              if (terminatedProcesses.length >= totalProcesses) {
                setIsProcessing(false)
                return
              }
            }
          } else {
            if (processInExecution.timeToUnblock === 0) {
              processInExecution.update()
            }
          }
        } else {
          // If there is no process in execution, check if one is ready
          if (readyProcesses.length > 0) {
            const nextProc = readyProcesses.shift()
            if (nextProc.startTime === -1) {
              nextProc.startTime = globalTime
            }
            setProcessInExecution(nextProc)
          }
        }
        setGlobalTime(globalTime + 1)
      }
    }, 1000)
  }, [reportLogged, setGlobalTime, globalTime, setIsPaused, isPaused, isProcessing, processInExecution, terminatedProcesses, newProcesses, readyProcesses, blockedProcesses, setBlockedProcesses, setTerminatedProcesses])

  return (
    <>
      <Container>
        <div style={{ textAlign: 'center' }}>
          <h1>New processes: {newProcesses.length}</h1>
          <h2>Global Time: {globalTime} seconds</h2>
          {
            !isProcessing ? <Button onClick={processingDone}>Return</Button> : <></>
          }
        </div>
        <br />
        <Window title='ready - Process Simulation' icon={<BatWait variant='32x32_4' />}>
          {
            readyProcesses.map((process, index) => (
              <Fieldset key={index} legend={`PID ${process.id}`} style={{ width: '90%', textAlign: 'left', marginBottom: 10 }}>
                <p key={index + '_p'}>Estimated execution time: {process.maxTime} seconds - Ellapsed time: {process.executionTime} seconds</p>
              </Fieldset>)
            )
          }
        </Window>
        <Window title='execution - Process Simulation' icon={<BatExec2 variant='32x32_4' />}>
          {
            processInExecution instanceof Process
              ? (
                <Fieldset legend={`PID ${processInExecution.id}`} className='process-fieldset'>
                  <p>Operation: {processInExecution.operation}</p>
                  <p>Estimated execution time: {processInExecution.maxTime} seconds</p>
                  <p>Ellapsed time: {processInExecution.executionTime} seconds</p>
                  <p>Missing time: {processInExecution.maxTime - processInExecution.executionTime} seconds</p>
                  <ProgressBar width={200} percent={Math.round(processInExecution.executionTime / processInExecution.maxTime * 100)} />
                </Fieldset>
                )
              : (<></>)
          }
        </Window>
        <Window title='blocked - Process Simulation' icon={<User2 variant='32x32_4' />}>
          {
            Array.isArray(blockedProcesses)
              ? blockedProcesses.map((process, index) => (
                <Fieldset key={index} legend={`PID ${process.id}`} style={{ width: '90%', textAlign: 'left', marginBottom: 10 }}>
                  <p key={index + '_p'}>Estimated execution time: {process.maxTime} seconds - Blocked time: {7 - process.timeToUnblock} seconds</p>
                </Fieldset>)
              )
              : (<></>)
          }
        </Window>
        <Window title='terminated - Process Simulation' icon={<Qfecheck111 variant='32x32_4' />}>
          {
            Array.isArray(terminatedProcesses)
              ? terminatedProcesses.map(process => (
                <Fieldset key={process.id} legend={`PID ${process.id}`} className='process-fieldset'>
                  <p key={process.id + '_p'}>{process.operation} = {process.result}</p>
                </Fieldset>)
              )
              : (<></>)
          }
        </Window>
        <Window title='logs.txt - Notepad' icon={<Notepad variant='32x32_4' />}>
          <TextArea readOnly value={actionLogs} style={{ width: '100%', height: 200 }} />
          <br /><br />
          <Button onClick={() => { setActionLogs('') }}>Clear logs</Button>
        </Window><br />
      </Container>
      <TaskBar
        list={
          <List>
            <List.Item
              key='reset'
              icon={<RecycleEmpty variant='32x32_4' />}
              onClick={() => {
                setIsProcessing(false)
                processingDone()
              }}
            >
              Empty and Restart
            </List.Item>
          </List>
        }
      />
    </>
  )
}

FirstComeFirstServed.propTypes = {
  totalProcesses: PropTypes.number,
  processingDone: PropTypes.func
}

export default FirstComeFirstServed
