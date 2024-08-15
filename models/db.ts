//nhúng thư viện mongo đã cài vào
const { MongoClient } = require('mongodb');
const url = "mongodb://localhost:27017";
// khai báo tên db
const dbName = 'bookshop';
// hàm kết nối
async function connectDb() {
 const client = new MongoClient(url);
 await client.connect();
 console.log('Kết nối thành công đến server');
 return client.db(dbName);
}
module.exports = connectDb