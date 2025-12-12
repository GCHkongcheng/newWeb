// 显示关于页面
exports.showAbout = async (req, res) => {
  try {
    res.render("about/index", {
      user: req.session.userId
        ? {
            username: req.session.username,
            userId: req.session.userId,
            isAdmin: req.session.isAdmin || false,
          }
        : null,
    });
  } catch (error) {
    console.error("显示关于页面错误:", error);
    res.status(500).render("error", {
      message: "加载关于页面失败",
      error: error,
      user: req.session.userId
        ? {
            username: req.session.username,
            isAdmin: req.session.isAdmin || false,
          }
        : null,
    });
  }
};
