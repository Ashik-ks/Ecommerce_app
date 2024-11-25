exports.cancelOrder = function (email,product,quantity) {
    return new Promise((resolve, reject) => {
      try {
        const template = `
          <html>
            <head>
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <style>
                body, html {
                  margin: 0;
                  padding: 0;
                  font-family: Arial, sans-serif;
                }
                .banner {
                  background-color: #FFA500;
                  color: white;
                  padding: 20px;
                  text-align: center;
                }
                .container {
                  margin: 20px auto;
                  padding: 20px;
                  max-width: 600px;
                  border: 1px solid #ddd;
                  border-radius: 8px;
                  background: #f9f9f9;
                }
                .text-warning {
                  color: #FF0000;
                  font-weight: bold;
                }
                .regards {
                  margin-top: 20px;
                  font-style: italic;
                }
              </style>
            </head>
            <body>
              <div class="banner">
                <h2>Reset Your Password</h2>
              </div>
              <div class="container">
                <p>Dear user,${email}</p>
                <p>Your Order for: <b>${product} with quantity${quantity} is canceled successfully</b></p>
                <p>Shop more with us..</p>
                <div class="regards">With regards,<br>Purple</div>
              </div>
            </body>
          </html>`;
        resolve(template);
      } catch (error) {
        reject(error);
      }
    });
  };