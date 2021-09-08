class Process {
    #id;
    #maxTime;
    #executionTime;
    #operator;
    #firstOperand;
    #secondOperand;
    #error;

    constructor(id) {
        this.#id = id;
        this.#maxTime = Math.floor(Math.random() * 10) + 6;
        this.#executionTime = 0;
        this.#operator = ["+", "-", "*", "/", "%", "^"][Math.floor(Math.random() * 6)];
        this.#firstOperand = Math.floor(Math.random() * 100);
        this.#secondOperand = Math.floor(Math.random() * 100) + 1;
        this.#error = false;
    }

    get id() {
        return this.#id;
    }

    get maxTime() {
        return this.#maxTime;
    }

    get executionTime() {
        return this.#executionTime;
    }

    get operation() {
        return `${this.#firstOperand} ${this.#operator} ${this.#secondOperand}`
    }

    get result() {
        return this.#error ? "ERROR" : this.evaluate();
    }

    throwError() {
        this.#error = true;
    }

    update() {
        ++this.#executionTime;
    }

    isTerminated() {
        return this.#error === true || (this.#maxTime === this.#executionTime);
    }

    evaluate() {
        switch (this.#operator) {
            case "+":
                return this.#firstOperand + this.#secondOperand;
            case "-":
                return this.#firstOperand - this.#secondOperand;
            case "*":
                return this.#firstOperand * this.#secondOperand;
            case "/":
                return this.#firstOperand / this.#secondOperand;
            case "%":
                return this.#firstOperand % this.#secondOperand;
            case "^":
                return Math.pow(this.#firstOperand, this.#secondOperand);
            default:
                return "UNDEFINED";
        }
    }

    toString() {
        return `Process ${this.#id}: ${this.#firstOperand} ${this.#operator} ${this.#secondOperand} = ${this.getResult()} took ${this.#executionTime} seconds`;
    }
}

export default Process;