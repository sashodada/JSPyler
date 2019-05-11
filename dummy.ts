
const dummyFunc = ((eni: number) => eni + 10), dummy2 = 1;
let x;
const readFileSync = ((arg1: string, arg2: string) => { return true ? 1 + 2 : !!(1 + 5 ^ 15)});
const parse = (() => {});

const processError = ((err: any) => {
    if (err) {
        console.error('An error has occurred!')
        console.error(err);
        process.exit(1);
    }
})

const parseCode = ((fileName: string): any => {
    const code = readFileSync(fileName, 'utf8');
    return parse();
});

console.log(parseCode('out/index.js'));
