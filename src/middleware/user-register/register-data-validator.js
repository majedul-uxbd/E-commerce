const validateUserInput = async (req, res, next) => {
  const { username, email, password } = req.body;
  if (!username || typeof username !== "string" || username.length < 3) {
    return res.status(400).send({
      status: "failed",
      message: "Invalid or missing username",
    });
  }
  if (
    !email ||
    typeof email !== "string" ||
    !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)
  ) {
    return res.status(400).send({
      status: "failed",
      message: "Invalid or missing email",
    });
  }
  if (!password || typeof password !== "string" || password.length < 6) {
    return res.status(400).send({
      status: "failed",
      message: "Invalid or missing password",
    });
  }
  next();
};

module.exports = { validateUserInput };
