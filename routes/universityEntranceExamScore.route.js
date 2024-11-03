const express = require("express");
const universityEntranceExamScoreController = require("../controllers/universityEntranceExamScore.controller");

const router = express.Router();

router.get(
  "/",
  universityEntranceExamScoreController.getUniversityEntranceExamScore
);
router.post(
  "/",
  universityEntranceExamScoreController.createUniversityEntranceExamScore
);
router.delete(
  "/",
  universityEntranceExamScoreController.deleteUniversityEntranceExamScore
);
router.put(
  "/update/:id",
  universityEntranceExamScoreController.updateUniversityEntranceExamScore
);
router.get(
  "/panigation",
  universityEntranceExamScoreController.getUniversityEntranceExamScoreWithPagination
);
module.exports = router;
