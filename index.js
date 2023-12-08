const express = require('express');
const paypal = require('paypal-rest-sdk');
const app = express();
const port = 3000;
//views
const {engine}=require('express-handlebars');
var path=require('path');
app.set('views',path.join(__dirname,"views"));
app.engine('handlebars',engine({defaultLayout:'main'}));
app.set('view engine','handlebars');
////////
app.use(express.json()); // Thêm middleware để xử lý JSON requests
paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': 'AbJt-1D4Zer7X5p-EJHy9WQR8Dhdt94PBrj3n1q2v8ZMhSutDjuaClGqnW7XgO2Hnd0HRubjK90XuuJZ',
  'client_secret': 'EMmS0_a45ezkRMiybz4EF4mjkE_tZ3JlsYz6ZM2fvvbsmWGan-EVaMOQHejcRgBkjfQZn4qmuYvX8lbD'
});

var total = 0;
var items = [
  {
    "name": "blue sky",
    "sku": "001",
    "price": "100.00",
    "currency": "USD",
    "quantity": 2
  },
  {
    "name": "green grass",
    "sku": "002",
    "price": "3.00",
    "currency": "USD",
    "quantity": 1
  }
];

for (let i = 0; i < items.length; i++) {
  total += parseFloat(items[i].price) * items[i].quantity;
}

app.all('/pay', function (req, res) {
  const create_payment_json = {
    // ... (code của bạn ở đây)
    "intent": "sale",
    "payer": {
        "payment_method": "paypal"
    },
    "redirect_urls": {
        "return_url": "http://localhost:3000/success",
        "cancel_url": "http://localhost:3000/cancel"
    },
    "transactions": [{
        "item_list": {
            "items": items
        },
        "amount": {
            "currency": "USD",
            "total": total.toString()
        },
        "description": "Hat for the best team ever"
    }]
  };

  paypal.payment.create(create_payment_json, function (error, payment) {
    if (error) {
      res.send("has an errpr ",error);
      // res.redirect('/cancel'); // Chuyển hướng đến /cancel nếu có lỗi
    } else {
      console.log('create payment response');
      console.log(payment);
      // Trả về response qua res của endpoint
      res.send(payment);
      // res.redirect('/success'); // Chuyển hướng đến /success nếu thành công
    }
  });
});

app.get('/cancle', function(req, res){
  res.render('cancle');
});

app.get('/success', (req, res) => {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;

  const execute_payment_json = {
    "payer_id": payerId,
    "transactions": [{
        "amount": {
            "currency": "USD",
            "total": total.toString()
        }
    }]
  };

  paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
    if (error) {
       res.redirect('/cancel'); // Chuyển hướng đến /cancel nếu có lỗi trong quá trình execute
    } else {
        console.log(JSON.stringify(payment));
        // res.send('success');
        res.render('success');
    }
  });
});

app.get('/cancel', (req, res) => res.render('cancel'));

app.listen(port, function(){
  console.log(`Server is listening at http://localhost:${port}, total:${total}`);
});
