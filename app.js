const express = require('express');
const session = require('express-session');
const svgCaptcha = require('svg-captcha');
const bodyParser = require('body-parser');

const app = express();
const port = 4044;

app.use(session({ secret: 'your-secret-key', resave: true, saveUninitialized: true }));
app.use(bodyParser.urlencoded({ extended: true }));

// sayfaya rewind atıldığında önceki captha kodumuz tarayıcıda saklanmayacak, bu nedenle captcha sürekli yenilenecek.
app.use((req, res, next) => {
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    next();
  });


// token oluşturma fonksiyonumuz
function generateUniqueToken() {
    return Math.random().toString(36).substr(2);
}

// GET captcha sayfamız burada, işlemi sürdürmek için user'a HTML kodu göndererek modern bir sayfayla karşılaşmasını sağlıyoruz. 
app.get('/', (req, res) => {
    const uCaptcha = svgCaptcha.create({ size: 6 });
    const captchaToken = generateUniqueToken(); // özel bir token oluşturuyoruz
  
    req.session.captcha = {
      token: captchaToken,
      text: uCaptcha.text
    };
  
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>uCaptcha</title>

      <style>
        body {
          font-family: 'Arial', sans-serif;
          background-color: #f4f4f4;
          margin: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
        }

        form {
          background-color: #fff;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }

        label {
          display: block;
          margin-bottom: 8px;
        }

        input {
          width: 100%;
          padding: 8px;
          margin-bottom: 16px;
          box-sizing: border-box;
        }

        p {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 16px;
        }

        button {
          background-color: #0E9E00;
          color: #fff;
          padding: 12px;
          border: none;
          border-radius: 10px;
          cursor: pointer;
        }
      </style>
    </head>
    <body>
      <form action="/verify" method="post">
        <label for="captchaInput">uCaptcha Doğrulama</label>
        <p>${uCaptcha.data}</p>
        <input type="hidden" name="captchaToken" value="${captchaToken}">
        <input type="text" id="captchaInput" name="captcha" placeholder="Yukarıdaki yazıyı buraya yazın." autocomplete="off">
        <button type="submit">Doğrula</button>
      </form>
    </body>
    </html>
  `);
  });

  app.post('/verify', (req, res) => {
    const userCaptcha = req.body.captcha;
    const captchaToken = req.body.captchaToken;
    const actualCaptcha = req.session.captcha;
  
    if (captchaToken === actualCaptcha.token && userCaptcha === actualCaptcha.text) {
      res.send('Captcha doğrulandı!');
      // burada user'a grant atabiliriz
    } else {
      res.send('Captcha doğrulanamadı!');
      // sitenizde die atabilirsiniz.
    }
  });

app.listen(port, () => {
  console.log(`uCaptcha http://localhost:${port} adresinde çalışıyor!`);
});
