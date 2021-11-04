const router = require("express").Router();

router.get("/", (req, res) => {
  res.status(200).json({ success: true, msg: "bootcamp from router" });
});

router.post("/:id", (req, res) => {
  res.status(200).json({ success: true, msg: `${req.params.id}` });
});

module.exports = router;
