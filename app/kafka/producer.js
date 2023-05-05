const { Kafka } = require('kafkajs');

// Tạo kết nối Kafka
const kafka = new Kafka({
  clientId: 'first_topic',
  brokers: ['localhost:9092'],
});

// Tạo producer
const producer = kafka.producer();

// Gửi thông báo Kafka
async function sendKafkaMessage(email, message) {
  try {
    console.log("đã vô senkafka");
    await producer.connect();
    await producer.send({
      topic: 'first_topic',
      messages: [
        {
          value: JSON.stringify({ email: email, message: message }),
        },
      ],
    });
  } catch (err) {
    console.error(err);
  } finally {
    await producer.disconnect();
  }
}

module.exports = { sendKafkaMessage };