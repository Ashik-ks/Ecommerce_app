exports.orderPlace = function (email, products, totalPrice) {
  return new Promise((resolve, reject) => {
      try {
          // Check if there's more than one product in the order
          let productDetails = '';
          if (Array.isArray(products) && products.length > 0) {
              products.forEach(product => {
                  productDetails += `<p><b>Product:</b> ${product.productName}, <b>Quantity:</b> ${product.quantity}, <b>Total Price:</b> $${product.totalPrice}</p>`;
              });
          } else {
              // Single product order
              const product = products;
              productDetails = `<p><b>Product:</b> ${product.productName}, <b>Quantity:</b> ${product.quantity}, <b>Total Price:</b> $${product.totalPrice}</p>`;
          }

          // Create the email template
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
                          <h2>Order Confirmation</h2>
                      </div>
                      <div class="container">
                          <p>Dear user, ${email}</p>
                          <p>Your Order has been placed successfully:</p>
                          ${productDetails}
                          <h3>Total Amount: $${totalPrice}</h3>
                          <p>Pay your amount during shipping.</p>
                          <p>Shop more with us!</p>
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
