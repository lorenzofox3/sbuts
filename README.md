# sbuts

micro stubbing library for javascript environments

> I like big sbuts and I cannot lie. Mc Hammer

> A method stub or simply stub in software development is a piece of code used to stand in for some other programming functionality. Wikipedia

## Install

``npm install --save-dev sbuts`` (or from CDN etc)

The module has a single export

```Javascript
import stub from 'sbuts';
// etc
```


## Usage

The low level API always come back to a generator to get the best flexibility, but higher level syntax sugar is also available

1. Stub produces a value

```Javascript
let fn = stub(function *(){
    yield 42;
});

// or 

fn = stub(42);

// or 

fn = stub().return(42);

fn('whatever') === 42; // > true
```
2. Stub produces a list of values when called multiple times

```Javascript
fn = stub(function *(){
    yield 42;
    yield 'woot';
});

// or

fn = stub(42,'woot');

// or

fn = stub()
    .return(42)
    .return('woot'); // can be called later

fn('foo') === 42; // > true
fn(66) === 'woot'; // > true
```

3. Stub throws an error

```Javascript
fn = stub(function *(){
  throw new Error('some error');  
});

or 

fn = stub().throw(new Error('some error'));

try{
  fn();
} catch(e){
  e.message === 'some error'; // > true
}
```

4. stub async function

```Javascript
fn = stub(async function *(){
    yield 42;
});

// or

fn = stub(function * (){
  yield Promise.resolve(42);
});

// or 

fn = stub(Promise.resolve(42));

// or 

fn = stub().resolve(42);

// or ... probably other ways but you get the idea

val === await fn() // > true
```

5. stub async error

```Javascript
fn = stub(async function *(){
    throw new Error('some error');
});

// or

fn = stub(function * (){
  yield Promise.reject(new Error('some error'));
});

// or 

fn = stub(Promise.reject(new Error('some message')));

// or 

fn = stub().reject(new Error('some message'));

// or ... probably other ways but you get the idea

try {
    await fn(`woot bim`)
} catch (e) {
    e.message === `some message` // > true
}
```

## Assert on arguments

Every call captures the arguments, so you can make some assertions on how the stub was called:

```Javascript
const fn = stub(function *(){
    let i = 0;
    while(true){
       yield ++i;
    }
});

fn(null, 42);
fn({foo:'bar'});

fn.calls; // > [ [null, 42], [ {foo:'bar'} ] ]
```


