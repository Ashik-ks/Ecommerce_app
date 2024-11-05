async function getselectbox() {
    try {
        let response = await fetch('/getusertypes');
        console.log("response : ", response);

        let Parsed_response = await response.json();
        console.log("Parsed_response : ", Parsed_response);

        let Parsed_response_usertypes = Parsed_response.userTypes;
        console.log("Parsed_response_usertypes : ", Parsed_response_usertypes);

        if (!Parsed_response_usertypes || Parsed_response_usertypes.length === 0) {
            console.log("No user types available");
            return;
        }

        let select = document.getElementById('userTypeSelect');
        let rows = '';

        // rows += `<option value="none">none</option>`;

        for (let i = 0; i < Parsed_response_usertypes.length; i++) {
            rows += `
            <option value="${Parsed_response_usertypes[i].userType}">${Parsed_response_usertypes[i].userType}</option>
            `;
        }

        select.innerHTML = rows;
    } catch (error) {
        console.error("Error fetching getusertypes: ", error);
    }
}

async function adduser(event) {
    event.preventDefault();  // Prevent form submission and page reload

    // Get input values
    let fullname = document.getElementById('fullname').value;
    let email = document.getElementById('email').value;
    let password = document.getElementById('password').value;
    let phonenumber = document.getElementById('phonenumber').value;
    let street = document.getElementById('street').value;
    let city = document.getElementById('city').value;
    let state = document.getElementById('state').value;
    let country = document.getElementById('country').value;
    let pincode = document.getElementById('pincode').value;
    let userType = document.getElementById('userTypeSelect').value; // UserType from select

    // Simple form validation
    if (!fullname || !email || !password || !phonenumber || !street || !city || !state || !country || !pincode || !userType) {
        alert("All fields are required.");
        return;  // Stop further execution if validation fails
    }

    // Validate email format
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(email)) {
        alert("Please enter a valid email address.");
        return;
    }

    // Validate phone number (assuming 10-digit number)
    const phonePattern = /^\d{10}$/;
    if (!phonePattern.test(phonenumber)) {
        alert("Please enter a valid phone number (10 digits).");
        return;
    }

    // Validate pincode (assuming 6-digit number)
    const pincodePattern = /^\d{6}$/;
    if (!pincodePattern.test(pincode)) {
        alert("Please enter a valid pincode (6 digits).");
        return;
    }

    // Construct the data object
    let data = {
        fullname,
        email,
        password,
        phonenumber,
        address: {
            street,
            city,
            state,
            country,
            pincode
        },
        userType // User type string
    };

    let str_data = JSON.stringify(data);
    console.log("str_data: ", str_data);

    try {
        // Send the POST request
        let response = await fetch('/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: str_data,
        });

        // Check if the request was successful
        if (response.ok) {
            let parsed_response = await response.json(); // Expecting a JSON response
            console.log("parsed_response: ", parsed_response);

            // If the response indicates success, redirect
            if (parsed_response.success) {
                alert("User added successfully!");
                alert("Please Login to Continue")
                window.location.href = `login.html`; // Redirect to index.html
            } else {
                alert(parsed_response.message || "Something went wrong. Please try again.");
            }
        } else {
            const parsed_response = await response.json();
            alert(parsed_response.message || "Failed to add user. Server returned an error.");
        }
    } catch (error) {
        // Catch network or other errors
        console.error("Error: ", error);
        alert("An error occurred while adding the user.");
    }
}

async function loginUser(event) {
    event.preventDefault();  // Prevent default form submission

    console.log("Login button clicked...");

    // Get input values
    let email = document.getElementById('email').value;
    let password = document.getElementById('password').value;

    // Construct request data
    let data = { email, password };
    let str_data = JSON.stringify(data);

    try {
        // Send the login request
        let response = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: str_data
        });

        console.log("Response: ", response);

        // Check if the response status is ok
        if (!response.ok) {
            let parsed_response = await response.json();
            console.error("Error:", parsed_response.message);
            alert(parsed_response.message || "Something went wrong. Please try again later.");
            return;
        }

        // Parse the response
        let parsed_response = await response.json();
        console.log("Parsed Response: ", parsed_response);

        if (parsed_response.statuscode === 200) {
            console.log("Login successful");

            // Extract token and user type information
            let token_data = parsed_response.data.token;
            let userId = parsed_response.data.tokenId;
            let userTypes = parsed_response.data.userTypes;
            console.log("User type: ", userTypes);

            // Handle case if any expected data is missing
            if (!token_data || !userId || !userTypes) {
                console.error("Missing token, user ID, or user type.");
                alert("Login data is incomplete. Please try again.");
                return;
            }

            // Store the token and user type in localStorage using userId as the key
            let tokenKey = userId;  // Token key as user ID
            localStorage.setItem(tokenKey, token_data);  // Store the token
            localStorage.setItem(tokenKey + '_userType', userTypes.userType);  // Store the user type with the key
            console.log("Token stored successfully");

            // Redirect user based on user type
            if (userTypes.userType === 'Admin') {
                alert("Admin login successful");
                window.location.href = `admin.html?id=${userId}&login=${tokenKey}`;
            } else if (userTypes.userType === 'Seller') {
                alert("Seller login successful");
                window.location.href = `seller.html?id=${userId}&login=${tokenKey}`;
            } else if (userTypes.userType === 'Buyer') {
                alert("Buyer login successful");
                window.location.href = `index.html?id=${userId}&login=${tokenKey}`;
            } else {
                alert("Unknown user type. Please contact support.");
            }

        } else {
            alert(parsed_response.message || "Login failed. Please check your credentials.");
        }

    } catch (error) {
        console.error("Login Error: ", error);
        alert("An error occurred while logging in. Please try again later.");
    }
}

function checkUserStatus() {
    // Get the current page location (URL)
    let location = window.location;
    console.log("location", location);

    // Extract the query string from the URL
    let querystring = location.search;
    console.log("querystring", querystring);

    // Parse the query string into URLSearchParams
    let urlParams = new URLSearchParams(querystring);
    console.log("url", urlParams);

    // Get the 'id' and 'login' query parameters
    let id = urlParams.get("id");
    let tokenkey = urlParams.get('login');
    console.log("id: ", id, typeof (id));
    console.log("tokenkey: ", tokenkey);

    // Check if both 'id' and 'tokenkey' are present
    if (id && tokenkey) {
        // Retrieve the user type from localStorage using the key `tokenkey + '_userType'`
        let userType = localStorage.getItem(tokenkey + '_userType');
        console.log("userType: ", userType);

        if (userType) {
            // If the user is a Buyer, hide Login and Signup, and show My Account
            if (userType === 'Buyer') {
                document.getElementById('loginLink').style.display = 'none';  // Hide Login link
                document.getElementById('signupLink').style.display = 'none'; // Hide Signup link
                document.getElementById('myAccountLink').style.display = 'block';  // Show My Account link
            } else {
                // Show other links based on user type if needed (e.g., Admin or Seller)
                document.getElementById('loginLink').style.display = 'none';
                document.getElementById('signupLink').style.display = 'none';
                document.getElementById('myAccountLink').style.display = 'none'; // For non-buyers
            }
        }
    } else {
        // If the user is not logged in (id or tokenkey missing), show Login and Signup links
        document.getElementById('loginLink').style.display = 'block';
        document.getElementById('signupLink').style.display = 'block';
        document.getElementById('myAccountLink').style.display = 'none';  // Hide My Account link
    }
}







