const validateLoginInput = async (req, res, next) => {
    const { username, password } = req.body;

    if (!username || typeof username !== "string" || username.length < 3) {
        return res.status(400).send({
            status: "failed",
            message: "Invalid or missing username",
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

module.exports = { validateLoginInput };
