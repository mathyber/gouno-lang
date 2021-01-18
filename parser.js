//PARSER
let regulations = require("./regulations");

module.exports = function parser(tokens) {
    let current = 0; //курсор

    function ParseException(message) {
        this.message = message;
        this.name = "PARSE ERROR";
    }

    function parsingError(text) {
        console.log(`Ошибка парсера: ${text} (${tokens[current] && tokens[current].value}, ${current})`);
        throw new ParseException(`Ошибка парсера: ${text} (${tokens[current] && tokens[current].value}, ${current})`);
    }

    function isProg() {
        let ret = {
            type: "Prog",
            body: []
        }

        let pr = regulations.find(reg => reg.type === "Prog");

        pr.regulation.forEach(re => {
            if (re.types[0] === "symbol") {
                if (tokens[current].value === re.value) {
                    current++;
                } else {
                    parsingError("название программы задано неверно - требуется символ " + re.value + " ");
                }
            } else if (re.types[0] === "token") {
                if (tokens[current].type === re.value) {
                    current++;
                } else {
                    parsingError("название программы задано неверно - неверный токен, требуется " + re.value + " ")
                }
            }
        })

        while (current < tokens.length) {
            ret.body.push(operator());
            current++;
        }

        return ret;
    }

    function isNewId() { //идентификатор
        let ret = {
            type: "newId",
            name: "",
            right: null
        }
        //  let pr = regulations.find(reg => reg.type === "Prog");
        if (tokens[current].value === "new") {
            current++;
        } else {
            parsingError("требуется new");
        }

        if (tokens[current].type === "word") {
            ret["name"] = tokens[current].value;
            current++;
        } else {
            parsingError("требуется идентификатор");
        }

        if (tokens[current].value === "=") {
            current++;
            ret["right"] = operator();

        } else {
            current--;
            return ret;
        }

        return ret;
    }

    function isArray() { //массив
        let ret = {
            type: "Array",
            values: []
        }
        //  let pr = regulations.find(reg => reg.type === "Prog");
        if (tokens[current].value === "[") {
            current++;
        } else {
            parsingError("требуется [");
        }

        while (tokens[current].value !== "]") {
            if (tokens[current].value !== ",") {
                ret.values.push(operator());
                current++;
            } else current++;
        }

        return ret;
    }


    function isBlock() { //массив
        let ret = {
            type: "Block",
            body: []
        }
        //  let pr = regulations.find(reg => reg.type === "Prog");
        if (tokens[current].value === "{") {
            current++;
        } else {
            parsingError("требуется {");
        }

        while (current < tokens.length && tokens[current].value !== "}") {
            ret.body.push(operator());
            current++;
        }
        if (current >= tokens.length ||!tokens[current]|| tokens[current] && tokens[current].value !== "}") parsingError("требуется }")
        return ret;
    }


    function isAssign() { //присвоение
        let ret = {
            type: "assign",
            left: '',
            right: {}
        }

        if (tokens[current].type === "word") {
            ret["left"] = tokens[current].value;
            current++;
        } else {
            parsingError("требуется идентификатор");
        }
        if (tokens[current].value === "=") {
            current++;
            ret["right"] = operator();
        } else {
            parsingError("требуется =");
        }
        return ret;
    }

    function isWrite() { //вывод
        let ret = {
            type: "write",
            write: []
        }
        if (tokens[current].value === "out") {
            current++;
        } else {
            parsingError("требуется out");
        }
        if (tokens[current].value === ">>") {
            current++;
            ret.write.push(operator());
            current++;
        } else {
            parsingError("требуется >>");
        }
        while (tokens[current ] && tokens[current].value === ">>") {
            current++;
            ret.write.push(operator());
        }
        current--;
        return ret;
    }

    function isRead() { //ввод
        let ret = {
            type: "read",
            read: []
        }
        if (tokens[current].value === "in") {
            current++;
        } else {
            parsingError("требуется in");
        }
        if (tokens[current].value === "<<") {
            current++;
            ret.read.push(operator());
            current++;
        } else {
            parsingError("требуется <<");
        }
        while (tokens[current].value === "<<") {
            current++;
            ret.read.push(operator());
        }
        current--;
        return ret;
    }

    function isConditionalStatement() {
        let ret = {
            type: "ConditionalStatement",
            cond: {},
            then: {},
            else: {}
        }
        current++;
        let c = operator();
        if (c.type === "boolean_expr") ret.cond = c;
        else parsingError("требуется условие");

        c = operator();
        if (c.type === "Block") ret.then = c;
        else parsingError("требуется блок");

        current++;
        // console.log(operator())
        if (current < tokens.length && tokens[current].value === "else") {
            current++;
            c = operator();
            if (c.type === "Block") {
                ret.else = c;
            } else parsingError("требуется блок");
        } else current--;
        return ret;
    }

    function isCycle() {
        let ret = {
            type: "cycle",
            cond: {},
            block: {}
        }
        current++;
        let c = operator();
        if (c.type === "boolean_expr") ret.cond = c;
        else parsingError("требуется условие");

        c = operator();
        console.log(c)
        if (c.type === "Block") ret.block = c;
        else parsingError("требуется блок");
        return ret;
    }

    function isBooleanExpression() { //логич выраж
        let ret = {
            type: "boolean_expr",
            operator: "",
            left: {},
            right: {}
        }
        if (tokens[current].value === "(") {
            current++;
            ret.left = operator();

        } else {
            parsingError("требуется (");
        }
        current++;

        if (tokens[current].type === "comparisons") {
            ret.operator = tokens[current].value;
            current++;
        } else {
            parsingError("требуется знак");
        }

        ret.right = operator();

        current++;
        if (tokens[current].value === ")") {
            current++;
            return ret;
        } else {
            parsingError("требуется )");
        }
        return ret;
    }

    function isMath() {
        let ret = {
            type: "math",
            values: []
        }
        let isZnak = false;
        let sk=0;
        while (tokens[current].type !== "keyword" && tokens[current].type !== "block"
        && ((tokens[current].type === "operations" && isZnak)
            || (tokens[current].type !== "operations" && isZnak===false) || (tokens[current].type === "parenthesis"))) {
            ret.values.push(tokens[current]);
            current++;
            if (tokens[current].type !== "parenthesis") isZnak = !isZnak;
            else {
                if (tokens[current].value==="(") sk++;
                else sk--;
                if (sk<0) parsingError("неверно расставлены скобки")
            }
        }
        if (sk!==0)parsingError("неверно расставлены скобки")
        current--;
        return ret;
    }

    function operator() {
        let type = tokens[current].type;
        let value = tokens[current].value;
        if (type === "keyword") {
            switch (value) {
                case "new":
                    return isNewId();
                case "in":
                    return isRead();
                case "out":
                    return isWrite();
                case "if":
                    return isConditionalStatement();
                case "while":
                    return isCycle();
            }
        } else if (type === "bool") {
            return {
                type: "bool",
                value: value
            };
        } else if (type === "operations") {
            return {
                type: "operations",
                value: value
            };
        } else if (value === "[") {
            return isArray();
        } else if (value === "{") {
            return isBlock();
        } else if (value === "(") {
            return isBooleanExpression();
        } else if (type === "number") {
            if (tokens[current + 1].type === "operations") {
                return isMath();
            } else
                return {
                    type: "number",
                    value: value
                };
        } else if (type === "word") {
            if (tokens[current + 1] && tokens[current + 1].type === "operations") {
                return isMath();
            } else if (tokens[current - 1].type !== "inout"
                && tokens[current - 1].type !== "parenthesis"
                && tokens[current - 1].type !== "comparisons") return isAssign();
            else return {
                    type: "id",
                    value: value
                }
        } else {
            parsingError("лишний символ");
        }
    }

    return isProg();
}