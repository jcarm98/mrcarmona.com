global.crypto = {
    getRandomValues: (arr) => {
        for (let i = 0; i < arr.length; i++) {
            arr[i] = Math.floor(Math.random() * 256);
        }
        return arr;
    },
};

const CONSOLE_FAIL_TYPES = ['error', 'warn'];
CONSOLE_FAIL_TYPES.forEach((type) => {
    console[type] = (message, ...args) => {
        if (message.includes("ReactDOMTestUtils.act")) {
            return;
        }
        if (args.includes('class')) {
            return;
        }
        //console.log(message, args);
        throw new Error(args.reduce((current, next) => {
            return current + '\n' + next;
        }, message));
    }
});

