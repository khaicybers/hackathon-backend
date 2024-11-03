const express = require("express");
const universityController = require("../controllers/university.controller");
const router = express.Router();

router.get("/", universityController.getUniversities);
router.get(
  "/v1/admission-information",
  universityController.getUniversitiesWithAdmissionInformation
);
router.get("/v1/name", universityController.getUniversitiesName);
router.get("/search", universityController.searchUniversity);
router.get("/:id", universityController.getUniversityById);
router.post("/", universityController.createUniversity);
router.delete("/", universityController.deleteUniversity);
router.post("/suggest", universityController.getMatchingUniversities);
router.put("/update/:id", universityController.updateUniversity);
/* router.get(
  "/code/:universityCode",
  universityController.searchUniversityByCode
); */

/* router.get("/universities", universityController.getUniversitiesWithPagination); */
module.exports = router;
