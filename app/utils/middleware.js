'use strict';

const jwt = require('jsonwebtoken');
const _const = require('../config/constant');
const Category = require('../models/category');
const Product = require('../models/product');
const Order = require('../models/order');
const News = require('../models/news');

module.exports = {
    checkLogin: (req, res, next) => {
        const token = req.header('Authorization');
        if (!token) return res.status(401).send('Access Denied');

        try {
            const verified = jwt.verify(token, _const.JWT_ACCESS_KEY);
            next();
        } catch (err) {
            return res.status(400).send('Invalid Token');
        }
    },

    getCategory: async (req, res, next) => {
        let category;
        try {
            category = await Category.findById(req.params.id);
            if (category == null) {
                return res.status(404).json({ message: 'Cannot find category' });
            }
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }

        res.category = category;
        next();
    },

    getProduct: async (req, res, next) => {
        let product;
        try {
            product = await Product.findById(req.params.id).populate('category');
            if (product == null) {
                return res.status(404).json({ message: 'Cannot find product' });
            }
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }

        res.product = product;
        next();
    },

    getNews: async (req, res, next) => {
        let news;
        try {
            news = await News.findById(req.params.id);
            if (news == null) {
                return res.status(404).json({ message: 'Cannot find news' });
            }
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }

        res.news = news;
        next();
    },

    getOrder: async (req, res, next) => {
        let order;
        try {
            order = await Order.findById(req.params.id);
            if (order == null) {
                return res.status(404).json({ message: 'Cannot find order' });
            }
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }

        res.order = order;
        next();
    },

    checkRole: (role) => async (req, res, next) => {
        if (req.user.role !== role) {
            return res.status(403).send('Forbidden');
        }
        next();
    }
}