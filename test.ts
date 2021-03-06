import stub from './index';
import {Assert} from 'zora';

export default (t: Assert) => {
    t.test(`create stub with generator`, t => {

        t.test('when a value is yielded the stub should return that value', t => {
            const fn = stub(function* () {
                yield 'woot';
            });

            t.eq(fn('hello world'), 'woot');
            t.eq(fn.calls, [['hello world']]);
        });

        t.test(`when several values are yielded, the stub should sequentially return the values`, t => {
            const fn = stub(function* () {
                yield 'woot';
                yield 5;
                yield {foo: 'bar'};
            });

            t.eq(fn('first', 'arg'), 'woot');
            t.eq(fn(2), 5);
            t.eq(fn(null, 'arg'), {foo: 'bar'});
            t.eq(fn.calls, [
                ['first', 'arg'],
                [2],
                [null, 'arg']
            ]);
        });

        t.test(`when an error is thrown, the stub should throw`, t => {
            const fn = stub(function* () {
                throw new Error('message');
            });

            try {
                fn('abc');
                t.fail('should not get here');
            } catch (e) {
                t.eq(e.message, 'message');
                t.eq(fn.calls, [
                    ['abc']
                ]);
            }
        });

        t.test(`when a a value is yielded in an async generator, the stub should behave as an async function`, async t => {
            const fn = stub(async function* () {
                yield [1, 2, 3];
            });

            const val = await fn(42);

            t.eq(val, [1, 2, 3]);
            t.eq(fn.calls, [[42]]);
        });

        t.test(`when a promise is yielded, the stub should behave as an async function`, async t => {
            const fn = stub(function* () {
                yield Promise.resolve([1, 2, 3]);
            });

            const val = await fn(42);

            t.eq(val, [1, 2, 3]);
            t.eq(fn.calls, [[42]]);
        });

        t.test(`when a promise rejection is yielded, the stub should behave as an async function`, async t => {
            const fn = stub(function* () {
                yield Promise.reject(new Error('some message'));
            });

            try {
                // @ts-ignore
                const val = await fn(42);
                t.fail(`should not get here`);
            } catch (e) {
                t.eq(e.message, 'some message');
                t.eq(fn.calls, [[42]]);
            }
        });

        t.test(`when an error is thrown in a async generator, the stub should behave as an async function`, async t => {
            const fn = stub(async function* () {
                throw new Error('some message');
            });
            try {
                await fn('a', 2);
                t.fail(`should not get here`);
            } catch (e) {
                t.eq(e.message, 'some message');
                t.eq(fn.calls, [
                    ['a', 2]
                ]);
            }
        });

        t.test(`stub should throw if a it is called more than expected`, t => {
            const fn = stub(function* () {
                yield 'bim';
            });

            const val = fn('arg');
            t.eq(val, 'bim');
            try {
                fn('out of bound');
                t.fail(`should not get here`);
            } catch (e) {
                t.eq(e.message, `stub exhausted, call not expected`);
                t.eq(fn.calls, [
                    ['arg'],
                    ['out of bound']
                ]);
            }
        });

    });

    t.test(`create stub with provided value`, t => {

        t.test('The stub should return that value', t => {
            const fn = stub('woot');

            t.eq(fn('hello world'), 'woot');
            t.eq(fn.calls, [
                ['hello world']
            ]);
        });

        t.test(`when several values are provided, the stub should sequentially return the values`, t => {
            const fn = stub('woot', 5, {foo: 'bar'});

            t.eq(fn('first', 'arg'), 'woot');
            t.eq(fn(2), 5);
            t.eq(fn(null, 'arg'), {foo: 'bar'});
            t.eq(fn.calls, [
                ['first', 'arg'],
                [2],
                [null, 'arg']
            ]);
        });

        t.test(`When the value is a Promise, the stub should behave as an async function`, async t => {
            const fn = stub(Promise.resolve([1, 2, 3]));

            const val = await fn(42);

            t.eq(val, [1, 2, 3]);
            t.eq(fn.calls, [[42]]);
        });

        t.test(`when a promise rejection is passed, the stub should behave as an async function`, async t => {
            const fn = stub(Promise.reject(new Error(`some message`)));
            try {
                await fn('a', 2);
                t.fail(`should not get here`);
            } catch (e) {
                t.eq(e.message, 'some message');
                t.eq(fn.calls, [
                    ['a', 2]
                ]);
            }
        });

    });

    t.test(`create stub with no parameters`, t => {

        t.test(`Return(value) should make the stub return that value`, t => {
            const fn = stub().return(42);
            t.eq(fn(1), 42);

            fn.return('woot');

            t.eq(fn({woot: true}), 'woot');
            t.eq(fn.calls, [
                [1],
                [{woot: true}]
            ]);
        });

        t.test(`resolve(value) should make the stub return that value as if it was an asynchronous function`, async t => {
            const fn = stub().resolve(42);
            const val = await fn(1, 2, 3);
            t.eq(val, 42);
            t.eq(fn.calls, [
                [1, 2, 3]
            ]);
        });

        t.test(`reject(reason) should stub an asynchronous function throwing an error`, async t => {
            const fn = stub().reject(new Error(`message`));
            try {
                await fn('foo');
            } catch (e) {
                t.eq(e.message, 'message');
                t.eq(fn.calls, [['foo']]);
            }
        });

        t.test(`throw(error) should make stub throw an exception on next call`, t => {
            const fn = stub().throw(new Error(`some error`));
            try {
                fn('blah');
                t.fail(`should not get here`);
            } catch (e) {
                t.eq(e.message, 'some error');
            }
        });
    });
};
