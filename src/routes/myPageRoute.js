var express = require("express");
var router = express.Router();

const myPageController = require("../controllers/myPageController");

//페이지
router.get("/", myPageController.mypage);

//카드 추가
router.post("/addCard", myPageController.addCard);
//카드 수정
// router.patch('/updateCard', myPageContoller.updateCard);
//카드 삭제
router.delete("/deleteCard/:card_num", myPageController.deleteCard);

//주소 추가
router.post("/addAddress", myPageController.addAddress);
//주소 수정
// router.patch('/updateAddress', myPageController.updateAddress);
//주소 삭제
router.delete("/deleteAddress/:address_id", myPageController.deleteAddress);

module.exports = router;
