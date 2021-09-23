class Process {
  id
  maxTime
  executionTime
  operator
  firstOperand
  secondOperand
  error
  arrivalTime
  startTime
  endTime
  timeToUnblock

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
    this.timeToUnblock > 0 ? --this.timeToUnblock : ++this.executionTime
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

  toString () {
    return `Process ${this.id}: ${this.firstOperand} ${this.operator} ${this.secondOperand} = ${this.result} took ${this.executionTime} seconds`
  }

  log () {
    console.log(this)
    return ` ** PID ${this.id}, ${this.error ? 'ERROR' : 'NORMAL'} **\nArrival Time: ${this.arrivalTime}\nEnd Time: ${this.endTime}\nReturn Time: ${this.endTime - this.arrivalTime}\nResponse Time: ${this.startTime - this.arrivalTime}\nStandby Time: ${(this.endTime - this.startTime) - this.executionTime}\nService Time: ${this.executionTime}\n************`
  }
}

export default Process
