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
            throw new Error(`stub exhausted, call not expected`);
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
            throw new Error(`stub exhausted, call not expected`);
        }
        return value;
    }
};

const fromVoid = () => {
    let value;
    const calls = [];
    const generator = function* () {
        while (true) {
            value = yield;
        }
    }();
    generator.next();

    return Object.defineProperties(Object.assign(fn, {
        return(val) {
            generator.next(val);
            return fn;
        },
        resolve(val) {
            generator.next(Promise.resolve(val));
            return fn;
        },
        reject(reason) {
            generator.next(Promise.reject(reason));
            return fn;
        }
        // throws(error){
        //     generator.next()
        // }
    }), descriptor(calls));

    function fn(...args) {
        calls.push(args);
        return value;
    }
};

export default function (...args) {
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
};
