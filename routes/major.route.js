const express = require("express");
const majorController = require("../controllers/major.controller");

const router = express.Router();

router.get("/", majorController.getMajors);
router.post("/", majorController.createMajor);
router.delete("/", majorController.deleteMajor);
router.put("/", majorController.updateMajor);
router.get("/search", majorController.searchMajor);
router.get("/params", majorController.getMajorWithParams);
module.exports = router;
