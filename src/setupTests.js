global.crypto = {
    getRandomValues: (arr) => {
        for (let i = 0; i < arr.length; i++) {
            arr[i] = Math.floor(Math.random() * 256);
        }
        return arr;
    },
};

// Interecept console warnings/errors in jest
// https://www.benmvp.com/blog/catch-warnings-jest-tests/
const CONSOLE_FAIL_TYPES = ['error', 'warn'];
CONSOLE_FAIL_TYPES.forEach((type) => {
    console[type] = (message, ...args) => {
        if (message.includes("ReactDOMTestUtils.act")) {
            return;
        }
        if (args.includes('class')) {
            return;
        }
        if (message.includes('Attempted to synchronously unmount a root')) {
            return;
        }
        if (message.includes('React Router Future Flag Warning: React Router will begin wrapping state updates')) {
            return;
        }
        if (message.includes('React Router Future Flag Warning: Relative route resolution within Splat routes is changing')) {
            return;
        }
        console.log("MESSAGE FOR STUFF GOES HERE", message, args);
        throw new Error(args.reduce((current, next) => {
            return current + '\n' + next;
        }, message));
    }
});
