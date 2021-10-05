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
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [simulationEnd, setSimulationEnd] = useState(null)
  const [nextId, setNextId] = useState(totalProcesses)

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
            if (nextProc instanceof Process) {
              if (nextProc.startTime === -1) {
                nextProc.startTime = globalTime
              }
              setProcessInExecution(nextProc)
            } else {
              setProcessInExecution(null)
            }
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
        case 'n':
          if (isPaused === false) {
            let processesInMemory = processInExecution instanceof Process ? 1 : 0
            processesInMemory += readyProcesses.length
            processesInMemory += blockedProcesses.length

            const newProcess = generateProcesses(1, nextId)[0]
            setNextId(nextId + 1)
            if (processesInMemory < 4) {
              newProcess.arrivalTime = globalTime
              readyProcesses.push(newProcess)
            } else {
              newProcesses.push(newProcess)
            }

            operationWasPerformed = true
          }
          break
        case 'b':
          if (isPaused === false) {
            setIsPaused(true)
            logPartialProgress()
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

  const logPartialProgress = () => {
    let log = actionLogs + `[${new Date().toLocaleTimeString()}, Global Time: ${globalTime} seconds] - ${INTERRUPTIONS.b.description}\n`

    newProcesses.forEach((process) => {
      log += process.partialLog(globalTime) + '\tStatus: New\n************\n'
    })

    readyProcesses.forEach((process) => {
      log += process.partialLog(globalTime) + '\tStatus: Ready\n************\n'
    })

    if (processInExecution instanceof Process) {
      log += processInExecution.partialLog(globalTime) + '\tStatus: In Execution\n************\n'
    }

    terminatedProcesses.forEach((process) => {
      log += process.partialLog(globalTime) + '\tStatus: Terminated\n************\n'
    })

    setActionLogs(log)
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
    const interval = setInterval(() => {
      setGlobalTime(globalTime => globalTime + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Avoid updating more than 1 t/s
    const now = new Date()
    if ((now - lastUpdate) < 900) {
      return
    }
    setLastUpdate(now)

    // Check if process end
    if (newProcesses.length === 0 && readyProcesses.length === 0 && blockedProcesses.length === 0 && processInExecution === null) {
      setIsProcessing(false)
      if (simulationEnd === null) {
        setSimulationEnd(globalTime)
      }
      return
    }

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

    if (isPaused === false && isProcessing === true) {
      updateBlockedProcesses()

      if (processInExecution instanceof Process) {
        if (processInExecution.isTerminated()) {
          // Push to terminated
          processInExecution.endTime = globalTime - 1
          terminatedProcesses.push(processInExecution)

          // If there is a new process add it to ready
          if (newProcesses.length > 0) {
            const readyProc = newProcesses.shift()
            if (readyProc.arrivalTime === -1) {
              readyProc.arrivalTime = globalTime
            }
            readyProcesses.push(readyProc)
          }

          // Define next process will be executed
          const nextReadyProc = readyProcesses.shift()
          if (nextReadyProc instanceof Process) {
            if (nextReadyProc.startTime === -1) {
              nextReadyProc.startTime = globalTime
            }
            setProcessInExecution(nextReadyProc)
          } else {
            // If there are no blocked processes, end processing
            if (blockedProcesses.length === 0) {
              setIsProcessing(false)
              if (simulationEnd === null) {
                setSimulationEnd(globalTime)
              }
            } else {
              setProcessInExecution(null)
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
    }
  }, [reportLogged, setGlobalTime, globalTime, setIsPaused, isPaused, isProcessing, processInExecution, terminatedProcesses, newProcesses, readyProcesses, blockedProcesses, setBlockedProcesses, setTerminatedProcesses])

  return (
    <>
      <Container>
        <div style={{ textAlign: 'center' }}>
          <h1>New processes: {newProcesses.length}</h1>
          {
            !isProcessing && simulationEnd !== null
              ? (
                <>
                  <h2>Global Time: {simulationEnd} seconds</h2>
                  <Button onClick={processingDone}>Return</Button>
                </>
                )
              : (<h2>Global Time: {globalTime} seconds</h2>)
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
