import { Process } from '.'

class Memory {
  constructor () {
    this.memory = new Array(40)
    for (let i = 0; i < 38; i++) {
      this.memory[i] = { freeSpace: 5, allocatedBy: null }
    }

    this.memory[38] = { freeSpace: 0, allocatedBy: 'OS' }
    this.memory[39] = { freeSpace: 0, allocatedBy: 'OS' }
  }

  getCopy () {
    return [...this.memory]
  }

  alloc (process) {
    if (!(process instanceof Process)) {
      return false
    }

    const requiredMemoryFrames = Math.ceil(process.size / 5)
    const freeFrames = []
    this.memory.forEach((frame, index) => {
      if (frame.freeSpace === 5) {
        freeFrames.push(index)
      }
    })

    if (freeFrames.length < requiredMemoryFrames) {
      return false
    }

    process.memoryAddress = freeFrames[0]
    for (let i = process.size, j = 0; i > 0;) {
      const memoryToAlloc = Math.min(5, i)

      this.memory[freeFrames[j]].freeSpace -= memoryToAlloc
      this.memory[freeFrames[j]].allocatedBy = process.id
      i -= memoryToAlloc
      j++
    }

    return true
  }

  dealloc (process) {
    if (!(process instanceof Process) || process.memoryAddress === null) {
      return false
    }

    const allocatedFrames = Math.ceil(process.size / 5)
    for (let offset = 0; offset < allocatedFrames; offset++) {
      this.memory[process.memoryAddress + offset].allocatedBy = null
      this.memory[process.memoryAddress + offset].freeSpace = 5
    }
    process.memoryAddress = null

    return true
  }
}

export default Memory
