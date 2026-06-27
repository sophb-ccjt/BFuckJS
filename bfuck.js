class BFRuntime {
    // init
    ptr = 0;
    #inputbyte = null;

    constructor(tapeSize = 32767) {
        this.tape = new Uint8Array(tapeSize);
        this.tapeSize = tapeSize;
    }

    // command functions
    get ptrValue() {
        return this.tape[this.ptr];
    }
    set ptrValue(value) {
        if (!Number.isInteger(value))
            throw new TypeError('New pointer value must be an integer.');
        
        this.tape[this.ptr] = value % 256;
        return undefined;
    }
    incAtPointer() {
        this.ptrValue++ ;
        this.ptrValue %= 256;
        return undefined;
    }
    decAtPointer() {
        if (this.ptrValue === 0)
            this.ptrValue = 255;
        else this.ptrValue--;
        return undefined;
    }
    movePointerLeft() {
        if (this.ptr === 0)
            this.ptr = 0;
        else this.ptr--;
        return undefined;
    }
    movePointerRight() {
        if (this.ptr === this.tapeSize - 1)
            this.ptr = this.tapeSize - 1;
        else this.ptr++;
        return undefined;
    }
}
class BFInterpreter {
    // init
    #isHandlingLoop = null;
    #tapeSize;

    constructor(tapeSize, stepCallback = ()=>{}) {
        this.BFinstance = new BFRuntime(tapeSize);

        // callback args:
        // (output, tape, pointerLocation, commandExecuted) => { ... }
        this.stepCallback = stepCallback;
    }

    // command handling
    handleCommand(command) {
        // short-circuiting
        if (typeof command !== 'string')
            throw new TypeError('Command must be a string.');
        if (command.length !== 1)
            throw new SyntaxError('Command must be 1 word/character long.');

        switch (command) {
            // pointer value
            case '.':
                return String.fromCharCode(this.BFinstance.ptrValue);
            case '+':
                return this.BFinstance.incAtPointer();
            case '-':
                return this.BFinstance.decAtPointer();

            // pointer
            case '>':
                return this.BFinstance.movePointerRight();
            case '<':
                return this.BFinstance.movePointerLeft();

            // loops 
            case '[': return null;
            case ']': return null;
            /* loops are incomplete in isolation, and 
            therefore return null since 
            a value cannot be resolved.
            they should be handled by 
            the program handler instead. */

            // I/O; should be handled by program handler instead
            case ',': return null;

            // "Characters that are not commands are ignored." -Daniel B Cristofani
            default: return undefined;
        }
    }
    step(command, inputCharCode = 0) {
        if (!Number.isInteger(inputCharCode))
            throw new TypeError('Input character code must be an integer.');
        inputCharCode %= 256;

        switch (command) {
            default:
                const handledOutput = this.handleCommand(command);
                this.stepCallback(handledOutput, this.BFinstance.tape, this.BFinstance.ptr, command);
                return handledOutput;

            case ',':
                this.BFinstance.ptrValue = inputCharCode;
                break;

            case '[':
            case ']':
                throw new EvalError('Loops must be handled by the program handler, not the stepper!');
        }
    }
    handleProgram(code = '', input = '') {
        if (typeof code !== 'string')
            throw new TypeError('Code must be a string.');
        if (typeof input !== 'string')
            throw new TypeError('Input must be a string.');

        if (code.includes('[') || code.includes(']'))
            throw new EvalError('Loops are yet to be handled!');
        
        let output = '';
        let inputPtr = 0;
        for (const command of code) {
            const commandOutput = this.step(command, input.charCodeAt(inputPtr) ?? 0);
            console.log(commandOutput);
            if (typeof commandOutput === 'string')
                output += commandOutput;

            if (command === ',')
                inputPtr = Math.min(inputPtr, input.length);
        }
        return output;
    }
    clearState() {
        this.#isHandlingLoop = null;
        this.BFinstance = new BFRuntime(this.BFinstance.tapeSize);
    }
}
