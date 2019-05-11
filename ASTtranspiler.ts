import _ from 'lodash';

let indentCounter = 0;

let x = new String();

const pyOps = new Map<string, string>();
pyOps.set('!', 'not ');
pyOps.set('||', 'or');
pyOps.set('&&', 'and');
pyOps.set('==', 'is');
pyOps.set('===', 'is');
pyOps.set('!=', 'is not');
pyOps.set('!==', 'is not');
pyOps.set('instanceof', 'instanceof');

const opGet = ((key: string) => {
    return pyOps.get(key) || key.substring(0, 2);
})

const indent = (() => '    '.repeat(indentCounter));
const dedent = (() => {
    indentCounter--;
    return indent();
})

const processNode = (ast: any): any => {
    if (!_.has(transpiler, ast.type)) {
        console.error(`Unknown token type ${ast.type}!\nReturning nothing...`);
        return '';
    }
    return transpiler[ast.type](ast);
}

const transpiler: any = {
    File: (ast: any) => processNode(ast.program),
    Program: (ast: any) => ast.body.map((entry: any) => processNode(entry)),
    Identifier: (ast: any) => ast.name,
    StringLiteral: (ast: any) => `"${ast.value}"`,
    NumericLiteral: (ast: any) => ast.value.toString(),
    BooleanLiteral: (ast: any) => ast.value ? 'true' : 'false',
    TemplateLiteral: (ast: any) => {
        const expressions = ast.expressions.map((e: any) => `\${${processNode(e)}}`);
        const quasis = ast.quasis.map((q: any) => processNode(q));

        return "'"+ _.flatten(_.zip(quasis, expressions)).join('') + "'";
    },
    TemplateElement: (ast: any) => ast.value.raw || "",
    NullLiteral: (ast: any) => 'nil',
    VariableDeclaration: (ast: any) => `${ast.declarations.map((entry: any) => processNode(entry)).join(', ')}`,
    VariableDeclarator: (ast: any) => {
        return ast.id.name + (ast.init ? ' = ' + processNode(ast.init) : '');
    },
    FunctionDeclaration: (ast: any) => {
        const def = `def ${processNode(ast.id)}:\n`;
        indentCounter++;
        const res = processNode(ast.body);
        dedent();
        return `${def}${res}`;
    },
    UnaryExpression: (ast: any) => {
        const res = processNode(ast.argument);
        const op = opGet(ast.operator);
        return ast.prefix ? `${op}${res}` : `${res}${op}`;
    },
    BinaryExpression: (ast: any) => {
        const op = opGet(ast.operator);
        return `${processNode(ast.left)} ${op} ${processNode(ast.right)}`;
    },
    ArrowFunctionExpression: (ast: any) => {
        let res;
        if (ast.expression) {
            res = processNode(ast.body);
        } else {
            indentCounter++;
            res = `{\n${processNode(ast.body)}${dedent()}}`;
        }
        const args = ast.params.map((p: any) => p.name).join(', ');

        return `lambda ${args}: ${res}`;
    },
    MemberExpression: (ast: any) => {
        return ast.computed ? 
            `${processNode(ast.object)}[${processNode(ast.property)}]`:
            `${processNode(ast.object)}.${processNode(ast.property)}`;
    },
    LogicalExpression: (ast: any) => `${processNode(ast.left)} ${opGet(ast.operator)} ${processNode(ast.right)}`,
    ThisExpression: (ast: any) => 'this',
    FunctionExpression: (ast: any) => {
        const params = ast.params.map((e: any) => processNode(e)).join(', ');
        indentCounter++;
        const body = processNode(ast.body);
        dedent();
        return `lambda ${params}:\n${body}`;
    },
    CallExpression: (ast: any) => `${processNode(ast.callee)}(${ast.arguments.map((a: any) => processNode(a)).join(', ')})`,
    ExpressionStatement: (ast: any) => processNode(ast.expression),
    BlockStatement: (ast: any) => ast.body.map((e: any) => indent() + processNode(e) + '\n').join(''),
    ReturnStatement: (ast: any) => `return${ast.argument ? ' ' + processNode(ast.argument) : ''}`,
    ConditionalExpression: (ast: any) => {
        return `${processNode(ast.test)} ? ${processNode(ast.consequent)} : ${processNode(ast.alternate)}`;
    },
    IfStatement: (ast: any) => {
        let ifs = `if ${processNode(ast.test)}:\n`;
        indentCounter++;
        const res = `${ifs}${(ast.consequent.type !== 'BlockStatement' ? indent() : '') + processNode(ast.consequent)}`;
        dedent();
        return res;
    },
    ObjectExpression: (ast: any) => {
        indentCounter++;
        const props = ast.properties.map((e: any) => `${indent()}${processNode(e.key)}: ${processNode(e.value)}`).join(',\n');
        dedent();
        if(!props) {
            return '{}';
        }
        return `{\n${props}\n${indent()}}`;
    },
    AssignmentExpression: (ast: any) => {
        return `${processNode(ast.left)} = ${processNode(ast.right)}`;
    },
    ForInStatement: (ast: any) => {
        const loop = `for ${processNode(ast.left)} in ${processNode(ast.right)}:\n`
        indentCounter++;
        const res = (ast.body.type !== 'BlockStatement' ? indent() : '') + processNode(ast.body);
        dedent();
        return `${loop}${res}`;
    },
    ArrayExpression: (ast: any) => {
        return `[${ast.elements.map((e: any) => processNode(e)).join(', ')}]`
    },
    ForStatement: (ast: any) => {
        const init = processNode(ast.init);
        const test = `${indent()}while ${processNode(ast.test)}:`;
        indentCounter++;
        const body = (ast.body.type !== 'BlockStatement' ? indent() : '') + processNode(ast.body);
        const update = indent() + processNode(ast.update);
        dedent();
        return (`${init}\n${test}\n${body}${update}\n`);
    },
    NewExpression: (ast: any) => `new ${processNode(ast.callee)}(${ast.arguments.map((a: any) => processNode(a)).join(', ')})`,
    UpdateExpression: (ast: any) => {
        const op = opGet(ast.operator);
        const oth = processNode(ast.argument);
        return ast.prefix ? `${op}${oth}` : `${oth}${op}`;
    },
}

const transpile = ((ast: any) => {
    const res = processNode(ast).join('\n\n');
    return res;
})

export default transpile;