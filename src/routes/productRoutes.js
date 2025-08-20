const express = require("express");
const jwtAuth = require("../middleware/jwtAuth");
const { addProduct } = require("../main/products/add-product");
const { getAllProducts } = require("../main/products/get-all-products");
const { getProductDetails } = require("../main/products/get-product-details");
const { updateProduct } = require("../main/products/update-product");

const productRouter = express.Router();

productRouter.post("/create", jwtAuth, async (req, res) => {
    const requestData = {
        productData: req.body,
        user: req.user
    };

    addProduct(requestData)
        .then((data) => {
            return res.status(200).send({
                status: data.status,
                message: data.message,
            });
        })
        .catch((error) => {
            return res.status(400).send({
                status: error.status,
                message: error.message,
            });
        });
});

productRouter.get("/", jwtAuth, async (req, res) => {
    const requestData = {
        user: req.user
    };

    getAllProducts(requestData)
        .then((data) => {
            return res.status(200).send({
                status: data.status,
                message: data.message,
                products: data.products,
            });
        })
        .catch((error) => {
            return res.status(400).send({
                status: error.status,
                message: error.message,
            });
        });
});

productRouter.post("/get-product-details", jwtAuth, async (req, res) => {
    const requestData = {
        productId: req.body.productId,
        user: req.user
    };

    getProductDetails(requestData)
        .then((data) => {
            return res.status(200).send({
                status: data.status,
                message: data.message,
                product: data.product,
            });
        })
        .catch((error) => {
            return res.status(400).send({
                status: error.status,
                message: error.message,
            });
        });
});

productRouter.post("/update-product", jwtAuth, async (req, res) => {
    const { productId, ...updateData } = req.body;
    const requestData = {
        productId: productId,
        updateData: updateData,
        user: req.user
    };

    updateProduct(requestData)
        .then((data) => {
            return res.status(200).send({
                status: data.status,
                message: data.message,
                product: data.product,
            });
        })
        .catch((error) => {
            return res.status(400).send({
                status: error.status,
                message: error.message,
            });
        });
});


module.exports = productRouter;
