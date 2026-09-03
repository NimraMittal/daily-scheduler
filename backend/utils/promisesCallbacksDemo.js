/*
 * ASYNC / AWAIT AND PROMISE DEMO
 *
 * This demonstrates the same Promise-based asynchronous behavior
 * that is used when Axios fetches tasks in Dashboard.jsx.
 */

// --------------------------------------------------
// CALLBACK-BASED ASYNC OPERATION
// --------------------------------------------------

function fetchWithCallback(callback) {
  // setTimeout represents asynchronous work.
  //
  // When the timer finishes, this callback becomes
  // eligible to run through the task/macrotask queue.
  setTimeout(() => {
    callback(null, 'Data from callback');
  }, 1000);
}

fetchWithCallback((error, data) => {
  if (error) {
    console.error(error);
    return;
  }

  console.log(data);
});

// --------------------------------------------------
// PROMISE-BASED ASYNC OPERATION
// --------------------------------------------------

function fetchWithPromise() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve('Data from Promise');
    }, 1000);
  });
}

// --------------------------------------------------
// ASYNC / AWAIT
// --------------------------------------------------

async function handleData() {
  try {
    /*
     * `await` does NOT block the whole JavaScript thread.
     *
     * It pauses/yields only this async function while
     * the Promise is pending.
     *
     * When the Promise resolves, the continuation after
     * `await` is scheduled through Promise microtask processing.
     */
    const data = await fetchWithPromise();

    console.log(data);
  } catch (error) {
    console.error('Promise failed:', error);
  }
}

handleData();
