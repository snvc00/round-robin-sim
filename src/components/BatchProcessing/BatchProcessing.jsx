import "./BatchProcessing.css";
import styled from "styled-components";

import { ProgressBar, Fieldset, TextArea, TaskBar, List, Button } from "@react95/core";
import { Notepad, BatWait, BatExec2, Qfecheck111, RecycleEmpty } from '@react95/icons';
import { useEffect, useState } from "react";

import Window from "../Window";
import Utilities from "../../utils/Utilities";

const Container = styled.div`
    margin: auto;
    padding: 10px;
    display: block;
    width: 60%;
`;

const BatchProcessing = ({ totalProcesses, processingDone }) => {
    const [globalTime, setGlobalTime] = useState(-1);
    const [actionLogs, setActionLogs] = useState("");
    const [batches, setBatches] = useState([]);
    const [currentBatch, setCurrentBatch] = useState(0);
    const [terminatedProcesses, setTerminatedProcesses] = useState([]);
    const [isPaused, setIsPaused] = useState(false);
    const [isProcessing, setIsProcessing] = useState(true);

    onkeydown = ({ key }) => {
        key = key.toLowerCase();
        if (Utilities.INTERRUPTIONS?.[key]) {
            switch (key) {
                case "e":
                    batches[currentBatch]?.push(batches[currentBatch].shift());
                    break;
                case "w":
                    batches[currentBatch]?.[0].throwError();
                    break;
                case "p":
                    setIsPaused(true);
                    break;
                case "c":
                    if (isPaused === true) {
                        setIsPaused(false);
                        computeSecond();
                    }
                    break;
                default:
                    console.log(`Not implemented action triggered with ${key}`);
            }

            setActionLogs(actionLogs + `[${new Date().toLocaleTimeString()}, Global Time: ${globalTime} seconds] - ${Utilities.INTERRUPTIONS[key].description}\n`);
        }
    };

    const logExecutedBatch = () => {
        const time = new Date().toLocaleTimeString();
        let logs = actionLogs + `[${time}, Global Time: ${globalTime} seconds] - Batch ${currentBatch} processed\n`;
        // terminatedProcesses.forEach(process => {
        //     logs += `[${time}, Global Time: ${globalTime} seconds] - Batch ${currentBatch}, PID ${process.id}: ${process.operation} = ${process.result}\n`;
        // })

        setActionLogs(logs);
    }

    const computeSecond = () => {
        if (batches[currentBatch]?.length === 0) {
            // Finish if the last batch run out of processes otherwise go to next batch
            if ((batches.length - (currentBatch + 1)) === 0) {
                setIsProcessing(false);
            } else {
                setCurrentBatch(currentBatch + 1);
                setGlobalTime(globalTime + 1);
            }

            logExecutedBatch();
            //setTerminatedProcesses([]);

            return;
        }

        if (batches[currentBatch]?.[0].isTerminated()) {
            // If process is terminated move to terminated processes
            setTerminatedProcesses(terminatedProcesses.concat(batches[currentBatch].shift()));
            computeSecond();

            return;
        }

        batches[currentBatch]?.[0].update();
        setGlobalTime(globalTime + 1);
    }

    useEffect(() => {
        setBatches(Utilities.generateBatches(totalProcesses));
        computeSecond();
    }, []);

    useEffect(() => {
        if (isPaused === false && isProcessing === true) {
            setTimeout(computeSecond, 1000);
        }
    }, [globalTime]);

    useEffect(() => {
        if (isProcessing === false) {
            logExecutedBatch();
            setCurrentBatch(0);
            setBatches([]);
            //setTerminatedProcesses([]);
            setIsPaused(false);
        }
    }, [isProcessing]);

    return (
        <>
            <Container>
                <div style={{ textAlign: "center" }}>
                    <h1>Pending batches: {Math.max(batches.length - (currentBatch + 1), 0)}</h1>
                    <h2>Global Time: {globalTime} seconds</h2>
                    {
                        !isProcessing ? <Button onClick={processingDone}>Return</Button> : <></>
                    }
                </div>
                <br />
                <Window title="pending processes - Current Batch" icon={<BatWait variant="32x32_4" />}>
                    {
                        batches[currentBatch]?.map((process, index) => index !== 0 ?
                            (<Fieldset key={index} legend={`PID ${process.id}`} style={{ width: "90%", textAlign: "left", marginBottom: 10 }}>
                                <p key={index + "_p"}>Estimated execution time: {process.maxTime} seconds - Ellapsed time: {process.executionTime} seconds</p>
                            </Fieldset>)
                            :
                            (<></>))
                    }
                </Window>
                <Window title="current process - Current Batch" icon={<BatExec2 variant="32x32_4" />}>
                    {
                        batches[currentBatch] ? (<Fieldset legend={`PID ${batches[currentBatch]?.[0]?.id}`} className="process-fieldset">
                            <p>Operation: {batches[currentBatch]?.[0]?.operation}</p>
                            <p>Estimated execution time: {batches[currentBatch]?.[0]?.maxTime} seconds</p>
                            <p>Ellapsed time: {batches[currentBatch]?.[0]?.executionTime} seconds</p>
                            <ProgressBar width={200} percent={Math.round(batches[currentBatch]?.[0]?.executionTime / batches[currentBatch]?.[0]?.maxTime * 100)} />
                        </Fieldset>) : (<></>)
                    }
                </Window>
                <Window title="terminated processes - Current Batch" icon={<Qfecheck111 variant="32x32_4" />}>
                    {
                        terminatedProcesses?.map(process => (
                            <Fieldset key={process.id} legend={`PID ${process.id} - Batch ${process.batchId}`} className="process-fieldset">
                                <p key={process.id + "_p"}>{process.operation} = {process.result}</p>
                            </Fieldset>
                        ))
                    }
                </Window>
                <Window title="logs.txt - Notepad" icon={<Notepad variant="32x32_4" />}>
                    <TextArea readOnly value={actionLogs} style={{ width: "100%", height: 200 }} />
                    <br /><br />
                    <Button onClick={() => { setActionLogs("") }}>Clear logs</Button>
                </Window><br />
            </Container>
            <TaskBar
                list={
                    <List>
                        <List.Item
                            key="reset"
                            icon={<RecycleEmpty variant="32x32_4" />}
                            onClick={() => {
                                setIsProcessing(false);
                                processingDone();
                            }}
                        >
                            Empty and Restart
                        </List.Item>
                    </List>
                }
            />
        </>
    );
}

export default BatchProcessing;