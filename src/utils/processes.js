import { Process } from '.'

export const generateProcesses = (totalProcesses, startId = undefined) => {
  let id = startId ?? 0
  const processes = []
  for (let i = 0; i < totalProcesses; ++i) {
    processes.push(new Process(id++))
  }

  return processes
}
