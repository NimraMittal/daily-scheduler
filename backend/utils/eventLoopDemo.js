/*
 * EVENT LOOP DEMO
 *
 * This demonstrates all three important parts:
 *
 * 1. Call Stack
 * 2. Microtask Queue
 * 3. Task / Macrotask Queue
 *
 * Expected execution order:
 *
 * 1 -> 2 -> 3 -> 4
 */

console.log('1. Synchronous start - call stack');

// setTimeout does NOT execute immediately.
//
// The timer is handled asynchronously.
// When it is ready, its callback is placed in the
// task queue, also called the macrotask queue.
setTimeout(() => {
  console.log(
    '4. setTimeout callback - task/macrotask queue'
  );
}, 0);

// Promise callbacks use the MICROtask queue.
//
// Even though both this Promise and setTimeout are asynchronous,
// Promise microtasks are processed before the next macrotask
// once the current call stack becomes empty.
Promise.resolve().then(() => {
  console.log(
    '3. Promise.then callback - microtask queue'
  );
});

// This is synchronous, so it finishes before either
// asynchronous callback can execute.
console.log('2. Synchronous end - call stack');