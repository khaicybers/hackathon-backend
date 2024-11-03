const Major = require("../models/Major");
const NodeCache = require("node-cache");
const cache = new NodeCache();

exports.getMajors = async (req, res) => {
  const cachedMajors = cache.get("majors");
  if (cachedMajors) {
    return res.send(cachedMajors);
  }
  const majors = await Major.find();
  cache.set("majors", majors, 300);

  res.send(majors);
};
exports.createMajor = async (req, res) => {
  try {
    const existingMajor = await Major.findOne({
      majorName: req.body.majorName,
    });

    if (existingMajor) {
      return res.status(400).send("Chuyên ngành đã tồn tại");
    }

    const newMajor = new Major({
      majorName: req.body.majorName,
    });
    await newMajor.save();
    res.send(newMajor);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};
exports.deleteMajor = async (req, res) => {
  try {
    const major = await Major.findById(req.query.id);
    if (!major) {
      return res.status(404).send("Chuyên ngành không tồn tại");
    }
    await major.deleteOne();
    cache.del(req.query.id);
    res.send("Xóa chuyên ngành thành công");
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

exports.updateMajor = async (req, res) => {
  try {
    const { id } = req.query;
    const { majorName } = req.body;

    const existingMajor = await Major.findOne({ majorName });
    if (existingMajor && existingMajor._id.toString() !== id) {
      return res.status(400).send("Chuyên ngành đã tồn tại");
    }

    const major = await Major.findByIdAndUpdate(
      id,
      { majorName },
      { new: true }
    );
    cache.set(id, major);

    if (!major) {
      return res.status(404).send("Chuyên ngành không tồn tại");
    }

    res.send(major);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};
exports.searchMajor = async (req, res) => {
  const searchText = req.query.search;
  try {
    const major = await Major.find({
      $or: [{ majorName: { $regex: searchText, $options: "i" } }],
    });
    res.send(major);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};
exports.getMajorWithParams = async (req, res) => {
  const id = req.query.id;
  try {
    const skipIndex = req.params.skipIndex || id;
    const limitIndex = req.params.limitIndex || 10;

    const majors = await Major.find()
      .sort({ _id: -1 })
      .skip(parseInt(skipIndex))
      .limit(parseInt(limitIndex));

    res.send(majors);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};
