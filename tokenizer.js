//TOKENIZER
let symbols = require("./grammar");
keywords = ['new', 'out', 'in', 'Prog', 'while', 'if', 'else', 'true', 'false'];

function tokenSearch(symbol) {
    let token = null;
    for (let i = 0; i < symbols.length; i++) {
        if (symbols[i].values.find(s => s === symbol)) {
            token = {
                type: symbols[i].type,
                value: symbol
            }
        }
    }
    return token;
}

module.exports = function tokenizer(input) {
    let current = 0; //курсор
    let tokens = []; //массив, в котором будут валяться токены
    let str = '';
    while (current < input.length) {
        let symbol = input[current]; //текущий символ

        if (symbol === "#") { //игнор комментариев
            let curr = current + 1;
            while (symbol !== '\r') {
                symbol = input[curr];
                curr++;
            }
            current = curr;
            continue;
        }

        let tok = tokenSearch(symbol);
        console.log(tok);
        if (tok && tok.type === "letter") {
            let curr = current + 1;
            while ((tok && (tok.type === "letter" || tok.type === "number")) || symbol === "_") {
                str += symbol;
                symbol = input[curr];
                curr++;
                tok = tokenSearch(symbol);
            }
            current = curr - 1;
            tok = keywords.find(w => w === str) ? (str === "true" || str === "false") ? {
                type: "bool",
                value: str
            } : {
                type: "keyword",
                value: str
            } : {
                type: "word",
                value: str
            };
            str = '';
        } else if (tok && tok.type === "number") {
            let curr = current + 1;
            let numEe = 0;
            let numTck = 0;
            while ((tok && tok.type === "number") || (numEe === 0 && (symbol === 'e' || symbol === 'E')) || (numTck === 0 && symbol === '.')) {
                if (symbol === 'e' || symbol === 'E') numEe++;
                if (symbol === '.') numTck++;
                str += symbol;
                symbol = input[curr];
                curr++;
                tok = tokenSearch(symbol);
            }
            curr--;
            if ((tokenSearch(input[curr]) && tokenSearch(input[curr]).type !== "letter") || /\s/.test(input[curr]) || /,/.test(input[curr])) {
                current = curr - 1;
                tok = {
                    type: "number",
                    value: str
                };
                str = '';
            } else {
                console.log("ОШИБКА: неверно введено число - " + symbol + " (" + current + ")");
                return -1;
            }
        } else if (tok && tok.type === "comparisons") {
            let curr = current;
            if ((input[curr] === '=' && input[curr + 1] === '=') || (input[curr] === '<' && input[curr + 1] === '=')
                || (input[curr] === '>' && input[curr + 1] === '=') || (input[curr] === '&' && input[curr + 1] === '&')
                || (input[curr] === '|' && input[curr + 1] === '|')) {
                tok = {
                    type: "comparisons",
                    value: input[curr] + input[curr + 1]
                }
            } else if ((input[curr] === '>' && input[curr + 1] === '>') || (input[curr] === '<' && input[curr + 1] === '<')) {
                tok = {
                    type: "inout",
                    value: input[curr] + input[curr + 1]
                }
            } else if (input[curr] === '=') {
                tok = {
                    type: "assignment_operator",
                    value: "="
                }
            } else if (input[curr] === '>' || input[curr] === '<') {
                tok = {
                    type: "comparisons",
                    value: input[curr]
                }
            } else {
                console.log("ОШИБКА: неверно задано логическое выражение - " + symbol + " (" + current + ")");
                return -1;
            }
            current = curr + 1;
            str = '';
        }
        let token = tok;
        if (token) {
            tokens.push(token);
            current++;
        } else {
            if (/\s/.test(symbol)) current++;
            else {
                console.log("ОШИБКА: неподдерживаемый символ - " + symbol + " (" + current + ")");
                return -1;
            }
        }
    }
    return tokens;
}