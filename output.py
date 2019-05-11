__importDefault = this and this.__importDefault or lambda mod:
    return mod and mod.__esModule ? mod : {
        "default": mod
    }


Object.defineProperty(exports, "__esModule", {
    value: true
})

lodash_1 = __importDefault(require("lodash"))

indentCounter = 0

x = new String()

pyOps = new Map()

pyOps.set("!", "not ")

pyOps.set("||", "or")

pyOps.set("&&", "and")

pyOps.set("==", "is")

pyOps.set("===", "is")

pyOps.set("!=", "is not")

pyOps.set("!==", "is not")

pyOps.set("instacneof", "instanceof")

opGet = lambda key: {
    return pyOps.get(key) or key.substring(0, 2)
}

indent = lambda : "    ".repeat(indentCounter)

dedent = lambda : {
    indentCounter--
    return indent()
}

processNode = lambda ast: {
    if not lodash_1.default.has(transpiler, ast.type):
        console.error('Unknown token type ${ast.type}!\nReturning nothing...')
        return ""

    return transpiler[ast.type](ast)
}

transpiler = {
    File: lambda ast: processNode(ast.program),
    Program: lambda ast: ast.body.map(lambda entry: processNode(entry)),
    Identifier: lambda ast: ast.name,
    StringLiteral: lambda ast: '"${ast.value}"',
    NumericLiteral: lambda ast: ast.value.toString(),
    BooleanLiteral: lambda ast: ast.value ? "true" : "false",
    TemplateLiteral: lambda ast: {
        expressions = ast.expressions.map(lambda e: '\${${processNode(e)}}')
        quasis = ast.quasis.map(lambda q: processNode(q))
        return "'" + lodash_1.default.flatten(lodash_1.default.zip(quasis, expressions)).join("") + "'"
    },
    TemplateElement: lambda ast: ast.value.raw or "",
    NullLiteral: lambda ast: "nil",
    VariableDeclaration: lambda ast: '${ast.declarations.map(lambda entry: processNode(entry)).join(", ")}',
    VariableDeclarator: lambda ast: {
        return ast.id.name + ast.init ? " = " + processNode(ast.init) : ""
    },
    FunctionDeclaration: lambda ast: {
        def = 'def ${processNode(ast.id)}:\n'
        indentCounter++
        res = processNode(ast.body)
        dedent()
        return '${def}${res}'
    },
    UnaryExpression: lambda ast: {
        res = processNode(ast.argument)
        op = opGet(ast.operator)
        return ast.prefix ? '${op}${res}' : '${res}${op}'
    },
    BinaryExpression: lambda ast: {
        op = opGet(ast.operator)
        return '${processNode(ast.left)} ${op} ${processNode(ast.right)}'
    },
    ArrowFunctionExpression: lambda ast: {
        res
        if ast.expression:
            res = processNode(ast.body)

        args = ast.params.map(lambda p: p.name).join(", ")
        return 'lambda ${args}: ${res}'
    },
    MemberExpression: lambda ast: {
        return ast.computed ? '${processNode(ast.object)}[${processNode(ast.property)}]' : '${processNode(ast.object)}.${processNode(ast.property)}'
    },
    LogicalExpression: lambda ast: '${processNode(ast.left)} ${opGet(ast.operator)} ${processNode(ast.right)}',
    ThisExpression: lambda ast: "this",
    FunctionExpression: lambda ast: {
        params = ast.params.map(lambda e: processNode(e)).join(", ")
        indentCounter++
        body = processNode(ast.body)
        dedent()
        return 'lambda ${params}:\n${body}'
    },
    CallExpression: lambda ast: '${processNode(ast.callee)}(${ast.arguments.map(lambda a: processNode(a)).join(", ")})',
    ExpressionStatement: lambda ast: processNode(ast.expression),
    BlockStatement: lambda ast: ast.body.map(lambda e: indent() + processNode(e) + "
").join(""),
    ReturnStatement: lambda ast: 'return${ast.argument ? " " + processNode(ast.argument) : ""}',
    ConditionalExpression: lambda ast: {
        return '${processNode(ast.test)} ? ${processNode(ast.consequent)} : ${processNode(ast.alternate)}'
    },
    IfStatement: lambda ast: {
        ifs = 'if ${processNode(ast.test)}:\n'
        indentCounter++
        res = '${ifs}${ast.consequent.type is not "BlockStatement" ? indent() : "" + processNode(ast.consequent)}'
        dedent()
        return res
    },
    ObjectExpression: lambda ast: {
        indentCounter++
        props = ast.properties.map(lambda e: '${indent()}${processNode(e.key)}: ${processNode(e.value)}').join(",
")
        dedent()
        if not props:
            return "{}"

        return '{\n${props}\n${indent()}}'
    },
    AssignmentExpression: lambda ast: {
        return '${processNode(ast.left)} = ${processNode(ast.right)}'
    },
    ForInStatement: lambda ast: {
        loop = 'for ${processNode(ast.left)} in ${processNode(ast.right)}:\n'
        indentCounter++
        res = ast.body.type is not "BlockStatement" ? indent() : "" + processNode(ast.body)
        dedent()
        return '${loop}${res}'
    },
    ArrayExpression: lambda ast: {
        return '[${ast.elements.map(lambda e: processNode(e)).join(", ")}]'
    },
    ForStatement: lambda ast: {
        init = processNode(ast.init)
        test = '${indent()}while ${processNode(ast.test)}:'
        indentCounter++
        body = ast.body.type is not "BlockStatement" ? indent() : "" + processNode(ast.body)
        update = indent() + processNode(ast.update)
        dedent()
        return '${init}\n${test}\n${body}${update}\n'
    },
    NewExpression: lambda ast: 'new ${processNode(ast.callee)}(${ast.arguments.map(lambda a: processNode(a)).join(", ")})',
    UpdateExpression: lambda ast: {
        op = opGet(ast.operator)
        oth = processNode(ast.argument)
        return ast.prefix ? '${op}${oth}' : '${oth}${op}'
    }
}

transpile = lambda ast: {
    res = processNode(ast).join("

")
    return res
}

exports.default = transpile
