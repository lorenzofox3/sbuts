'use strict';

const STUB_EXHAUSTED_ERROR = `stub exhausted, call not expected`;

const descriptor = (calls) => ({
    calls: {
        value: calls
    },
    callCount: {
        get() {
            return calls.length;
        }
    },
    called: {
        get() {
            return calls.length > 0;
        }
    }
});

const fromAsyncGenerator = (generator) => {
    const calls = [];
    return Object.defineProperties(fn, descriptor(calls));
    
    async function fn(...args) {
        calls.push(args);
        const {value, done} = await generator.next();
        if (done) {
            throw new Error(STUB_EXHAUSTED_ERROR);
        }
        return value;
    }
};

const fromGenerator = (generator) => {
    const calls = [];
    return Object.defineProperties(fn, descriptor(calls));
    
    function fn(...args) {
        calls.push(args);
        const {value, done} = generator.next();
        if (done) {
            throw new Error(STUB_EXHAUSTED_ERROR);
        }
        return value;
    }
};

const fromVoid = () => {
    const queue = [];
    const generator = (function* () {
        while (true) {
            const next = queue.shift();
            if (!next) {
                break;
            }
            const {type, value} = next;
            if (type === 'error') {
                throw value;
            }
            yield value;
        }
    })();
    
    const fn = fromGenerator(generator);
    const queueCall = (value, type = 'value') => {
        queue.push({value, type});
        return fn;
    };
    
    return Object.assign(fn, {
        return: queueCall,
        resolve: (val) => queueCall(Promise.resolve(val)),
        reject: (val) => queueCall(Promise.reject(val)),
        throw: (val) => queueCall(val, 'error')
    });
};

function index (...args) {
    const [input] = args;
    
    if (typeof input === 'function') {
        const generatorObject = input();
        return generatorObject[Symbol.asyncIterator] ?
            fromAsyncGenerator(generatorObject) :
            fromGenerator(generatorObject);
    }
    
    return args.length === 0 ?
        fromVoid() :
        fromGenerator(function* () {
            yield* args;
        }());
}

module.exports = index;
