"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
let indentCounter = 0;
let x = new String();
const pyOps = new Map();
pyOps.set('!', 'not ');
pyOps.set('||', 'or');
pyOps.set('&&', 'and');
pyOps.set('==', 'is');
pyOps.set('===', 'is');
pyOps.set('!=', 'is not');
pyOps.set('!==', 'is not');
pyOps.set('instacneof', 'instanceof');
const opGet = ((key) => {
    return pyOps.get(key) || key.substring(0, 2);
});
const indent = (() => '    '.repeat(indentCounter));
const dedent = (() => {
    indentCounter--;
    return indent();
});
const processNode = (ast) => {
    if (!lodash_1.default.has(transpiler, ast.type)) {
        console.error(`Unknown token type ${ast.type}!\nReturning nothing...`);
        return '';
    }
    return transpiler[ast.type](ast);
};
const transpiler = {
    File: (ast) => processNode(ast.program),
    Program: (ast) => ast.body.map((entry) => processNode(entry)),
    Identifier: (ast) => ast.name,
    StringLiteral: (ast) => `"${ast.value}"`,
    NumericLiteral: (ast) => ast.value.toString(),
    BooleanLiteral: (ast) => ast.value ? 'true' : 'false',
    TemplateLiteral: (ast) => {
        const expressions = ast.expressions.map((e) => `\${${processNode(e)}}`);
        const quasis = ast.quasis.map((q) => processNode(q));
        return "'" + lodash_1.default.flatten(lodash_1.default.zip(quasis, expressions)).join('') + "'";
    },
    TemplateElement: (ast) => ast.value.raw || "",
    NullLiteral: (ast) => 'nil',
    VariableDeclaration: (ast) => `${ast.declarations.map((entry) => processNode(entry)).join(', ')}`,
    VariableDeclarator: (ast) => {
        return ast.id.name + (ast.init ? ' = ' + processNode(ast.init) : '');
    },
    FunctionDeclaration: (ast) => {
        const def = `def ${processNode(ast.id)}:\n`;
        indentCounter++;
        const res = processNode(ast.body);
        dedent();
        return `${def}${res}`;
    },
    UnaryExpression: (ast) => {
        const res = processNode(ast.argument);
        const op = opGet(ast.operator);
        return ast.prefix ? `${op}${res}` : `${res}${op}`;
    },
    BinaryExpression: (ast) => {
        const op = opGet(ast.operator);
        return `${processNode(ast.left)} ${op} ${processNode(ast.right)}`;
    },
    ArrowFunctionExpression: (ast) => {
        let res;
        if (ast.expression) {
            res = processNode(ast.body);
        }
        else {
            indentCounter++;
            res = `{\n${processNode(ast.body)}${dedent()}}`;
        }
        const args = ast.params.map((p) => p.name).join(', ');
        return `lambda ${args}: ${res}`;
    },
    MemberExpression: (ast) => {
        return ast.computed ?
            `${processNode(ast.object)}[${processNode(ast.property)}]` :
            `${processNode(ast.object)}.${processNode(ast.property)}`;
    },
    LogicalExpression: (ast) => `${processNode(ast.left)} ${opGet(ast.operator)} ${processNode(ast.right)}`,
    ThisExpression: (ast) => 'this',
    FunctionExpression: (ast) => {
        const params = ast.params.map((e) => processNode(e)).join(', ');
        indentCounter++;
        const body = processNode(ast.body);
        dedent();
        return `lambda ${params}:\n${body}`;
    },
    CallExpression: (ast) => `${processNode(ast.callee)}(${ast.arguments.map((a) => processNode(a)).join(', ')})`,
    ExpressionStatement: (ast) => processNode(ast.expression),
    BlockStatement: (ast) => ast.body.map((e) => indent() + processNode(e) + '\n').join(''),
    ReturnStatement: (ast) => `return${ast.argument ? ' ' + processNode(ast.argument) : ''}`,
    ConditionalExpression: (ast) => {
        return `${processNode(ast.test)} ? ${processNode(ast.consequent)} : ${processNode(ast.alternate)}`;
    },
    IfStatement: (ast) => {
        let ifs = `if ${processNode(ast.test)}:\n`;
        indentCounter++;
        const res = `${ifs}${(ast.consequent.type !== 'BlockStatement' ? indent() : '') + processNode(ast.consequent)}`;
        dedent();
        return res;
    },
    ObjectExpression: (ast) => {
        indentCounter++;
        const props = ast.properties.map((e) => `${indent()}${processNode(e.key)}: ${processNode(e.value)}`).join(',\n');
        dedent();
        if (!props) {
            return '{}';
        }
        return `{\n${props}\n${indent()}}`;
    },
    AssignmentExpression: (ast) => {
        return `${processNode(ast.left)} = ${processNode(ast.right)}`;
    },
    ForInStatement: (ast) => {
        const loop = `for ${processNode(ast.left)} in ${processNode(ast.right)}:\n`;
        indentCounter++;
        const res = (ast.body.type !== 'BlockStatement' ? indent() : '') + processNode(ast.body);
        dedent();
        return `${loop}${res}`;
    },
    ArrayExpression: (ast) => {
        return `[${ast.elements.map((e) => processNode(e)).join(', ')}]`;
    },
    ForStatement: (ast) => {
        const init = processNode(ast.init);
        const test = `${indent()}while ${processNode(ast.test)}:`;
        indentCounter++;
        const body = (ast.body.type !== 'BlockStatement' ? indent() : '') + processNode(ast.body);
        const update = indent() + processNode(ast.update);
        dedent();
        return (`${init}\n${test}\n${body}${update}\n`);
    },
    NewExpression: (ast) => `new ${processNode(ast.callee)}(${ast.arguments.map((a) => processNode(a)).join(', ')})`,
    UpdateExpression: (ast) => {
        const op = opGet(ast.operator);
        const oth = processNode(ast.argument);
        return ast.prefix ? `${op}${oth}` : `${oth}${op}`;
    },
};
const transpile = ((ast) => {
    const res = processNode(ast).join('\n\n');
    return res;
});
exports.default = transpile;
//# sourceMappingURL=ASTtranspiler.js.map