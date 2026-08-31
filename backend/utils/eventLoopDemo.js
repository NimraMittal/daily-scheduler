console.log("1. Sync execution starts (Call Stack)");

setTimeout(() => {
    console.log("3. Async execution (Callback Queue / Event Loop)");
}, 0);

console.log("2. Sync execution ends (Call Stack)");