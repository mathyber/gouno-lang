let fs = require("fs");
const tokenizer = require("./tokenizer");
const parser = require("./parser");
const gener = require("./gener");
let filename = "1.gu";

fs.readFile(filename, "utf8",
    function (error, data) {
        console.log("CodeFile GoUno");
        if (error) throw error;
      //  console.log(data);
        let tokens = tokenizer(data);
        console.log(tokens);
        let ast = parser(tokens);
        console.log(JSON.stringify(ast));
        fs.writeFileSync("json.json", JSON.stringify(ast));
        gener(ast);
    });