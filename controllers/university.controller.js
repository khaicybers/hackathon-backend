const University = require("../models/University");
const UniversityEntranceExamScore = require("../models/UniversityEntranceExamScore");
const NodeCache = require("node-cache");
const cache = new NodeCache();

exports.getUniversities = async (req, res) => {
  const { pageSize, currentPage } = req.query;
  const limit = parseInt(pageSize);
  const skip = (parseInt(currentPage) - 1) * limit;

  try {
    const universities = await University.find().skip(skip).limit(limit);
    const total = await University.countDocuments();

    const universityCode = universities.map(
      (university) => university.universityCode
    );
    const universityEntranceExamScores =
      await UniversityEntranceExamScore.aggregate([
        { $match: { universityCode: { $in: universityCode } } },
        {
          $group: {
            _id: { universityCode: "$universityCode", majorName: "$majorName" },
          },
        },
        {
          $project: {
            _id: 0,
            universityCode: "$_id.universityCode",
            majorName: "$_id.majorName",
          },
        },
      ]);

    res.status(200).json({
      universities,
      total,
      universityEntranceExamScores,
      currentPage: parseInt(currentPage),
      pageSize: parseInt(pageSize),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUniversitiesName = async (req, res) => {
  try {
    const cachedResult = cache.get("universities");
    if (cachedResult) {
      return res.send(cachedResult);
    }
    const universities = await University.find().select(
      "_id universityName universityCode"
    );
    cache.set("universities", universities, 300);
    res.send(universities);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
};
exports.createUniversity = async (req, res) => {
  try {
    const existingUniversity = await University.findOne({
      $or: [{ universityName: req.body.universityName }],
    });

    if (existingUniversity) {
      return res.status(400).send("Trường đại học đã tồn tại");
    }

    const newUniversity = new University({
      universityCode: req.body.universityCode,
      universityLogo: req.body.logo,
      universityName: req.body.universityName,
      admissionInformation: req.body.admissionInformation,
      address: req.body.address,
      website: req.body.website,
      image: req.body.image,
    });

    await newUniversity.save();
    cache.del("universities");
    const universities = await University.find().select("_id name description");
    cache.set("universities", universities, 300);
    res.send(newUniversity);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};
exports.deleteUniversity = async (req, res) => {
  try {
    const deletedUniversity = await University.findById(req.query.id);
    await deletedUniversity.deleteOne();
    const universities = await University.find().select("_id name description");
    cache.del("universities");
    cache.set("universities", universities, 300);
    res.send("Xóa trường thành công");
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

exports.searchUniversity = async (req, res) => {
  const searchText = req.query.search;
  try {
    const universities = await University.find(
      {
        $or: [
          { universityName: { $regex: searchText, $options: "i" } },
          { universityCode: { $regex: searchText, $options: "i" } },
        ],
      },
      { _id: 1, universityName: 1, universityCode: 1 }
    );
    res.send(universities);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};
exports.getUniversityById = async (req, res) => {
  try {
    const universityId = req.params.id;
    const university = await University.findById(universityId);
    if (!university) {
      return res.status(404).send("University not found");
    }
    res.send(university);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

exports.updateUniversity = async (req, res) => {
  try {
    const universityId = req.params.id;

    const updatedUniversity = await University.findByIdAndUpdate(
      universityId,
      {
        universityCode: req.body.universityCode,
        universityLogo: req.body.logo,
        universityName: req.body.universityName,
        admissionInformation: req.body.admissionInformation,
        address: req.body.address,
        website: req.body.website,
        image: req.body.image,
      },
      { new: true }
    );
    if (!updatedUniversity) {
      return res.status(404).send("University not found");
    }
    cache.del("universities");
    const universities = await University.find().select("_id name description");
    cache.set("universities", universities, 300);
    res.send(updatedUniversity);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

exports.getMatchingUniversities = async (req, res) => {
  const { subjectGroup, majorName, city } = req.body;

  try {
    const matchingScores = await UniversityEntranceExamScore.find({
      majorName: majorName.trim(),
    });

    const universityCodes = matchingScores.map((score) => score.universityCode);
    const universities = await University.find({
      universityCode: { $in: universityCodes },
      address: { $regex: new RegExp(city, "i") },
    });

    const result = universities.map((university) => {
      return {
        universityCode: university.universityCode,
        universityName: university.universityName,
        majorName: majorName,
        id: university._id,
      };
    });

    const result2 = {};

    matchingScores.forEach((score) => {
      const { universityCode, year, universityEntranceExamScore } = score;
      const { majorCode } = universityEntranceExamScore;

      if (!result2[universityCode]) {
        result2[universityCode] = {
          majorCode: majorCode,
          scores2020: "-",
          scores2021: "-",
          scores2022: "-",
        };
      }
      switch (year) {
        case 2020:
          result2[universityCode].scores2020 =
            score.universityEntranceExamScore.scores;
          break;
        case 2021:
          result2[universityCode].scores2021 =
            score.universityEntranceExamScore.scores;
          break;
        case 2022:
          if (result2[universityCode]) {
            result2[universityCode].scores2022 =
              score.universityEntranceExamScore.scores;
          }
          break;
        default:
          break;
      }
    });

    const test = result.reduce((acc, item) => {
      const { universityCode } = item;
      const obj = result2[universityCode];

      if (obj) {
        acc.push({
          ...item,
          scores: obj,
        });
      }
      return acc;
    }, []);

    res.status(200).json(test);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getUniversitiesWithAdmissionInformation = async (req, res) => {
  const id = req.query.id;
  const name = req.query.name;

  if (id) {
    try {
      const skipIndex = req.params.skipIndex || id;
      const limitIndex = req.params.limitIndex || 5;

      const universities = await University.find(
        {
          admissionInformation: { $exists: true, $ne: "" },
        },
        {
          universityName: 1,
          universityLogo: 1,
          admissionInformation: 1,
          universityCode: 1,
          address: 1,
        }
      )
        .skip(skipIndex)
        .limit(limitIndex);

      res.send(universities);
    } catch (error) {
      console.error(error);
      res.status(500).send("Server Error");
    }
  }
  if (name) {
    try {
      const universities = await University.find(
        { universityName: name },
        {
          universityName: 1,
          universityLogo: 1,
          admissionInformation: 1,
          universityCode: 1,
          address: 1,
        }
      );

      res.send(universities);
    } catch (error) {
      console.error(error);
      res.status(500).send("Server Error");
    }
  }
};
