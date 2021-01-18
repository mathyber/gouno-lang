//GENERATOR
let rpn = require("./g");

module.exports = function gener(ast) {
    let perems = {};
    console.log("----------------------------")

    function GException(message) {
        this.message = message;
        this.name = "PARSE ERROR";
    }

    function gError(text) {
        console.log(`Ошибка: ${text}`);
        throw new GException(`Ошибка ${text}`);
    }

    const operators = {
        '+': (x, y) => x + y,
        '-': (x, y) => x - y,
        '*': (x, y) => x * y,
        '/': (x, y) => x / y
    };

    let evaluate = (expr) => {
        let stack = [];

        expr.split(' ').forEach((token) => {
            if (token in operators) {
                let [y, x] = [stack.pop(), stack.pop()];
                stack.push(operators[token](x, y));
            } else {
                stack.push(parseFloat(token));
            }
        });

        return stack.pop();
    };

    function calc(comm) {
        let calcstr = '';
        if (comm.type === "math") {
            comm.values.forEach(com => {
                if (com.type === "word" || comm.type === "id") {
                    if (perems[com.value]!==undefined) calcstr += perems[com.value];
                    else gError("Идентификатор не найден - " + com.value)
                }
                if (com.type === "operations" || com.type === "bool" || com.type === "number" || com.type === "parenthesis") {
                    calcstr += com.value;
                }
            });
            return evaluate(rpn.Generate(calcstr));
        } else if (comm.type === "number") return Number(comm.value);
        else if (comm.type === "bool") return comm.value;
        else if (comm.type === "word" || comm.type === "id") {
            if (perems[comm.value]!==undefined) return perems[comm.value];
            else gError("Идентификатор не найден - " + comm.value)
        } else if (comm.type === "Array") {
            return comm.values.map(v => calc(v));
        }

    }

    function gen(command) {
        if (command.type === "newId") {
            perems[command.name] = command.right ? calc(command.right) : null;
        } else if (command.type === "assign") {
            perems[command.left] = command.right ? calc(command.right) : null;
        } else if (command.type === "write") {
            console.log("ВЫВОД НА ЭКРАН ----------");
            command.write.forEach(r => {
                console.log(perems[r.value])
            })
            console.log("-----------------------");
        } else if (command.type === "ConditionalStatement") {
            let l = calc(command.cond.left);
            let r = calc(command.cond.right);
            if ((command.cond.operator === "==" && l === r) ||
                (command.cond.operator === "<=" && l <= r) ||
                (command.cond.operator === ">=" && l >= r) ||
                (command.cond.operator === ">" && l > r) ||
                (command.cond.operator === "<" && l < r)
            ) {
                gen(command.then);
            } else {
                gen(command.else);
            }
        } else if (command.type === "cycle") {
            let l = calc(command.cond.left);
            let r = calc(command.cond.right);
            while ((command.cond.operator === "==" && l === r) ||
                (command.cond.operator === "<=" && l <= r) ||
                (command.cond.operator === ">=" && l >= r) ||
                (command.cond.operator === ">" && l > r) ||
                (command.cond.operator === "<" && l < r)
                ) {
                gen(command.block);
                l = calc(command.cond.left);
                r = calc(command.cond.right);
            }
        } else if (command.type === "Block") {
            command.body.forEach(command => {
                gen(command);
            })
        }
    }

    ast.body.forEach(command => {
            gen(command);
        }
    )

    // console.log(evaluate(rpn.Generate("(10+1)*44")));

}