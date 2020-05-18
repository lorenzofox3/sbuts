#zora-stub

### Respond with a value

```javascript
const fn = stub(function *() {
  yield 42;
});

// or 

const fn = stub(42);

t.eq(fn(),42);
```

### Respond with a serie of values

```javascript
const fn = stub(function *() {
    yield 42;
    yield 'woot';
    yield {foo:'bar'};
});

// or 

const fn = stub(42, 'woot', {foo:'bar'});

t.eq(fn(),42);
t.eq(fn(),'woot');
t.eq(fn(),{foo:'bar'});
```

### Respond indefinitely

```javascript
const fn = stub(function *() {
  while (true){
    yield 42;
  }
});

t.eq(fn(),42);
t.eq(fn(),42);
t.eq(fn(),42);
t.eq(fn(),42);
// ...
```
