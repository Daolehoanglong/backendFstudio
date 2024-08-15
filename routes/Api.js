var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const app = express();
const multer = require('multer');
const jwt = require('jsonwebtoken')
const session = require('express-session');
const nodemailer = require("nodemailer");
const crypto = require('crypto');

//Thiết lập nơi lưu trữ và tên file
let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})
//Kiểm tra file upload
function checkFileUpLoad(req, file, cb) {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return cb(new Error('Bạn chỉ được upload file ảnh'));
  }
  cb(null, true);
}
//Upload file
// let upload = multer({ storage: storage, fileFilter: checkFileUpLoad });

let upload = multer({
  storage: storage,
  fileFilter: checkFileUpLoad,
  fieldName: "img" // Add this line to specify the field name
});



const connectDb = require('../dist/models/db')
// start show
router.get('/products', async (req, res, next) => {
  const db = await connectDb()
  const productCollection = db.collection('products')
  const products = await productCollection.find().toArray()
  if (products) {
    res.status(200).json(products)
  } else {
    res.status(404).json({ message: 'not found' })
  }
});

router.get('/categories', async (req, res, next) => {
  const db = await connectDb()
  const categoryCollection = db.collection('categories')
  const categories = await categoryCollection.find().toArray()
  if (categories) {
    res.status(200).json(categories)
  } else {
    res.status(404).json({ message: 'not found' })
  }
});
router.get('/user', async (req, res, next) => {
  const db = await connectDb()
  const UserCollection = db.collection('user')
  const Users = await UserCollection.find().toArray()
  if (Users) {
    res.status(200).json(Users)
  } else {
    res.status(404).json({ message: 'not found' })
  }
});
router.get('/user/:email', async (req, res, next) => {
  const email = req.params.email
  console.log(email);
  const db = await connectDb()
  const UserCollection = db.collection('user')
  const User = await UserCollection.findOne({ email: email });
  console.log(User);
  if (User) {
    res.status(200).json(User)
  } else {
    res.status(404).json({ message: 'not found' })
  }
});
router.get('/products/search/:keyword', async (req, res, next) => {
  const keyword = req.params.keyword
  const db = await connectDb()
  const productCollection = db.collection('products')
  const products = await productCollection.find({ name: { $regex: `.*${keyword}` } }).toArray()
  if (products) {
    res.status(200).json(products)
  } else {
    res.status(404).json({ message: 'not found' })
  }
})
// end show
// Show theo ma danh muc

// Show theo hot
router.get('/products/hot', async (req, res, next) => {
  const db = await connectDb()
  const productCollection = db.collection('products')
  const product = await productCollection.find({ hot: 1 }).toArray()
  if (product) {
    res.status(200).json(product)
  } else {
    res.status(404).json({ message: "loi roi kia" })
  }
}
);

// end show theo ma danh muc
// start add
router.post('/products', upload.single('img'), async (req, res) => {
  let { name, price, categoryId, description , img  } = req.body
  // var img = req.file.originalname
  const db = await connectDb()
  const productCollection = db.collection('products')
  // lấy sản phẩm có id cao nhất bằng cách sắp xếp giảm dần (-1) và lấy 1
  let lastProduct = await productCollection.find().sort({ id: -1 }).toArray()
  // kiểm tra có lastProduct không ? nếu có id + 1
  //nếu không có thì không có sản phẩm nào cả thì id sẽ = 1
  let id = lastProduct[0] ? lastProduct[0].id + 1 : 1
  let newProduct = { id, name, price, categoryId, img, description }
  await productCollection.insertOne(newProduct)
  if (newProduct) {
    res.status(200).json(newProduct)
  } else {
    res.status(404).json({ message: 'not found' })
  }
})

router.post('/categories', upload.single('img'), async (req, res) => {
  let { name } = req.body
  // let img = req.file.originalname
  const db = await connectDb()
  const categoriesCollection = db.collection('categories')
  // lấy sản phẩm có id cao nhất bằng cách sắp xếp giảm dần (-1) và lấy 1
  let lastcategories = await categoriesCollection.find().sort({ id: -1 }).toArray()
  // kiểm tra có lastcategories không ? nếu có id + 1
  //nếu không có thì không có sản phẩm nào cả thì id sẽ = 1
  let id = lastcategories[0] ? lastcategories[0].id + 1 : 1
  let newcategories = { id, name }
  await categoriesCollection.insertOne(newcategories)
  if (newcategories) {
    res.status(200).json(newcategories)
  } else {
    res.status(404).json({ message: 'not found' })
  }
})

router.post('/user', upload.single('img'), async (req, res) => {
  let { fullname, pass, email } = req.body
  let img = req.file.originalname
  let isAdmin = 1
  const db = await connectDb()
  const userCollection = db.collection('user')
  // lấy sản phẩm có id cao nhất bằng cách sắp xếp giảm dần (-1) và lấy 1
  let lastUser = await userCollection.find().sort({ id: -1 }).toArray()
  // kiểm tra có lastProduct không ? nếu có id + 1
  //nếu không có thì không có sản phẩm nào cả thì id sẽ = 1
  let id = lastUser[0] ? lastUser[0].id + 1 : 1
  let newUser = { id, fullname, pass, email, isAdmin, img }
  await userCollection.insertOne(newUser)
  if (newUser) {
    res.status(200).json(newUser)
  } else {
    res.status(404).json({ message: 'not found' })
  }
})
// end add

// start edit
router.put('/products/:id', upload.single('img'), async (req, res) => {
  let id = req.params.id
  const db = await connectDb()
  const productCollection = db.collection('products')
  let { name, price, categoryId, description , img } = req.body
  // if (req.file) {
  //   var img = req.file.originalname
  // } else {
  //   let product = await productCollection.findOne({ id: parseInt(id) })
  //   var img = product.img
  // }
  let editProduct = { name, price, categoryId, img, description }
  await productCollection.updateOne({ id: parseInt(id) }, { $set: editProduct })
  if (editProduct) {
    res.status(200).json(editProduct)
  } else {
    res.status(404).json({ message: 'not found' })
  }
});

router.put('/categories/:id', upload.single('img'), async (req, res) => {
  const db = await connectDb()
  const categoryCollection = db.collection('categories')
  let id = req.params.id
  let { name } = req.body
  // if (req.file) {
  //   var img = req.file.originalname
  // } else {
  //   let categories = await categoriesCollection.findOne({ id: parseInt(id) })
  //   var img = categories.img
  // }
  let editcategory = { name }
  await categoryCollection.updateOne({ id: parseInt(id) }, { $set: editcategory })
  if (editcategory) {
    res.status(200).json(editcategory)
  } else {
    res.status(404).json({ message: 'not found' })
  }
});

// router.put('/user/:id', upload.single('img'), async (req, res) => {
//   const db = await connectDb()
//   const UserCollection = db.collection('user')
//   let id = req.params.id
//   let { fullname, pass, email } = req.body
//   if (req.file) {
//     var img = req.file.originalname
//   } else {
//     let categories = await categoriesCollection.findOne({ id: parseInt(id) })
//     var img = categories.img
//   }
//   let editUser = { fullname, img, pass, email }
//   await UserCollection.updateOne({ id: parseInt(id) }, { $set: editUser })
//   if (editUser) {
//     res.status(200).json(editUser)
//   } else {
//     res.status(404).json({ message: 'not found' })
//   }
// });

router.put('/user/:email', upload.single('img'), async (req, res) => {
  const db = await connectDb()
  const UserCollection = db.collection('user')
  let password = req.body.pass
  console.log(password);
  let email = req.params.email
  const salt = bcrypt.genSaltSync(10);
  let hashPassword = bcrypt.hashSync(password, salt);
  console.log("tao la hash:",hashPassword);
  let editUser = { pass: hashPassword }
  console.log(editUser);
  await UserCollection.updateOne({email : email},{ $set: editUser })
  if (editUser) {
    res.status(200).json({message: editUser})
  } else {
    res.status(404).json({ message: 'not found' })
  }
});
// end edit

// start delete
router.delete('/products/:id', async (req, res, next) => {
  const db = await connectDb()
  const productCollection = db.collection('products')
  let id = req.params.id
  let product = await productCollection.deleteOne({ id: parseInt(id) })
  if (product) {
    res.status(200).json({ message: 'thanh cong' })
  } else {
    res.status(404).json({ message: 'not found' })
  }
});

router.delete('/categories/:id', async (req, res, next) => {
  const db = await connectDb()
  const categoryCollection = db.collection('categories')
  let id = req.params.id
  let category = await categoryCollection.deleteOne({ id: parseInt(id) })
  if (category) {
    res.status(200).json({ message: 'thanh cong' })
  } else {
    res.status(404).json({ message: 'not found' })
  }
});

router.delete('/user/:id', async (req, res, next) => {
  const db = await connectDb()
  const UserCollection = db.collection('user')
  let id = req.params.id
  let Users = await UserCollection.deleteOne({ id: parseInt(id) })
  if (Users) {
    res.status(200).json({ message: 'thanh cong' })
  } else {
    res.status(404).json({ message: 'not found' })
  }
});


// end delete
router.get('/products/:id', async (req, res, next) => {
  let id = req.params.id
  const db = await connectDb()
  const productCollection = db.collection('products')
  const product = await productCollection.findOne({ id: parseInt(id) })
  if (product) {
    res.status(200).json(product)
  } else {
    res.status(404).json({ message: 'not found' })
  }
});
router.get('/categories/:id', async (req, res, next) => {
  let id = req.params.id
  const db = await connectDb()
  const productCollection = db.collection('categories')
  const product = await productCollection.findOne({ id: parseInt(id) })
  if (product) {
    res.status(200).json(product)
  } else {
    res.status(404).json({ message: 'not found' })
  }
});


router.post('/user/register', upload.single('img'), async (req, res, next) => {
  let { email, pass, fullname } = req.body;
  console.log(email, pass, fullname);
  const db = await connectDb();
  const userCollection = db.collection('user');
  let user = await userCollection.findOne({ email: email });
  // let product = await userCollection.find({email : email}).toArray()
  // console.log(user);
  // console.log(product);
  if (!user) {
    let lastuser = await userCollection.find().sort({ id: -1 }).limit(1).toArray();
    let id = lastuser[0] ? lastuser[0].id + 1 : 1;
    const salt = bcrypt.genSaltSync(10);
    let hashPassword = bcrypt.hashSync(pass, salt);
    let newUser = { id, email, pass: hashPassword, fullname, isAdmin: 0 };
    try {
      let result = await userCollection.insertOne(newUser);
      console.log(result);
      // res.redirect("../views/login.html");  
      res.status(200).json({ message: "Đăng ký thành công" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Lỗi khi thêm người dùng mới" });
    }
  } else {
    res.status(409).json({ message: "Email đã tồn tại" });
  }
})

router.post('/user/login', upload.single('img'), async (req, res, next) => {
  // try {
  const { email, pass } = req.body;
  console.log(email);
  console.log(pass);
  const db = await connectDb();
  const userCollection = db.collection('user');
  const user = await userCollection.findOne({ email: email });
  console.log(user);
  if (user) {
    const isPasswordValid = await bcrypt.compare(pass, user.pass);
    if (isPasswordValid) {
      // res.status(200).json(user)
      // const token = jwt.sign({ email: user.email, isAdmin: user.isAdmin }, 'secretKey', { expiresIn: '1h' })
      res.status(200).json({message: 'success'});
      
    } else {
      res.status(401).json({ message: "Email hoặc mật khẩu không chính xác" });
    }
  } else {
    res.status(401).json({ message: "Emails hoặc mật khẩu không chính xác" });
  }

});

router.get('/products/categoryId/:id', async (req, res, next) => {
  const id = parseInt(req.params.id)
  const db = await connectDb()
  const productCollection = db.collection('products')
  // const categoryCollection = db.collection('categories')
  try {
    // const Category = await categoryCollection.findOne({ id: id })
    // let name_cate = Category.name
    const products = await productCollection.find({ categoryId: id }).toArray()
    // res.status(200).json(products)
    if (products) {
      res.status(200).json(products)
    } else {
      res.status(404).json({ message: "loi roi kia" })
    }
  } catch (error) {
    console.log('error', error);
    res.status(500).send('loi roi')
  }
});

router.post('/cart', upload.single('img'),async (req, res) => {
  // const id = req.session?.id_Detail; 
  let { userName, Address, Phone, total } = req.body;
  // req.session.id_Detail = id;
  const db = await connectDb()
  const cartCollection = db.collection('cart')
  let newCart = { userName, Address, Phone, total };
  try {
    let result = await cartCollection.insertOne(newCart);
    console.log(result);
    // res.redirect("../views/login.html");  
    res.status(200).json({ message: "loi roi ne " });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi" });
  }
})

router.post('/cartDetail', upload.single('img'),async (req, res) => {
  // const id = req.session?.id_Detail; 
  let { cart_id, product_id, price, quantity } = req.body;
  const db = await connectDb()
  const cartCollection = db.collection('cartDetail')
  let newCart = { cart_id, product_id, price, quantity };
  try {
    let result = await cartCollection.insertOne(newCart);
    // console.log(result);
    // res.redirect("../views/login.html");  
    res.status(200).json({ message: "loi roi ne " });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi" });
  }
})

function authenToken(req, res, next) {
  const bearerHeader = req.headers['authorization'];
  if (typeof bearerHeader !== 'undefined') {
    const bearerToken = bearerHeader.split(' ')[1];
    req.token = bearerToken;
    jwt.verify(req.token, 'secretkey', (err, authData) => {
      if (err) {
        res.status(403).json({ message: "Không có quyền truy cập 2 " });
      } else {
        next();
      }
    })
  } else {
    res.status(403).json({ message: "Không có quyền truy cập 1 " });
  }
}



//mail

router.post("/sendmail",(req, res, next) => {
  console.log("request send");
  const CodeRandom = crypto.randomBytes(3).toString('hex');
  // localStorage.setItem('code', CodeRandom)
  let user = req.body
  sendMail(CodeRandom,user,info => {
    // console.log(`the mail has been send is ${info.messageId}`);
    // res.send(info)
    res.status(200).json(CodeRandom);
  })
})

async function sendMail(CodeRandom,user,callbacks) {
  let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: 'ssl',
    auth:{
      user : "fatui3155@gmail.com",
      pass : "jngsbwnrailhjdna"
    }
  })
   

  let mailOptions = {
    from : "fatui3155@gmail.com",
    to : user.email,
    subject : "Mã xác nhận mật khẩu",
    html : `<h1>Mã của bạn là ${CodeRandom}</h1>`
  }
  let info = await transporter.sendMail(mailOptions)
  callbacks(info)
}








module.exports = router;
