async function logout() {
    const location = window.location;
    const queryString = location.search;
    const urlParams = new URLSearchParams(queryString);
    const id = urlParams.get("id");

    localStorage.removeItem(id);
    console.log("Admin logged out, token removed.");

    const token = localStorage.getItem(id);
    if (!token) {
        alert("Admin logged out successfully.");
        window.location = "index.html";
    } else {
        alert("There was an issue logging out.");
    }
}


let lastOrderCount = null; // Variable to track the last received order count (set to null initially)
let lastProductCount = null; // Track last received product count
let lastSellerCount = null; // Track last received seller count
let lastUserCount = null; // Track last received user count
let orderChart = null; // To hold reference to the chart object

async function fetchCounts() {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');
  let token = localStorage.getItem(id);

  console.log('Fetching data with token:', token);

  try {
    const response = await fetch('/count', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Data received:", data);

    // Update DOM elements with simple increment for userCount only
    updateCount('userscount', data.userCount);  // Update user count separately

    // Create or update the order chart with dynamic data (including userCount in the chart)
    updateOrderChart(data.orderCount, data.productCount, data.sellerCount, data.userCount);

  } catch (error) {
    console.error('Error fetching counts:', error);
    // Handle errors gracefully, e.g., display an error message to the user
  }
}

function updateCount(elementId, targetCount) {
  const element = document.getElementById(elementId);
  let currentCount = 0;
  const increment = 1; // Adjust increment as needed
  const interval = 260; // Adjust interval to control animation speed
  const intervalId = setInterval(() => {
    currentCount += increment;
    element.textContent = `${currentCount}+`; // Add "+" before the count
    if (currentCount >= targetCount) {
      clearInterval(intervalId);
    }
  }, interval);
}

function updateOrderChart(orderCount, productCount, sellerCount, userCount) {
  const orderDataDiv = document.getElementById('orderdatadiv');

  // Create a new canvas element dynamically if chart is not initialized
  if (!orderChart) {
    const canvas = document.createElement('canvas');
    orderDataDiv.appendChild(canvas);

    // canvas.height = 550; // Set the canvas height to 550px

    // Get the context for Chart.js
    const ctx = canvas.getContext('2d');

    // Create the chart (Combo Bar and Line chart)
    orderChart = new Chart(ctx, {
      type: 'bar',  // Set the default type to 'bar'
      data: {
        labels: ['Order Count', 'Product Count', 'Seller Count', 'User Count'],  // Labels for the x-axis
        datasets: [
          {
            label: 'Order Count',  // Label for the bar dataset
            data: [orderCount, productCount, sellerCount, userCount],  // Include user count in data
            backgroundColor: [
              'rgba(75, 192, 192, 0.2)',  // Color for Order Count
              'rgba(255, 159, 64, 0.2)',  // Color for Product Count
              'rgba(153, 102, 255, 0.2)',  // Color for Seller Count
              'rgba(255, 205, 86, 0.2)'  // Color for User Count
            ],
            borderColor: [
              'rgba(75, 192, 192, 1)',  // Border color for Order Count
              'rgba(255, 159, 64, 1)',  // Border color for Product Count
              'rgba(153, 102, 255, 1)',  // Border color for Seller Count
              'rgba(255, 205, 86, 1)'   // Border color for User Count
            ],
            borderWidth: 1,
            barPercentage: 0.5  // Space between bars
          },
          {
            label: 'Seller Count',  // Label for the line dataset
            data: [orderCount, productCount, sellerCount, userCount],  // Same data used as the bar dataset
            fill: false,  // Don't fill the area under the line
            borderColor: 'rgba(255, 99, 132, 1)',  // Color for the line
            tension: 0.1,  // Line smoothness (0.1 is a slight curve)
            type: 'line',  // Make this a line chart
            borderWidth: 2  // Line border width
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          x: {
            beginAtZero: true
          },
          y: {
            beginAtZero: true
          }
        }
      }
    });
  } else {
    // Update the chart with the new data (only if the counts have changed)
    if (orderCount !== lastOrderCount || productCount !== lastProductCount || sellerCount !== lastSellerCount || userCount !== lastUserCount) {
      orderChart.data.datasets[0].data = [orderCount, productCount, sellerCount, userCount];  // Update bar dataset
      orderChart.data.datasets[1].data = [orderCount, productCount, sellerCount, userCount];  // Update line dataset
      orderChart.update();  // Re-render the chart
    }
  }

  // Update the last received counts
  lastOrderCount = orderCount;
  lastProductCount = productCount;
  lastSellerCount = sellerCount;
  lastUserCount = userCount;  // Update the last user count

  // Simulate new data points periodically if the count has not changed from the backend
  setInterval(() => {
    if (orderCount === lastOrderCount && productCount === lastProductCount && sellerCount === lastSellerCount && userCount === lastUserCount) {
      // Simulate a new increment (e.g., 20 for all counts)
      orderChart.data.datasets[0].data = [
        orderCount + 0, 
        productCount + 0, 
        sellerCount + 0, 
        userCount + 0
      ];
      orderChart.data.datasets[1].data = [
        orderCount + 0, 
        productCount + 0, 
        sellerCount + 0, 
        userCount + 0
      ];
      orderChart.update();  // Re-render the chart with the new simulated data

      // Update the last received counts
      lastOrderCount = orderCount + 20;
      lastProductCount = productCount + 20;
      lastSellerCount = sellerCount + 20;
      lastUserCount = userCount + 20;
    }
  }, 5000);  // Simulate new data every 5 seconds, adjust this interval if needed
}

function passid(){
  const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    console.log("checkid:", id);

    if(id){
      window.location = `adminuser.html?id=${id}`
    }
}

async function fetchAllUsers() {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');
  console.log("checkid:", id);

  let token = localStorage.getItem(id);

  try {
      const response = await fetch('/users', {
          method: 'GET',
          headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
          }
      });

      if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
      }

      const data = await response.json();
      console.log("Data fetched:", data);
  } catch (error) {
      console.error('Error during fetch operation:', error);
  }
}












