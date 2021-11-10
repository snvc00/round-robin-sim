class Process {
  constructor (id) {
    this.id = id
    this.maxTime = Math.floor(Math.random() * 10) + 6
    this.executionTime = 0
    this.operator = ['+', '-', '*', '/', '%', '^'][Math.floor(Math.random() * 6)]
    this.firstOperand = Math.floor(Math.random() * 100)
    this.secondOperand = Math.floor(Math.random() * 100) + 1
    this.error = false
    this.timeToUnblock = 0
    this.arrivalTime = -1
    this.startTime = -1
    this.endTime = undefined
    this.quantum = 0
    this.size = Math.floor(Math.random() * (26 - 6) + 6)
    this.memoryAddress = null
  }

  get operation () {
    return `${this.firstOperand} ${this.operator} ${this.secondOperand}`
  }

  get result () {
    return this.error === true ? 'ERROR' : this.evaluate()
  }

  throwError () {
    this.error = true
  }

  block () {
    this.timeToUnblock = 7
  }

  update () {
    if (this.timeToUnblock > 0) {
      --this.timeToUnblock
    } else {
      ++this.executionTime
      ++this.quantum
    }
  }

  isTerminated () {
    return this.error === true || (this.maxTime === this.executionTime)
  }

  evaluate () {
    switch (this.operator) {
      case '+':
        return this.firstOperand + this.secondOperand
      case '-':
        return this.firstOperand - this.secondOperand
      case '*':
        return this.firstOperand * this.secondOperand
      case '/':
        return this.firstOperand / this.secondOperand
      case '%':
        return this.firstOperand % this.secondOperand
      case '^':
        return Math.pow(this.firstOperand, this.secondOperand)
      default:
        return 'UNDEFINED'
    }
  }

  resetQuantum () {
    this.quantum = 0
  }

  toString () {
    return `Process ${this.id}: ${this.firstOperand} ${this.operator} ${this.secondOperand} = ${this.result} took ${this.executionTime} seconds`
  }

  log () {
    return `** PID ${this.id}, ${this.error ? 'ERROR' : 'NORMAL'} **\n
            Estimated Time: ${this.maxTime}
            Arrival Time: ${this.arrivalTime}
            End Time: ${this.endTime}
            Standby Time: ${(this.endTime - this.arrivalTime) - this.executionTime}
            Service Time: ${this.executionTime}
            Return Time: ${this.endTime - this.arrivalTime}
            Response Time: ${this.startTime - this.arrivalTime}\n\n************`
  }

  partialLog (globalTime) {
    let standbyTime
    if (this.endTime !== undefined) {
      standbyTime = (this.endTime - this.arrivalTime) - this.executionTime
    } else if (this.arrivalTime !== -1) {
      standbyTime = globalTime - this.arrivalTime - this.executionTime
    } else {
      standbyTime = '-'
    }

    let partialLog = `** PID ${this.id}, ${this.error ? 'ERROR' : 'NORMAL'} **\n`
    partialLog += `\tEstimated Time: ${this.maxTime}\n`
    partialLog += `\tArrival Time: ${this.arrivalTime !== -1 ? this.arrivalTime : '-'}\n`
    partialLog += `\tEnd Time: ${this.endTime ?? '-'}\n`
    partialLog += `\tStandby Time: ${standbyTime}\n`
    partialLog += `\tService Time: ${this.arrivalTime !== -1 ? this.executionTime : '-'}\n`
    partialLog += `\tReturn Time: ${this.endTime ? (this.endTime - this.arrivalTime) : '-'}\n`
    partialLog += `\tRemaining Time on CPU: ${this.startTime !== -1 ? (this.maxTime - this.executionTime) : '-'}\n`
    partialLog += `\tResponse Time: ${(this.startTime !== -1 && this.arrivalTime !== -1) ? (this.startTime - this.arrivalTime) : '-'}\n`

    return partialLog
  }
}

export default Process
