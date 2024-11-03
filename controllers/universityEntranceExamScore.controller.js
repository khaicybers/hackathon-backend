const UniversityEntranceExamScore = require("../models/UniversityEntranceExamScore");

exports.getUniversityEntranceExamScore = async (req, res) => {
  const universities = await UniversityEntranceExamScore.find();
  res.send(universities);
};
exports.createUniversityEntranceExamScore = async (req, res) => {
  try {
    const universityCode = req.body.universityCode;
    const majorName = req.body.majorName;
    const majorYear = req.body.majorYear;

    // Kiểm tra xem ngành đã có bao nhiêu năm được tạo
    const scores = await UniversityEntranceExamScore.find({
      universityCode: universityCode,
      majorName: majorName,
    });

    const numYears = scores.length;

    // Kiểm tra xem năm hiện tại đã được tạo chưa
    const existingScore = await UniversityEntranceExamScore.findOne({
      universityCode: universityCode,
      year: majorYear,
      majorName: majorName,
    });

    if (existingScore) {
      return res.status(400).send("Năm đã tồn tại trong hệ thống");
    }

    if (numYears >= 3) {
      return res.status(400).send("Ngành này đã có đầy đủ thông tin");
    }

    // Nếu không có lỗi, tạo đối tượng mới
    const newScore = new UniversityEntranceExamScore({
      universityCode: universityCode,
      majorName: majorName,
      year: majorYear,
      universityEntranceExamScore: {
        subjectGroup: req.body.subjectGroup,
        scores: req.body.score.scores,
        majorCode: req.body.score.majorCode,
      },
    });

    await newScore.save();
    res.send(newScore);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};
exports.deleteUniversityEntranceExamScore = async (req, res) => {
  try {
    const deletedUniversityEntranceExamScore =
      await UniversityEntranceExamScore.findById(req.query.id);
    await deletedUniversityEntranceExamScore.deleteOne();
    res.send("Xóa trường thành công");
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};
exports.updateUniversityEntranceExamScore = async (req, res) => {
  try {
    const universityId = req.params.id;

    const universityCode = req.body.universityCode;
    const majorName = req.body.majorName;
    const majorYear = req.body.majorYear;

    const updatedUniversityEntranceExamScore =
      await UniversityEntranceExamScore.findById(universityId);

    if (!updatedUniversityEntranceExamScore) {
      return res.status(404).send("University not found");
    }

    // Kiểm tra xem năm hiện tại đã được tạo chưa
    if (majorYear === updatedUniversityEntranceExamScore.year) {
      const updatedUniversity =
        await UniversityEntranceExamScore.findByIdAndUpdate(
          universityId,
          {
            universityCode: universityCode,
            majorName: majorName,
            universityEntranceExamScore: {
              subjectGroup: req.body.subjectGroup,
              scores: req.body.score.scores,
              majorCode: req.body.majorCode,
            },
          },
          { new: true }
        );

      await updatedUniversity.save();
      res.send(updatedUniversity);
    } else {
      const existingScore = await UniversityEntranceExamScore.findOne({
        universityCode: universityCode,
        year: majorYear,
        majorName: majorName,
      });

      if (existingScore) {
        return res.status(400).send("Năm đã tồn tại trong hệ thống");
      }

      const updatedUniversity =
        await UniversityEntranceExamScore.findByIdAndUpdate(
          universityId,
          {
            universityCode: universityCode,
            majorName: majorName,
            year: majorYear,
            universityEntranceExamScore: {
              subjectGroup: req.body.subjectGroup,
              scores: req.body.score.scores,
              majorCode: req.body.majorCode,
            },
          },
          { new: true }
        );

      await updatedUniversity.save();
      res.send(updatedUniversity);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

exports.getUniversityEntranceExamScoreWithPagination = async (req, res) => {
  const { pageSize, currentPage } = req.query;
  const limit = parseInt(pageSize);
  const skip = (parseInt(currentPage) - 1) * limit;

  try {
    const universitiesEntranceExamScore =
      await UniversityEntranceExamScore.find().skip(skip).limit(limit);
    const total = await UniversityEntranceExamScore.countDocuments();

    res.status(200).json({
      universitiesEntranceExamScore,
      total,
      currentPage: parseInt(currentPage),
      pageSize: parseInt(pageSize),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
