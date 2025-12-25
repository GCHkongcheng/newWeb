// 显示关于页面
exports.showAbout = async (req, res, next) => {
  try {
    res.render("about/index", {
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
};
