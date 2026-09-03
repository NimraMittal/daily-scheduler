/*
 * HOISTING DEMO
 *
 * This file intentionally demonstrates:
 * 1. Function declaration hoisting
 * 2. A specific confusing behavior caused by `var`
 * 3. Temporal Dead Zone behavior with `const`
 * 4. The safer declaration-before-use pattern used in the application
 */

console.log('--- 1. Function declaration hoisting ---');

// This works even though greet() is declared later.
// Function declarations are created and initialized
// when JavaScript creates the execution context.
greet();

function greet() {
  console.log(
    'Function declaration is available before this line executes.'
  );
}

console.log('\n--- 2. Specific var-hoisting confusion ---');

// PROBLEM:
//
// The variable binding exists before this line because `var` is hoisted.
// However, the assignment "loaded" has NOT executed yet.
//
// Because `var` is initialized with undefined, this does not throw an error.
// It silently prints undefined, which can cause confusing bugs.
console.log('Before assignment:', legacyTaskStatus);

var legacyTaskStatus = 'loaded';

console.log('After assignment:', legacyTaskStatus);

console.log('\n--- 3. const and Temporal Dead Zone ---');

try {
  // `const` also has a binding created before execution reaches its
  // declaration, but it remains uninitialized in the Temporal Dead Zone.
  //
  // Therefore accessing it here throws ReferenceError instead of silently
  // returning undefined.
  console.log(modernTaskStatus);

  const modernTaskStatus = 'loaded';

  console.log(modernTaskStatus);
} catch (error) {
  console.log('Early const access:', error.name);
}

console.log('\n--- 4. Fix used in application code ---');

// FIX:
//
// In the actual application I avoid depending on `var` hoisting.
// I use const/let and declare variables before accessing them.
const taskStatus = 'loaded';

console.log('Declared before use:', taskStatus);