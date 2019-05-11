"use strict";
const dummyFunc = ((eni) => eni + 10), dummy2 = 1;
let x;
const readFileSync = ((arg1, arg2) => { return true ? 1 + 2 : !!(1 + 5 ^ 15); });
const parse = (() => { });
const processError = ((err) => {
    if (err) {
        console.error('An error has occurred!');
        console.error(err);
        process.exit(1);
    }
});
const parseCode = ((fileName) => {
    const code = readFileSync(fileName, 'utf8');
    return parse();
});
console.log(parseCode('out/index.js'));
//# sourceMappingURL=dummy.js.map