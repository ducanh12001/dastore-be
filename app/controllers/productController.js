const ProductModel = require('../models/product');
const CategoryModel = require('../models/category');
const ReviewModel = require('../models/review');
const OrderModel = require('../models/order');
const jwt = require('jsonwebtoken');
const _const = require('../config/constant')

const productController = {
    getAllProduct: async (req, res) => {
        const page = req.body.page || 1;
        const limit = req.body.limit || 10;

        const options = {
            page: page,
            limit: limit,
            populate: 'category'
        };

        try {
            const products = await ProductModel.paginate({}, options);
            res.status(200).json({ data: products });
        } catch (err) {
            res.status(500).json(err);
        }
    },

    getProductById: (req, res) => {
        try {
            res.status(200).json(res.product);
        } catch (err) {
            res.status(500).json(err);
        }
    },

    createProduct: async (req, res) => {
        const product = new ProductModel({
            name: req.body.name,
            price: req.body.price,
            description: req.body.description,
            category: req.body.category,
            image: req.body.image,
            category: req.body.category,
            promotion: req.body.promotion,
            quantity: req.body.quantity
        });

        try {
            const checkCategory = await CategoryModel.findById(req.body.category);
            if (!checkCategory) {
                return res.status(400).json({ error: 'Invalid category' });
            }
            const newProduct = await product.save();
            res.status(200).json(newProduct);
        }
        catch (err) {
            res.status(500).json(err);
        }
    },

    deleteProduct: async (req, res) => {
        try {
            const product = await ProductModel.findByIdAndDelete(req.params.id);
            if (!product) {
                return res.status(200).json("Product does not exist");
            }
            res.status(200).json("Delete product success");
        } catch (err) {
            res.status(500).json(err);
        }
    },

    updateProduct: async (req, res) => {
        const id = req.params.id;
        const { name, price, description, category, image, promotion, quantity } = req.body;

        try {
            const product = await ProductModel.findByIdAndUpdate(id, { name, price, description, quantity, category, image, promotion }, { new: true });
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }
            res.status(200).json(product);
        } catch (err) {
            res.status(500).json(err);
        }
    },

    searchCateByName: async (req, res) => {
        const page = req.body.page || 1;
        const limit = req.body.limit || 10;

        const options = {
            page: page,
            limit: limit,
        };

        const name = req.query.name;

        try {
            const productList = await ProductModel.paginate({ name: { $regex: `.*${name}.*`, $options: 'i' } }, options);

            res.status(200).json({ data: productList });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },

    createReviews: async (req, res) => {
        try {
            const { comment, rating } = req.body;
            const { user } = req;
            const productId = req.params.id;
            const decodedToken = jwt.verify(req.headers.authorization, _const.JWT_ACCESS_KEY);
            console.log(user);
            // Kiểm tra xem người dùng đã đặt sản phẩm này chưa
            const order = await OrderModel.findOne({ user: decodedToken.user._id, "products.product": productId });
            if (!order) {
              return res.status(400).send('You have not purchased this product');
            }
        
            // Kiểm tra xem người dùng đã đánh giá sản phẩm này chưa
            const existingReview = await ReviewModel.findOne({ user: user._id, product: productId });
            if (existingReview) {
              return res.status(400).send('You have already reviewed this product');
            }
        
            // Tạo mới đánh giá sản phẩm
            const review = new ReviewModel({ user: user._id, product: productId, comment, rating });
            await review.save();
        
            res.status(201).send('Review created');
          } catch (error) {
            console.error(error);
            res.status(500).send('Server error');
          }
    },
}

module.exports = productController;