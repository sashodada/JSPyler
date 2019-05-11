import * as babylon from 'babylon';
import * as fs from 'fs';
import _ from 'lodash';
import transpile from './ASTtranspiler';

let source = process.env.SOURCE;
if (!source) {
    console.warn('No SOURCE env var passed for script');
    console.warn('Defaulting to own code transpilation');
}

source = source && source.toString() || 'out/ASTtranspiler.js';

const entriesToOmit = ['start', 'end', 'loc', '__clone', 'async'];

const processError = ((err: any) => {
    if (err) {
        console.error('An error has occurred!')
        console.error(err);
        process.exit(1);
    }
});

function xor(mod: any) {
    return true;
}

const traverseArray = ((arr: any) => {
    return arr.map((entry: any) => traverseAST(entry));
})

const traverseAST = ((ast: any) => {

    if (ast instanceof Array) {
        return traverseArray(ast);
    }

    for (const key in ast) {
        ast[key] = !(_.isObject(ast[key])) ? ast[key] : traverseAST(ast[key]);
    }

    return _.omit(ast, entriesToOmit);
})

const parseCode = ((fileName: string): any => {
    const code = fs.readFileSync(fileName, 'utf8');
    return traverseAST(babylon.parse(code, {
        sourceType: 'module',
    }));
});

const code = parseCode(source);

// console.log(JSON.stringify(code, null, 2));

console.log(transpile(code));
