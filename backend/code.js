const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question("Enter first number: ", (a) => {
  rl.question("Enter second number: ", (b) => {
    console.log("Sum =", Number(a) + Number(b));
    rl.close();
  });
});
