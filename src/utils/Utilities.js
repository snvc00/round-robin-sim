import Process from "./Process";

class Utilities {
    static INTERRUPTIONS = {
        e: {
            description: "I/O interruption",
        },
        w: {
            description: "Error in process",
        },
        p: {
            description: "Pause",
        },
        c: {
            description: "Continue",
        }
    };

    static generateBatches = (totalProcesses) => {
        console.log("Executing batch initialization...");
        let batch = [], allBatches = [], remainingProcesses = totalProcesses, id = 0, batchId = 0;
        while (remainingProcesses > 0) {
            batch.push(new Process(id++, batchId));

            if (batch.length === 4) {
                allBatches.push(batch);
                ++batchId;
                batch = [];
            }

            --remainingProcesses;
        }

        if (batch.length > 0)
            allBatches.push(batch);

        return allBatches;
    }
}

export default Utilities;