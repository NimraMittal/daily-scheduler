// 1. Function Hoisting
greet(); 
function greet() {
    console.log("Function declarations are fully hoisted to the top.");
}

// 2. Variable Hoisting (var vs const)
console.log(legacyVar); // Outputs: undefined
var legacyVar = "I am hoisted but uninitialized";

// console.log(modernVar); // Uncommenting this throws a ReferenceError
const modernVar = "I am protected by the Temporal Dead Zone";