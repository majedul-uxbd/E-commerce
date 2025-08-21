const express = require("express");
const jwtAuth = require("../middleware/jwtAuth");

const cardRouter = express.Router();

cardRouter.post("/", jwtAuth, async (req, res) => {
    const requestData = {
        cardData: req.body,
        user: req.user
    };

    addCard(requestData)
        .then((data) => {
            return res.status(200).send({
                status: data.status,
                message: data.message,
                card: data.card,
            });
        })
        .catch((error) => {
            return res.status(400).send({
                status: error.status,
                message: error.message,
            });
        });
});

module.exports = cardRouter;