const OrderModel = require('../models/order');
const UserModel = require('../models/user');
const { sendKafkaMessage } = require('../kafka/producer');
const _const = require('../config/constant')
const jwt = require('jsonwebtoken');

const orderController = {
    getAllOrder: async (req, res) => {
        try {
            const page = req.body.page || 1;
            const limit = req.body.limit || 10;

            const options = {
                page: page,
                limit: limit,
                populate: 'user'
            };

            const orderList = await OrderModel.paginate({}, options);
            res.status(200).json({ data: orderList });
        } catch (err) {
            res.status(500).json(err);
        }
    },

    getOrderById: (req, res) => {
        try {
            res.status(200).json(res.order);
        } catch (err) {
            res.status(500).json(err);
        }
    },

    createOrder: async (req, res) => {
        try {
            const order = new OrderModel({
                user: req.body.userId,
                products: req.body.products,
                description: req.body.description,
                orderTotal: req.body.orderTotal,
                billing: req.body.billing,
                address: req.body.address,
                status: req.body.status,
            });
            const user = await UserModel.findById(req.body.userId);
            console.log(user);
            const email = user.email;
            const message = `<div style="background-color: #f2f2f2; padding: 20px;">
            <h1 style="color: #007bff;">Xác nhận đơn hàng đặt thành công</h1>
            <p style="font-size: 16px; color: #333;">Cảm ơn bạn đã sử dụng dịch của chúng tôi sau đây là 1 tóm tắt ngắng về đơn hàng</p>
            <ul style="list-style: none; padding: 0;">
                <li style="color: green;">Tổng đơn hàng:${req.body.orderTotal}</li>
                <li style="color: red;">Địa chỉ nhận hàng:${req.body.address}</li>
                <li style="color: blue;"Hình thức nhận hàng: COD</li>
            </ul>
        </div>`;
            // Gửi thông báo Kafka
            await sendKafkaMessage(email, message);

            const orderList = await order.save();
            res.status(200).json(orderList);


        }
        catch (err) {
            res.status(500).json(err);
        }
    },

    deleteOrder: async (req, res) => {
        try {
            const orderList = await OrderModel.findByIdAndDelete(req.params.id);
            if (!orderList) {
                return res.status(200).json("Order does not exist");
            }
            res.status(200).json("Delete order success");
        } catch (err) {
            res.status(500).json(err);
        }
    },

    updateOrder: async (req, res) => {
        const id = req.params.id;
        const { user, products, address, orderTotal, billing, description, status } = req.body;

        try {
            const orderList = await OrderModel.findByIdAndUpdate(id, { status, description, address }, { new: true });
            if (!orderList) {
                return res.status(404).json({ message: 'Order not found' });
            }
            res.status(200).json(orderList);
        } catch (err) {
            res.status(500).json(err);
        }
    },

    searchOrderByName: async (req, res) => {
        const page = req.body.page || 1;
        const limit = req.body.limit || 10;

        const options = {
            page: page,
            limit: limit,
        };

        const name = req.query.name;

        try {
            const orderList = await OrderModel.paginate({ billing: { $regex: `.*${name}.*`, $options: 'i' } }, options);

            res.status(200).json({ data: orderList });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },

    getOrderByUser: async (req, res) => {
        try {
            const decodedToken = jwt.verify(req.headers.authorization, _const.JWT_ACCESS_KEY);
            const orders = await OrderModel.find({ user: decodedToken.user._id });
            res.status(200).json({data: orders});
          } catch (err) {
            res.status(401).send('Unauthorized');
          }
    }
}

module.exports = orderController;