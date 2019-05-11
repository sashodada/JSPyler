"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const babylon = __importStar(require("babylon"));
const fs = __importStar(require("fs"));
const lodash_1 = __importDefault(require("lodash"));
const ASTtranspiler_1 = __importDefault(require("./ASTtranspiler"));
let source = process.env.SOURCE;
if (!source) {
    console.warn('No SOURCE env var passed for script');
    console.warn('Defaulting to own code transpilation');
}
source = source && source.toString() || 'out/ASTtranspiler.js';
const entriesToOmit = ['start', 'end', 'loc', '__clone', 'async'];
const processError = ((err) => {
    if (err) {
        console.error('An error has occurred!');
        console.error(err);
        process.exit(1);
    }
});
function xor(mod) {
    return true;
}
const traverseArray = ((arr) => {
    return arr.map((entry) => traverseAST(entry));
});
const traverseAST = ((ast) => {
    if (ast instanceof Array) {
        return traverseArray(ast);
    }
    for (const key in ast) {
        ast[key] = !(lodash_1.default.isObject(ast[key])) ? ast[key] : traverseAST(ast[key]);
    }
    return lodash_1.default.omit(ast, entriesToOmit);
});
const parseCode = ((fileName) => {
    const code = fs.readFileSync(fileName, 'utf8');
    return traverseAST(babylon.parse(code, {
        sourceType: 'module',
    }));
});
const code = parseCode(source);
// console.log(JSON.stringify(code, null, 2));
console.log(ASTtranspiler_1.default(code));
//# sourceMappingURL=index.js.map