import { Process } from '.'

export const generateProcesses = (totalProcesses) => {
  console.log('Executing process initialization...')

  let id = 0
  const processes = []
  for (let i = 0; i < totalProcesses; ++i) {
    processes.push(new Process(id++))
  }

  return processes
}
