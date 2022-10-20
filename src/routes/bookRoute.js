var express = require("express");
var router = express.Router();

const bookController = require("../controllers/bookController");
//도서 추가
// router.post('/addBook', bookController.addBook);

//도서 삭제
// router.delete('deleteBook', bookController.deleteBook);

//도서 목록
// router.get('/', bookController.bookList);

//도서 상세
router.post("/bookDetail/:book_id", bookController.bookDetail);

module.exports = router;
