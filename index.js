const express = require("express");
const initAPIs = require("./src/routes/api");

const app = express();
const port = 2000;

// Cho phép các api của ứng dụng xử lý dữ liệu từ body của request
app.use(express.json());

// Khởi tạo các routes cho ứng dụng
initAPIs(app);

app.listen(port, () => {
  console.log(`Hello from server, I'm running at localhost: ${port}`);
});
