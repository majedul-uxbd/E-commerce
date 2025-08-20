const express = require("express");
const jwtAuth = require("../middleware/jwtAuth");
const { registerCustomer } = require("../main/customers/add-customer");
const { getAllCustomers } = require("../main/customers/get-all-customers");
const { getCustomerDetails } = require("../main/customers/get-customer-details");
const { updateCustomer } = require("../main/customers/update-customer");
const { deleteCustomer } = require("../main/customers/delete-customer");
const adminAuth = require("../middleware/adminAuth");

const customerRouter = express.Router();

customerRouter.post("/create", async (req, res) => {
    registerCustomer(req.body)
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


customerRouter.get("/", jwtAuth, adminAuth, async (req, res) => {
    const requestData = {
        user: req.user
    };

    getAllCustomers(requestData)
        .then((data) => {
            return res.status(200).send({
                status: data.status,
                message: data.message,
                customers: data.customers,
            });
        })
        .catch((error) => {
            return res.status(400).send({
                status: error.status,
                message: error.message,
            });
        });
});


customerRouter.post("/get-customer-details", jwtAuth, adminAuth, async (req, res) => {
    const requestData = {
        customerId: req.body.customerId,
        user: req.user
    };

    getCustomerDetails(requestData)
        .then((data) => {
            return res.status(200).send({
                status: data.status,
                message: data.message,
                customer: data.customer,
            });
        })
        .catch((error) => {
            return res.status(400).send({
                status: error.status,
                message: error.message,
            });
        });
});

customerRouter.post("/update-customer", jwtAuth, adminAuth, async (req, res) => {
    const { customerId, ...updateData } = req.body;
    const requestData = {
        customerId: customerId,
        updateData: updateData,
        user: req.user
    };

    updateCustomer(requestData)
        .then((data) => {
            return res.status(200).send({
                status: data.status,
                message: data.message,
                customer: data.customer,
            });
        })
        .catch((error) => {
            return res.status(400).send({
                status: error.status,
                message: error.message,
            });
        });
});

customerRouter.post("/delete-customer", jwtAuth, adminAuth, async (req, res) => {
    const requestData = {
        customerId: req.body.customerId,
        user: req.user
    };

    deleteCustomer(requestData)
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

module.exports = customerRouter;
