const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

exports.register = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = new User({ username, password });
    await user.save();
    res.json({ message: "Đăng ký thành công" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Lỗi đăng ký người dùng" });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res
        .status(401)
        .json({ message: "Tên đăng nhập hoặc mật khẩu không đúng" });
    }
    const isCorrectPassword = await bcrypt.compare(password, user.password);
    if (!isCorrectPassword) {
      return res
        .status(401)
        .json({ message: "Tên đăng nhập hoặc mật khẩu không đúng" });
    }
    const token = jwt.sign({ username }, "secret_key");
    res.json({ message: "Đăng nhập thành công", token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Lỗi đăng nhập người dùng" });
  }
};
