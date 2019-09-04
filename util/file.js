const fs = require('fs');

const deleteFile = filePath => {
  fs.unlink(filePath, err => {
    if (err) {
      return;
    }
  });
};

exports.deleteFile = deleteFile;
