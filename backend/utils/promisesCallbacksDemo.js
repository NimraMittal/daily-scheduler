// 1. The Callback Approach
function fetchWithCallback(callback) {
    setTimeout(() => callback(null, "Data from callback"), 1000);
}
fetchWithCallback((error, data) => {
    if (error) console.error(error);
    else console.log(data);
});

// 2. The Modern Promise / Async-Await Approach
const fetchWithPromise = () => {
    return new Promise((resolve, reject) => {
        setTimeout(() => resolve("Data from Promise"), 1000);
    });
};

async function handleData() {
    try {
        const data = await fetchWithPromise();
        console.log(data);
    } catch (error) {
        console.error("Promise failed:", error);
    }
}
handleData();