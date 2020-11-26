let express = require('express');
let router = express.Router();
const FileController = require('./controllers/fileController');

router.post('/files/uploadfile', [
  FileController.uploadFile
]);

module.exports = router;
