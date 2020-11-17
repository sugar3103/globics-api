const app = require("./app");

const port = 2000;

app.listen(port, () => {
  console.log(`Hello from server, I'm running at localhost: ${port}`);
});
