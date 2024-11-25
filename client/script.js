

document.addEventListener('DOMContentLoaded', function () {
    const toggleButton = document.getElementById('toggleButton');
    const offcanvasElement = document.getElementById('offcanvasTop');

    // Ensure the offcanvas element exists
    if (toggleButton && offcanvasElement) {
        // Create a new Bootstrap Offcanvas instance
        const offcanvas = new bootstrap.Offcanvas(offcanvasElement);

        // Add a click event to the toggle button
        toggleButton.addEventListener('click', function () {
            // Show the offcanvas when the button is clicked
            offcanvas.show();
        });
    }
});

function openPopup(event) {
    event.preventDefault(); // Prevent any default behavior like navigating to a link
    document.getElementById('popup').style.display = 'flex'; // Show the popup
}

function closePopup() {
    document.getElementById('popup').style.display = 'none'; // Hide the popup
}

window.onclick = function (event) {
    const popup = document.getElementById('popup');
    if (event.target === popup) {
        closePopup();
    }
}

async function fetchCategories() {
    try {
        // Extract the 'id' parameter from the URL
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id'); // Extract 'id' if needed later

        // Fetch categories from the backend
        const response = await fetch('/category');
        const data = await response.json();

        // Check if the data structure is correct
        console.log("Fetched data:", data);

        if (!data || !data.data || data.data.length === 0) {
            console.error('No categories found.');
            return;
        }

        // Cache the category display div
        const categoryDisplay = document.getElementById('category-display');

        // Create a map of categories by their names (in lowercase for consistency)
        const categoryMap = {};
        data.data.forEach((category) => {
            categoryMap[category.name.toLowerCase()] = category;
        });

        console.log("Category Map:", categoryMap);

        // Add event listeners to all category elements
        document.querySelectorAll('.category').forEach((categoryElement) => {
            const categoryKey = categoryElement.dataset.category.toLowerCase();

            // Add a mouseover event listener
            categoryElement.addEventListener('mouseover', () => {
                console.log(`Mouseover triggered for: ${categoryKey}`);

                // Clear existing content
                categoryDisplay.innerHTML = '';

                // Retrieve the corresponding category
                const category = categoryMap[categoryKey];
                if (category) {
                    console.log("Category data:", category);

                    // Create the category title
                    const title = document.createElement('h3');
                    title.textContent = category.name;
                    title.style.fontWeight = 'bold';
                    title.style.textDecoration = 'underline';

                    // Create a list to display subcategories and their items
                    const itemList = document.createElement('ul');

                    category.subcategories.forEach((subcategory) => {
                        console.log("Subcategory data:", subcategory);

                        const subcategoryItem = document.createElement('li');
                        subcategoryItem.textContent = subcategory.name;

                        if (subcategory.items) {
                            const itemsList = document.createElement('ul');
                            subcategory.items.forEach((item) => {
                                const itemElement = document.createElement('li');
                                itemElement.textContent = item.name;
                                itemElement.style.fontSize = '0.85rem'; // Smaller font for items

                                // Redirect to category.html with item data on click
                                itemElement.addEventListener('click', () => {
                                    const itemParam = encodeURIComponent(JSON.stringify(item));
                                    window.location.href = `category.html?item=${itemParam}&id=${id}`;
                                });

                                itemsList.appendChild(itemElement);
                            });
                            subcategoryItem.appendChild(itemsList);
                        }

                        itemList.appendChild(subcategoryItem);
                    });

                    // Append the title and list to the category display
                    categoryDisplay.appendChild(title);
                    categoryDisplay.appendChild(itemList);
                } else {
                    console.error(`Category not found for key: ${categoryKey}`);
                }
            });
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
    }
}

function handleEmailInput() {
    const email = document.getElementById('emailInput').value;
    const select = document.getElementById('selectbox');
    const passwordSection = document.getElementById('passwordSection');
    const continueButton = document.getElementById('continueButton');

    // Check if email is admin
    if (email === 'admin@gmail.com') {
        // Hide select box and continue button, show password input for admin
        select.style.display = 'none';
        continueButton.style.display = 'none';
        passwordSection.style.display = 'block';
    } else {
        // Show select box and continue button for non-admin users
        select.style.display = 'block';
        continueButton.style.display = 'block';
        passwordSection.style.display = 'none';
    }
}

function sendEmailToServer() {
    const email = document.getElementById('emailInput').value;
    const select = document.getElementById('selectbox');

    if (email && email !== 'admin@gmail.com') {
        // Send the email and user type to the server to generate OTP
        fetch('/sendotp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: email, userType: select.value }), // Pass userType with email
        })


            .then(response => response.json())
            .then(data => {
                if (data.statusCode === 200) {
                    // Hide email input and show OTP section after sending OTP
                    document.getElementById('otpSection').style.display = "block";  // Show OTP section
                    document.getElementById('emailSection').style.display = "none";  // Hide email input section

                    alert("An OTP has been sent to your email");
                } else {
                    alert(data.message || 'Error sending OTP');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error sending OTP');
            });
    } else {
        alert('Please enter a valid email address');
    }
}

function adminLogin() {
    const email = document.getElementById('emailInput').value;
    const password = document.getElementById('passwordInput').value;

    if (email === 'admin@gmail.com' && password) {
        // Simulate an admin login, send password to the server if needed
        fetch('/sendotp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: email, password: password, userType: 'Admin' }),
        })
            .then(response => response.json())

            .then(data => {
                console.log("admindata : ", data)
                if (data.statusCode === 200) {
                    let token = data.data.token
                    console.log(" token: ", token)
                    let tokenkey = data.data.id
                    console.log(" tokenkey: ", tokenkey)

                    localStorage.setItem(tokenkey, token);  // Store the token using token key
                    localStorage.setItem(tokenkey + '_userType', data.data.userType);

                    alert('Admin login successful!');
                    window.location.href = `admin.html?id=${tokenkey}`;
                    closePopup();
                } else {
                    alert('Invalid password. Please try again.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error during admin login');
            });
    } else {
        alert('Please enter a valid password');
    }
}

function verifyOtp() {
    const email = document.getElementById('emailInput').value;
    const otp = document.getElementById('otpInput').value;

    if (otp) {
        // Send the OTP and email to the server for verification
        fetch('/verifyotp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: email, otp: otp }),
        })
            .then(response => response.json())
            .then(data => {
                console.log("data : ", data);

                if (data.statusCode === 200) {
                    alert('Login or Registration successful!');

                    let tokenkey = data.data.tokenid; // User's token ID (used as the key for storing the token)
                    console.log("tokenkey: ", tokenkey);

                    let token = data.data.token;

                    // Store token in localStorage
                    localStorage.setItem(tokenkey, token);  // Store the token using token key
                    localStorage.setItem(tokenkey + '_userType', data.data.userType);  // Store user type with the key

                    if (data.data.userType === 'Buyer') {
                        window.location.href = `index.html?id=${tokenkey}`;
                    } else if (data.data.userType === 'Seller') {
                        window.location.href = `seller.html?id=${tokenkey}`;
                    }

                    // Close the popup
                    closePopup();
                } else {
                    alert('Invalid OTP. Please try again.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error verifying OTP');
            });
    } else {
        alert('Please enter the OTP');
    }
}

async function checkUserStatus() {
    console.log("im here")
    // Get the current page location (URL)
    let location = window.location;
    console.log("location", location);

    // Extract the query string from the URL
    let querystring = location.search;
    console.log("querystring", querystring);

    // Parse the query string into URLSearchParams
    let urlParams = new URLSearchParams(querystring);
    console.log("url", urlParams);

    // Get the 'id' query parameter
    let id = urlParams.get("id");
    console.log("id: ", id, typeof (id));

    // Check if 'id' is present in the URL
    if (id) {
        // Retrieve the user type from localStorage using the key `id + '_userType'`
        let userType = localStorage.getItem(id + '_userType');
        console.log("userType: ", userType);

        if (userType) {
            // If the user is a Buyer, hide Login and Signup, and show My Account
            if (userType === 'Buyer') {
                document.getElementById('login').style.display = 'none';  // Hide Login link
                document.getElementById('logout').style.display = 'block';  // Show My Account link
            } else {
                // Show other links based on user type if needed (e.g., Admin or Seller)
                document.getElementById('login').style.display = 'none';
                document.getElementById('logout').style.display = 'block'; // For non-buyers (e.g., Admin, Seller)
            }
        } else {
            // If no user type found in localStorage, show Login and Signup
            document.getElementById('login').style.display = 'block';
            document.getElementById('logout').style.display = 'none';  // Hide My Account link
        }
    } else {
        // If 'id' is missing in the URL, show Login and Signup links
        document.getElementById('login').style.display = 'block';
        document.getElementById('logout').style.display = 'none';  // Hide My Account link
    }
}

function passtoken() {
    // Retrieve the current URL's location
    let location = window.location;
    console.log("location", location);

    // Extract the query string from the URL
    let querystring = location.search;
    console.log("querystring", querystring);

    // Parse the query string into URLSearchParams
    let urlParams = new URLSearchParams(querystring);
    console.log("urlParams", urlParams);

    // Get the 'id' query parameter
    let id = urlParams.get("id");
    console.log("id: ", id, typeof id);

    if (id) {
        // Redirect to profile page with the correct query parameter
        window.location.href = `profile.html?id=${id}`;
    } else {
        window.location.href = `profile.html`;
    }
}

async function checkLogin() {
    try {
        // Get the current URL and query string
        const location = window.location;
        console.log("location", location);

        const queryString = location.search;
        console.log("queryString", queryString);

        // Parse the query string
        const urlParams = new URLSearchParams(queryString);
        console.log("urlParams", urlParams);

        // Get the 'id' query parameter
        const id = urlParams.get("id");
        console.log("id:", id, typeof id);

        if (id) {
            // Show the profile card and hide the login/signup card
            document.getElementById('card-body').style.display = 'none';
            document.getElementById('profile-body').style.display = 'block';

            // Fetch user data using path parameter
            const response = await fetch(`/user/${id}`);  // Correct URL format
            console.log("response : ", response);
            if (!response.ok) {
                throw new Error(`Error fetching user data: ${response.statusText}`);
            }

            const userData = await response.json();
            console.log("User data:", userData);

            // Populate profile card with user data
            document.getElementById('name').textContent = userData.data.name || "Unknown User";
            document.getElementById('email').textContent = userData.data.email || "No Email Provided";
        }
        else {
            // Show the login/signup card and hide the profile card
            document.getElementById('card-body').style.display = 'block';
            document.getElementById('profile-body').style.display = 'none';
        }
    } catch (error) {
        console.error("An error occurred:", error);

        // Show an error message in the profile card if something goes wrong
        document.getElementById('profile-body').innerHTML = `
            <p class="text-danger">An error occurred while fetching user data. Please try again later.</p>
        `;
    }
}

function addresspage() {
    try {
        let location = window.location;
        console.log("location", location);

        // Extract the query string from the URL
        let querystring = location.search;
        console.log("querystring", querystring);

        // Parse the query string into URLSearchParams
        let urlParams = new URLSearchParams(querystring);
        console.log("urlParams", urlParams);

        // Get the 'id' query parameter
        let id = urlParams.get("id");
        console.log("id: ", id, typeof id);

        window.location.href = `address.html?id=${id}`;

    } catch (error) {
        console.error("An error occurred:", error);
    }
}

function homepage() {
    const location = window.location;
    console.log("location", location);

    const queryString = location.search;
    console.log("queryString", queryString);

    // Parse the query string
    const urlParams = new URLSearchParams(queryString);
    console.log("urlParams", urlParams);

    // Get the 'id' query parameter
    const id = urlParams.get("id");
    console.log("id:", id, typeof id);

    if (id) {
        window.location.href = `index.html?id=${id}`;
    } else if (id === null) {
        window.location.href = `index.html`;

    }
}

// redirect to profile page but not working now
function profilepage() {
    console.log("Profile Page Button Clicked");

    const location = window.location;
    const queryString = location.search;
    const urlParams = new URLSearchParams(queryString);
    const id = urlParams.get("id");

    console.log("User ID:", id);

    if (!id) {
        alert("User ID is missing in the URL.");
        return;
    }

    const targetUrl = `profile.html?id=${id}`;
    console.log("Redirecting to:", targetUrl);
    window.location = targetUrl; // Uncomment after debugging
}

let isFirstAddress = true;

// Function to hide the 'No Saved Address' message and show the address form
function Addressform() {
    document.getElementById('addaddressimg').style.display = 'none';
    document.getElementById('addaddresstext').style.display = 'none';
    document.getElementById('addressform').style.display = 'block';

    // Disable the button when form is open
    document.getElementById('addAddressBtn').setAttribute('disabled', true);
}

// Function to add a new address
async function addAddress(event) {
    event.preventDefault();

    const location = window.location;
    const queryString = location.search;
    const urlParams = new URLSearchParams(queryString);
    const id = urlParams.get("id");

    const street = document.getElementById("street").value;
    const city = document.getElementById("city").value;
    const state = document.getElementById("state").value;
    const country = document.getElementById("country").value;
    const pincode = document.getElementById("pincode").value;
    const landmark = document.getElementById("landmark").value;
    const phonenumber = document.getElementById("phonenumber").value;

    const body = { street, city, state, country, pincode, landmark, phonenumber };

    try {
        const response = await fetch(`/addaddress/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        const result = await response.json();
        if (response.ok) {
            alert("Address added successfully");
            document.getElementById('addressform').style.display = 'none'; // Hide form after adding
            document.getElementById('addAddressBtn').removeAttribute('disabled'); // Enable the add address button again
            window.location.href = `address.html?id=${id}`;  // Reload addresses after adding new one
        } else {
            alert("Error adding address: " + result.message);
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

// Function to fetch addresses of the user
async function fetchAddresses() {
    const location = window.location;
    const queryString = location.search;
    const urlParams = new URLSearchParams(queryString);
    const id = urlParams.get("id");

    if (!id) {
        alert("User ID is missing in the URL.");
        return;
    }

    try {
        const response = await fetch(`/user/${id}`);
        const result = await response.json();
        console.log("result : ", result);  // Check the entire response structure

        if (result.success && result.statuscode === 200) {
            const user = result.data;  // Accessing the 'data' object
            const addresses = user.address;  // Assuming 'address' is an array within 'data'
            console.log("addresses : ", addresses);  // Check if addresses are correctly fetched

            // Hide the "No Saved Address" message if addresses exist
            if (addresses && addresses.length > 0) {
                document.getElementById('addaddressimg').style.display = 'none';
                document.getElementById('addaddresstext').style.display = 'none';
                document.getElementById('addressdiv').style.display = 'none';
                document.getElementById("category-display77").style.display = "block"; // Ensure addressContainer is visible

                // Clear previous addresses
                document.getElementById("addressContainer77").innerHTML = "";  // Clear existing content

                // Display all addresses the user has
                addresses.forEach((address, index) => {
                    const addressHTML = document.createElement('div');
                    addressHTML.classList.add('address');

                    addressHTML.innerHTML = `
                        <h4>Address ${index + 1}</h4>
                        <p>${address.street}, ${address.city}, ${address.state}, ${address.country}</p>
                        <p>Pincode: ${address.pincode}</p>
                        <p>Landmark: ${address.landmark}</p>
                        <p>Landmark: ${address.phonenumber}</p>
                         <div class="d-flex gap-5 ms-1 pt-2">
<button class="border-0 bg-white fs-4" onclick="updateaddress(${index}, '${id}')">
    <i class="fa fa-pencil-square-o" aria-hidden="true"></i>
</button>
                        <button class="border-0 bg-white fs-4" onclick="deleteaddress(${index}, '${id}')"><i class="fa fa-trash" aria-hidden="true"></i></button>
                         </div>
                       
                    `;
                    document.getElementById("category-display77").appendChild(addressHTML);
                });
            } else {
                document.getElementById("addressdiv").style.display = "flex"; // Show "No Saved Address" message
            }
        } else {
            console.error("Failed to fetch user data:", result.message);
        }
    } catch (error) {
        console.error("Error fetching addresses:", error);
        alert("Error fetching address details.");
    }
}

async function updateaddress(index, id) {
    console.log("button clicked")
    try {
        // Fetch the user data again
        const response = await fetch(`/user/${id}`);
        const result = await response.json();

        if (result.success && result.statuscode === 200) {
            const user = result.data;
            const address = user.address[index];  // Get the address to edit

            // Populate the form with the current address data
            document.getElementById("street").value = address.street;
            document.getElementById("city").value = address.city;
            document.getElementById("state").value = address.state;
            document.getElementById("country").value = address.country;
            document.getElementById("pincode").value = address.pincode;
            document.getElementById("landmark").value = address.landmark;
            document.getElementById("phonenumber").value = address.phonenumber;

            // Show the address form
            document.getElementById('addressform').style.display = 'block';
            document.getElementById('addaddressimg').style.display = 'none';
            document.getElementById('addaddresstext').style.display = 'none';
            document.getElementById('addressdiv').style.display = 'none';

            // Disable the add address button when the form is open
            document.getElementById('addAddressBtn').setAttribute('disabled', true);

            // Change the form submission to update the address
            document.getElementById('addressform').onsubmit = async function (event) {
                event.preventDefault();
                await updateAddressInDB(id, index);
            };
        }
    } catch (error) {
        console.error("Error fetching address for update:", error);
        alert("Error fetching address for update.");
    }
}
async function updateAddressInDB(id, index) {
    const street = document.getElementById("street").value;
    const city = document.getElementById("city").value;
    const state = document.getElementById("state").value;
    const country = document.getElementById("country").value;
    const pincode = document.getElementById("pincode").value;
    const landmark = document.getElementById("landmark").value;
    const phonenumber = document.getElementById("phonenumber").value;

    const body = { street, city, state, country, pincode, landmark, phonenumber };

    try {
        const response = await fetch(`/updateaddress/${id}/${index}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        const result = await response.json();
        if (response.ok) {
            alert("Address updated successfully");
            document.getElementById('addressform').style.display = 'none'; // Hide form after updating
            document.getElementById('addAddressBtn').removeAttribute('disabled'); // Enable the add address button again
            window.location.href = `address.html?id=${id}`; // Reload addresses after updating
        } else {
            alert("Error updating address: " + result.message);
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Error updating address.");
    }
}

async function deleteaddress(id, index) {
    console.log("delete : ", id, index)
    try {
        // Make a DELETE request to the server with user id and address index
        const response = await fetch(`/deleteaddress/${index}/${id}`, {
            method: "DELETE",  // DELETE method
        });

        // Parse the response as JSON
        const result = await response.json();

        // Handle success
        if (response.ok) {
            alert(result.message);  // Display success message
            // Optionally, you can update the UI or refresh the page to reflect the changes
            window.location.reload();  // Reload the page to update the addresses
        } else {
            // Handle errors (e.g., invalid index or user not found)
            alert(result.message);
        }
    } catch (error) {
        console.error("Error deleting address:", error);
        alert("An error occurred while deleting the address.");
    }
}

async function logout() {
    const location = window.location;
    const queryString = location.search;
    const urlParams = new URLSearchParams(queryString);
    const id = urlParams.get("id");

    localStorage.removeItem(id);
    console.log("User logged out, token removed.");

    const token = localStorage.getItem(id);
    if (!token) {
        alert("User logged out successfully.");
        window.location = "index.html";
    } else {
        alert("There was an issue logging out.");
    }
}

function settingspage() {
    const location = window.location;
    const queryString = location.search;
    const urlParams = new URLSearchParams(queryString);
    const id = urlParams.get("id");

    if (id) {
        alert("button clicked")
        window.location = `settingsSeller.html?id=${id}`
    }
}


const form = document.getElementById('productForm');
const errorMessage = document.getElementById('errorMessage');
const successMessage = document.getElementById('successMessage');
const categorySelect = document.getElementById('category');
const subcategorySelect = document.getElementById('subcategory'); // Subcategory dropdown
const itemSelect = document.getElementById('item'); // Item dropdown

// Store categories data globally to use later
let categoriesData = [];

// Fetch categories from the backend and populate the category dropdown
async function loadCategories() {
    try {
        const response = await fetch('/category'); // Your backend API endpoint for categories
        const output = await response.json();
        const data = output.data;

        if (response.ok && data && Array.isArray(data)) {
            categoriesData = data; // Store the categories data to use later

            // Clear existing options
            categorySelect.innerHTML = '<option value="">Select a category</option>';

            // Add each category as an option
            data.forEach(category => {
                const option = document.createElement('option');
                option.value = category._id; // Assuming each category has a unique _id field
                option.textContent = category.name; // Assuming the category has a "name" field
                categorySelect.appendChild(option);
            });
        } else {
            errorMessage.textContent = "Failed to load categories.";
        }
    } catch (error) {
        errorMessage.textContent = "An error occurred while fetching categories.";
    }
}

// Function to update subcategories and items based on selected category
function updateSubcategoriesAndItems(categoryId) {
    // Find the selected category data
    const selectedCategory = categoriesData.find(category => category._id === categoryId);

    if (selectedCategory) {
        // Populate subcategories dropdown
        subcategorySelect.innerHTML = '<option value="">Select a subcategory</option>';
        selectedCategory.subcategories.forEach(subcategory => {
            const subcategoryOption = document.createElement('option');
            subcategoryOption.value = subcategory.name; // Use subcategory name as value
            subcategoryOption.textContent = subcategory.name; // Use subcategory name as text
            subcategorySelect.appendChild(subcategoryOption);
        });

        // Reset the items dropdown
        itemSelect.innerHTML = '<option value="">Select an item</option>';
    } else {
        subcategorySelect.innerHTML = '<option value="">Select a subcategory</option>'; // Reset subcategory options
        itemSelect.innerHTML = '<option value="">Select an item</option>'; // Reset item options
    }
}

// Function to update items based on selected subcategory
function updateItems(subcategoryName) {
    // Find the selected category and subcategory data
    const selectedCategory = categoriesData.find(category => category._id === categorySelect.value);
    const selectedSubcategory = selectedCategory?.subcategories.find(sub => sub.name === subcategoryName);

    if (selectedSubcategory) {
        // Populate items dropdown
        itemSelect.innerHTML = '<option value="">Select an item</option>';
        selectedSubcategory.items.forEach(item => {
            const itemOption = document.createElement('option');
            itemOption.value = item.name; // Use item name as value
            itemOption.textContent = item.name; // Use item name as text
            itemSelect.appendChild(itemOption);
        });
    } else {
        itemSelect.innerHTML = '<option value="">Select an item</option>'; // Reset item options
    }
}

// Event listener for category selection change
categorySelect.addEventListener('change', function () {
    const selectedCategory = categorySelect.value;

    if (selectedCategory) {
        updateSubcategoriesAndItems(selectedCategory); // Populate subcategories and items
    } else {
        subcategorySelect.innerHTML = '<option value="">Select a subcategory</option>'; // Reset subcategory options
        itemSelect.innerHTML = '<option value="">Select an item</option>'; // Reset item options
    }
});

// Event listener for subcategory selection change
subcategorySelect.addEventListener('change', function () {
    const selectedSubcategory = subcategorySelect.value;

    if (selectedSubcategory) {
        updateItems(selectedSubcategory); // Populate items based on subcategory selection
    } else {
        itemSelect.innerHTML = '<option value="">Select an item</option>'; // Reset item options
    }
});

async function handleFormSubmit(e) {
    e.preventDefault();

    const submitButton = document.getElementById('submit-button');
    if (!submitButton) {
        console.error("Submit button not found");
        return;
    }

    submitButton.disabled = true;

    const location = window.location;
    const queryString = location.search;
    const urlParams = new URLSearchParams(queryString);
    const id = urlParams.get("id");

    // Ensure seller ID is present
    if (!id) {
        alert("Seller ID is missing in the URL.");
        submitButton.disabled = false;
        return;
    }

    const token = localStorage.getItem(id);
    if (!token) {
        alert("Authorization token is missing.");
        submitButton.disabled = false;
        return;
    }

    // Extract individual form data
    const name = document.getElementById('name').value;
    const description = document.getElementById('description').value;
    const categoryId = document.getElementById('category').value;
    const subcategory = document.getElementById('subcategory').value;
    const item = document.getElementById('item').value;
    const price = document.getElementById('price').value;
    const discountPrice = document.getElementById('discountPrice').value;
    const stockQuantity = document.getElementById('stockQuantity').value;
    const imagesInput = document.getElementById('images');
    const weight = document.getElementById('weight').value;

    // Validate and extract the images (convert to base64)
    const images = imagesInput.files.length > 0 ? await convertImagesToBase64(imagesInput.files) : [];

    // Find the selected category object by ID
    const selectedCategory = categoriesData.find(category => category._id === categoryId);
    const categoryName = selectedCategory ? selectedCategory.name : '';

    // Build the product data object
    const productData = {
        name,
        description,
        category: categoryName,
        subcategory,
        item,
        price: parseFloat(price),
        discountPrice: discountPrice ? parseFloat(discountPrice) : null,
        stockQuantity: parseInt(stockQuantity, 10),
        images,
        weight: weight ? parseFloat(weight) : null,
        sellerId: id
    };

    // Client-side validation
    const requiredFields = ['name', 'description', 'price', 'category', 'stockQuantity'];
    const missingFields = requiredFields.filter(field => !productData[field]);
    if (missingFields.length > 0) {
        alert(`Missing required fields: ${missingFields.join(', ')}`);
        submitButton.disabled = false;
        return;
    }

    if (isNaN(productData.price) || productData.price <= 0) {
        alert("Price must be a positive number!");
        submitButton.disabled = false;
        return;
    }

    if (isNaN(productData.stockQuantity) || productData.stockQuantity < 0) {
        alert("Stock quantity must be a non-negative integer.");
        submitButton.disabled = false;
        return;
    }

    try {
        const response = await fetch('/addproducts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(productData),
        });

        const result = await response.json();
        console.log("result : ", result);

        if (response.ok) {
            alert("Product added successfully!");
            form.reset();
            window.location = `settingsSeller.html?id=${id}`
        } else {
            alert(result.message || "An error occurred while adding the product.");
        }
    } catch (error) {
        alert(error.message || "Failed to submit product data.");
    } finally {
        submitButton.disabled = false;
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const submitButton = document.getElementById('submit-button');
    console.log(submitButton); // This will log the button or `null` if not found

    if (!submitButton) {
        console.error("Submit button not found");
        return;
    }

    submitButton.addEventListener('click', handleFormSubmit);
});


// Helper function to convert images to base64
function convertImagesToBase64(files) {
    return new Promise((resolve, reject) => {
        const base64Images = [];
        const filePromises = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            filePromises.push(new Promise((resolveFile, rejectFile) => {
                const reader = new FileReader();
                reader.onload = function (event) {
                    base64Images.push(event.target.result);
                    resolveFile();
                };
                reader.onerror = rejectFile;
                reader.readAsDataURL(file);
            }));
        }

        Promise.all(filePromises)
            .then(() => resolve(base64Images))  // Return the array of base64-encoded images
            .catch(reject);  // Handle any error
    });
}

// Add the form submission event listener
form.addEventListener('submit', handleFormSubmit);

function displayaddproductform() {
    const formContainer = document.getElementById('formcontainer');
    if (formContainer.style.display === "none" || formContainer.style.display === "") {
        formContainer.style.display = "block";
    } else {
        formContainer.style.display = "none";
    }
}

async function getsellerproduct() {
    try {
        // Extract 'id' from URL parameters
        const location = window.location;
        const queryString = location.search;
        const urlParams = new URLSearchParams(queryString);
        const id = urlParams.get("id");

        if (!id) {
            console.error("Seller ID not found in URL");
            alert("Seller ID is missing!");
            return;
        }

        // Retrieve the token from local storage using id as the key
        const token = localStorage.getItem(id);
        if (!token) {
            console.error("Token not found in local storage");
            alert("You are not authorized!");
            return;
        }

        // Fetch seller's products from API with authorization header
        let response = await fetch(`/getsellerproduct/${id}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            }
        });

        // Handle non-OK response (e.g., 404 for no products found)
        if (!response.ok) {
            const errorMessage = await response.json();
            if (response.status === 404) {
                // Handle the case when there are no products for the seller
                document.getElementById('datacontainer').innerHTML = `<p>You have no products.</p>`;
                return; // Stop further execution
            }
            // For other non-OK responses, throw an error
            throw new Error(`Failed to fetch products. Status: ${response.status} - ${errorMessage.message}`);
        }

        // Parse the response
        let parsedResponse = await response.json();
        console.log("parsedresponse: ", parsedResponse);

        if (parsedResponse.success) {
            let datacontainer = document.getElementById('datacontainer');
            let rows = '';

            // Check if there are any products in the response data
            if (parsedResponse.data.length === 0) {
                datacontainer.innerHTML = `<p>You have no products.</p>`;
                return; // Stop further execution if no products
            }

            // Loop through the products and build HTML
            parsedResponse.data.forEach(product => {
                const productImage = product.images ? product.images : 'placeholder.jpg';
                console.log("productImage : ", product._id)
                rows += `
                    <div class="product-card shadow p-3 mb-5 mt-3 bg-body rounded border-1 lh-lg">
                        <div class="text-center"><img src="${productImage[0]}" alt="${product.name}" / ></div>
                        <div class="fs-6 fw-bold mt-2">${product.name}</div>
                        <p>Price: $${parseFloat(product.price).toFixed(2)}</p>
                        <p>Stock: ${product.stockQuantity}</p>
                        <p>Stock: ${product.stockStatus}</p>
<button class="border-0 bg-white" onclick="displayproducteditform('${product._id}')">
    <i class="fa fa-pencil-square-o fs-4" aria-hidden="true"></i>
</button>
                    </div>
                `;
            });

            datacontainer.innerHTML = rows; // Insert the product cards into the container
        } else {
            alert(parsedResponse.message || "No products found for this seller.");
        }
    } catch (error) {
        console.error("Error fetching seller products:", error);
        alert(`An error occurred: ${error.message}`); // Detailed error message
    }
}

function displayproducteditform(productId) {
    console.log("Fetching product data for productId: ", productId);

    const location = window.location;
    const queryString = location.search;
    const urlParams = new URLSearchParams(queryString);
    const sellerId = urlParams.get("id"); // Get sellerId from query string
    const token = localStorage.getItem(sellerId); // Retrieve the token from local storage

    // Ensure productId and sellerId are valid
    if (!productId || !sellerId) {
        console.error("Invalid productId or sellerId passed");
        return; // Prevent execution if productId or sellerId is invalid
    }
    if (!token) {
        console.error("No token found");
        alert("Authorization token is missing");
        return;
    }

    const form = document.getElementById('producteditform');

    // Toggle visibility
    if (form.style.display === 'block') {
        form.style.display = 'none'; // Hide the form if it's already visible
        return;
    }

    // Show the form and pre-fill it with product data
    form.style.display = 'block';

    // Store productId as a data attribute on the form
    form.setAttribute('data-product-id', productId);

    // Fetch product details from the backend with sellerId and productId
    fetch(`/getproductdataedit/${sellerId}/${productId}`, {
        method: 'GET', // Use GET request to fetch product data
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch product details, status: ${response.status}`);
            }
            return response.json();
        })
        .then(product => {
            console.log("Fetched product data:", product); // Log the full product response

            // Ensure 'product' contains the expected structure
            if (product && product.data) {
                // Check if the elements exist before setting values
                const descriptionField = document.getElementById('editdescription');
                const priceField = document.getElementById('editprice');
                const discountPriceField = document.getElementById('editdiscountPrice');
                const stockQuantityField = document.getElementById('editstockQuantity');

                // Check if the form elements are found before setting values
                if (descriptionField) {
                    descriptionField.value = product.data.description || '';
                } else {
                    console.error("Description field not found.");
                }

                if (priceField) {
                    priceField.value = product.data.price || '';
                } else {
                    console.error("Price field not found.");
                }

                if (discountPriceField) {
                    discountPriceField.value = product.data.discountPrice || '';
                } else {
                    console.error("Discount Price field not found.");
                }

                if (stockQuantityField) {
                    stockQuantityField.value = product.data.stockQuantity || '';
                } else {
                    console.error("Stock Quantity field not found.");
                }
            } else {
                console.error("Product data is missing or structured differently.");
                alert("Product data is not available or formatted incorrectly.");
            }
        })
        .catch(error => {
            console.error("Error fetching product details:", error);
            alert("An error occurred while fetching product data.");
        });
}


async function editproduct() {
    const form = document.getElementById('producteditform');
    const productId = form.getAttribute('data-product-id');
    if (!productId) {
        alert("Product ID is missing!");
        return;
    }

    const description = document.getElementById('editdescription').value;
    const price = parseFloat(document.getElementById('editprice').value);
    const discountPrice = parseFloat(document.getElementById('editdiscountPrice').value) || null;
    const stockQuantity = parseInt(document.getElementById('editstockQuantity').value, 10);
    const imagesInput = document.getElementById('editimages');

    let images = [];
    if (imagesInput.files.length > 0) {
        images = await editconvertImagesToBase64(imagesInput.files);
        console.log("Converted base64 images: ", images);  // Debug log
    }


    const payload = {
        description,
        price,
        discountPrice,
        stockQuantity,
        images, // Ensure this is an array with base64 strings
    };

    const location = window.location;
    const queryString = location.search;
    const urlParams = new URLSearchParams(queryString);
    const id = urlParams.get("id");
    const token = localStorage.getItem(id);

    try {
        const response = await fetch(`/editproduct/${productId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
        });

        const result = await response.json();
        if (response.ok) {
            alert("Product updated successfully!");
            form.style.display = 'none';
        } else {
            alert(result.message || "Failed to update the product.");
        }
    } catch (error) {
        console.error("Error updating product:", error);
        alert("An error occurred while updating the product.");
    }
}

async function editconvertImagesToBase64(files) {
    const filePromises = Array.from(files).map(file => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result); // This should return the base64 data
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    });
    return Promise.all(filePromises);
}

// fetch based on itemnames
async function displayItem() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const itemParam = urlParams.get('item');  // The item parameter passed in the URL
        console.log("itemParam:", itemParam);
        if (!itemParam) {
            console.error('Item parameter is missing in the URL.');
            document.getElementById('itemslist').innerHTML = 'No item specified in the URL.';
            return;
        }


        const item = JSON.parse(decodeURIComponent(itemParam));
        const itemId = item._id;
        console.log("Extracted Item ID:", itemId);
        let userid = urlParams.get('id');
        console.log("id:", userid);
        if (userid === null) {
            userid = 'null';
        }


        // Show loading indicator
        document.getElementById('itemslist').innerHTML = 'Loading...';

        const response = await fetch(`/fetchitem/${itemId}/${userid}`);
        const parsed_response = await response.json();

        console.log("parsed_response : ", parsed_response);

        let data = parsed_response.data.products;
        console.log('data : ', data);

        let itemslist = document.getElementById("itemslist");
        let rows = '';

        if (Array.isArray(data)) {
            for (let i = 0; i < data.length; i++) {
                const imageUrl = data[i].images && data[i].images[0] ? data[i].images[0] : 'fallback-image-url.jpg'; // Use fallback if no image exists
                rows += `
                
           <div class="d-flex flex-column shadow-none p-3 mb-5 bg-light rounded">
           <div class="text-center"><img src="${imageUrl}" class="card-img-top" alt="Item Image"></div>
           <div class="text-center">
           <div class="mt-4 text-sm text-gray-800 ms-1">
                ${data[i].name}
            </div>

            <!-- Price and offer -->
            <div class="mt-1 text-lg font-bold text-black">
               Offer: ₹${data[i].discountPrice}
            </div>
            <div class="text-md text-gray-600 text-decoration-line-through">
                Price: ₹${data[i].price}
            </div>

            <!-- Stock status -->
            <div class="mt-1 text-sm text-gray-500">
                ${data[i].stockStatus}
            </div>
        </div>
           </div>
            </div>
            
                `;
            }
        } else if (data && typeof data === 'object') {
            // If data is an object (single product)
            const imageUrl = data.images && data.images[0] ? data.images[0] : 'fallback-image-url.jpg'; // Use fallback if no image exists
            rows += `
               <div class="row">
               
                    <div class="col"><img src="${imageUrl}" class="adminDatacontainerimg" alt="Item Image"></div>

                    <div class="col text-center text-dark" style="font-size: 18px; font-weight: 700;">
                        ${data.name}
                    </div>
                </div>
            `;
        } else {
            console.error('Unexpected data format:', data);
            rows = 'Error: Data format is unexpected.';
        }

        // Insert the dynamically generated rows into the container
        itemslist.innerHTML = rows;

    } catch (error) {
        console.error('Error fetching data:', error);
        // Handle any error, e.g., show a message if data cannot be fetched
        document.getElementById('itemslist').innerHTML = 'Error fetching data';
    }
}

//fetch based on category
async function displaycategory() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const itemParam = urlParams.get('item');  // The item parameter passed in the URL

        const item = JSON.parse(decodeURIComponent(itemParam));

        const itemId = item._id;
        console.log("Extracted Item ID:", itemId);

        let categoryuserid = urlParams.get('id');
        console.log("id:", categoryuserid);
        if (categoryuserid === null) {
            categoryuserid = 'null';
        }

        const response = await fetch(`/fetchcategory/${itemId}/${categoryuserid}`); // Adjust the URL based on your backend
        const parsed_response = await response.json();  // Parse the response

        console.log("parsed_response : ", parsed_response);

        let data = parsed_response.data.products;  // Assuming 'data' contains the product info
        console.log('data : ', data);
        let dataitemid = parsed_response.data.itemId;


        let datacontainer = document.getElementById("datacontainercategory");
        let categoryhead = document.getElementById("categoryhead");
        let rows = ''; // Initialize an empty string to build the HTML for the rows

        let rows1 = `<div class="text-center fs-4 fw-bold mt-5 "> ${dataitemid}</div><div class="text-center viewall">View All <i class="fa-solid fa-arrow-right"></i><div>`
        categoryhead.innerHTML = rows1;

        // Check if the data is an array or an object
        if (Array.isArray(data)) {
            // Loop through each item in the array (if data is an array)
            for (let i = 0; i < data.length; i++) {
                const imageUrl = data[i].images && data[i].images[0] ? data[i].images[0] : 'fallback-image-url.jpg';
                rows += `
                     <div class="d-flex flex-column shadow-none p-3 mb-5 bg-light rounded">
           <div class="text-center"><img src="${imageUrl}" class="card-img-top" alt="Item Image"></div>
           <div class="text-center">
           <div class="mt-4 text-sm text-gray-800 ms-1">
                ${data[i].name}
            </div>

            <!-- Price and offer -->
            <div class="mt-1 text-lg font-bold text-black">
               Offer: ₹${data[i].discountPrice}
            </div>
            <div class="text-md text-gray-600 text-decoration-line-through">
                Price: ₹${data[i].price}
            </div>

            <!-- Stock status -->
            <div class="mt-1 text-sm text-gray-500">
                ${data[i].stockStatus}
            </div>
        </div>
           </div>
            </div>
                `;
            }
        } else if (data && typeof data === 'object') {
            // If data is an object (single product)
            rows += `
                <div class="container mb-4 bg-white shadow-sm p-3 rounded">
                    <div class="row d-flex justify-content-center align-items-center">
                        <div class="col text-center">
                            <img src="${data.images[0]}" class="adminDatacontainerimg" alt="Item Image">
                        </div>
                        <div class="col text-center text-dark" style="font-size: 18px; font-weight: 700;">
                            ${data.name}
                        </div>
                    </div>
                </div>
            `;
        } else {
            console.error('Unexpected data format:', data);
        }

        // Insert the dynamically generated rows into the container
        datacontainer.innerHTML = rows;

    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

//to fetch search text
async function searchAndDisplay() {

    const urlParams = new URLSearchParams(window.location.search);
    let id = urlParams.get('id');
    console.log("checkid : ", id)

    if (id === null) {
        id = 'null';
    }


    const searchInput = document.getElementById('searchinput').value.trim().toLowerCase();
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = '';
    console.log("Search input: ", searchInput);

    if (!searchInput) {
        resultsContainer.textContent = 'No input provided.';
        return;
    }

    try {
        const response = await fetch(`/getallproducts/${id}`);
        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        const responseData = await response.json();
        console.log("Fetched all products: ", responseData);
        const productsArray = Array.isArray(responseData.allproducts)
            ? responseData.allproducts
            : [];

        if (!Array.isArray(productsArray)) {
            throw new Error("API response does not contain a valid array of products.");
        }
        const matchingProducts = productsArray.filter(product =>
            product.name.toLowerCase().startsWith(searchInput)
        );
        if (matchingProducts.length > 0) {
            matchingProducts.forEach(product => {
                const productElement = document.createElement('div');
                productElement.textContent = product.name;
                productElement.addEventListener('click', () => {

                    window.location.href = `search.html?item=${product._id}&id=${id}`;
                });

                resultsContainer.appendChild(productElement);
            });
        } else {
            resultsContainer.textContent = 'No products found.';
        }

    } catch (error) {
        console.error("Fetch error: ", error);
        resultsContainer.textContent = 'An error occurred while fetching products.';
    }
}

async function searchproducts() {
    const urlParams = new URLSearchParams(window.location.search);
    const itemParam = urlParams.get('item');
    console.log("item : ", itemParam);

    let response = await fetch(`/searchproducts/${itemParam}`);
    let parsed_response = await response.json();
    console.log("parsed_response : ", parsed_response);

    let searchproduct = parsed_response.product.searchproduct;
    let searchproductitem = parsed_response.product.searchproductitem;
    let searchproductcategory = parsed_response.product.searchproductcategory;

    let searchitemslist = document.getElementById('searchitemslist');
    let datacontainersearchcategory = document.getElementById('datacontainersearchcategory');

    // Clear any existing content
    searchitemslist.innerHTML = '';
    datacontainersearchcategory.innerHTML = '';

    // Maintain separate sets for each container to prevent duplication
    const firstContainerSet = new Set();
    const secondContainerSet = new Set();
    const thirdContainerSet = new Set();

    // Add the main `searchproduct` to the first container
    if (!firstContainerSet.has(searchproduct._id)) {
        firstContainerSet.add(searchproduct._id);

        // Create a makegrid-row container
        let row = document.createElement('div');
        row.classList.add('makegrid-row'); // Use your existing makegrid-row class

        // First column: searchproduct
        let col1 = document.createElement('div');
        col1.classList.add('grid-column'); // Use your existing grid-column class
        col1.innerHTML = `
           <div class="d-flex flex-column shadow-none p-3 mb-5 bg-light rounded">
               <div class="text-center"><img src="${searchproduct.images[0]}" class="card-img-top" alt="Item Image"></div>
               <div class="text-center">
                   <div class="mt-4 text-md text-gray-800 ms-1">${searchproduct.name}</div>
                   <div class="mt-1 text-lg font-bold text-black">Offer: ₹${searchproduct.discountPrice}</div>
                   <div class="text-md text-gray-600 text-decoration-line-through">Price: ₹${searchproduct.price}</div>
                   <div class="mt-1 text-sm text-gray-500">${searchproduct.stockStatus}</div>
               </div>
           </div>
        `;

        // Append the first column to the row
        row.appendChild(col1);

        // Find unique product in `searchproductitem`
        let uniqueItems = searchproductitem.filter(item =>
            item._id !== searchproduct._id && !secondContainerSet.has(item._id)
        );

        if (uniqueItems.length > 0) {
            // Display the first unique product in the second column
            let col2 = document.createElement('div');
            col2.classList.add('grid-column'); // Use your existing grid-column class
            let uniqueItem = uniqueItems[0]; // Get the first unique product

            secondContainerSet.add(uniqueItem._id); // Add to the second container set
            col2.innerHTML = `
               <div class="d-flex flex-column shadow-none p-3 mb-5 bg-light rounded">
                   <div class="text-center"><img src="${uniqueItem.images[0]}" class="card-img-top" alt="Item Image"></div>
                   <div class="text-center">
                       <div class="mt-4 text-md text-gray-800 ms-1">${uniqueItem.name}</div>
                       <div class="mt-1 text-lg font-bold text-black">Offer: ₹${uniqueItem.discountPrice}</div>
                       <div class="text-md text-gray-600 text-decoration-line-through">Price: ₹${uniqueItem.price}</div>
                       <div class="mt-1 text-sm text-gray-500">${uniqueItem.stockStatus}</div>
                   </div>
               </div>
            `;
            row.appendChild(col2); // Append the second column to the row
        } else {
            // No unique items found, show a placeholder
            let placeholderCol = document.createElement('div');
            placeholderCol.classList.add('grid-column');
            placeholderCol.innerHTML = `<div class="text-center mt-5">No additional items found</div>`;
            row.appendChild(placeholderCol);
        }

        // Append the row to searchitemslist
        searchitemslist.appendChild(row);
    }



    // Add categories from `searchproductcategory` to the third container, excluding duplicates
    searchproductcategory.forEach(category => {
        if (
            !firstContainerSet.has(category._id) &&
            !secondContainerSet.has(category._id) &&
            !thirdContainerSet.has(category._id)
        ) {
            thirdContainerSet.add(category._id);
            let categoryDiv = document.createElement('div');
            categoryDiv.classList.add('category-item', 'flex-column'); // Use your existing category-item and flex-column classes
            categoryDiv.innerHTML = `
               <div class="d-flex flex-column shadow-none p-3 mb-5 bg-light rounded">
                   <div class="text-center"><img src="${category.images[0]}" class="card-img-top" alt="Category Image"></div>
                   <div class="text-center">
                       <div class="mt-4 text-md text-gray-800 ms-1">${category.name}</div>
                       <div class="mt-1 text-lg font-bold text-black">Offer: ₹${category.discountPrice}</div>
                       <div class="text-md text-gray-600 text-decoration-line-through">Price: ₹${category.price}</div>
                       <div class="mt-1 text-sm text-gray-500">${category.stockStatus}</div>
                   </div>
               </div>
            `;
            datacontainersearchcategory.appendChild(categoryDiv);
        }
    });
}

async function allproducts() {
    const urlParams = new URLSearchParams(window.location.search);
    let id = urlParams.get('id');
    console.log("checkid : ", id);

    if (id === null) {
        id = 'null';  // Default to 'null' if no ID is found
    }

    try {
        let allproducts = document.getElementById('allproducts');
        let rows = '';  // Initialize rows to an empty string

        let response = await fetch(`/getallproducts/${id}`);
        let parsed_response = await response.json();

        if (parsed_response.success && Array.isArray(parsed_response.allproducts)) {
            let allProductdata = parsed_response.allproducts;
            console.log("allProductdata: ", allProductdata);

            // Loop through each product and generate the HTML for display
            for (let i = 0; i < allProductdata.length; i++) {
                const imageUrl = allProductdata[i].images && allProductdata[i].images[0] ? allProductdata[i].images[0] : 'fallback-image-url.jpg'; // Use fallback image if not available

                rows += `
                   <div class="d-flex flex-column bg-light shadow-sm p-3 mb-5 bg-body rounded" >

  <button class="border-0 bg-white " onclick="singleProduct('${allProductdata[i]._id}', '${id}','${allProductdata[i].category
                    }')">
    <div class="text-center">
        <img src="${imageUrl}" class="card-img-top" alt="Item Image">
    </div>
    <div class="text-center">
        <div class="mt-4 text-sm text-gray-800 ms-1">
            ${allProductdata[i].name}
        </div>
        <!-- Price and offer -->
        <div class="mt-1 text-lg font-bold text-black">
            Offer: ₹${allProductdata[i].discountPrice}
        </div>
        <div class="text-md text-gray-600 text-decoration-line-through">
            Price: ₹${allProductdata[i].price}
        </div>
        <!-- Stock status -->
        <div class="mt-1 text-sm text-gray-500">
            ${allProductdata[i].stockStatus}
        </div>
        
    </div>
  </button>
    <div class="bg-white text-center pb-2"><button class="addtocartbtn mt-2 " onclick="addToCart('${allProductdata[i]._id}')">Add to Cart</button></div>
</div>
                `;
            }

            allproducts.innerHTML = rows;

            let cartcountElement = document.getElementById('cartcount')
            

            if (parsed_response.count > 0) {
                cartcountElement.style.display = 'block';
                cartcountElement.innerHTML = parsed_response.count;
            } else {
                cartcountElement.style.display = 'none';
            }



        } else {
            allproducts.innerHTML = 'No products found.';
        }

    } catch (error) {
        console.log("Error: ", error);
        allproducts.innerHTML = 'An error occurred while fetching products.';
    }
}

async function singleProduct(id, userid, categoryid) {
    alert("button clicked");
    console.log("Redirecting to single product page with ID:", id);
    console.log("Redirecting to single product page with ID:", userid);
    window.location = `singleProduct.html?productid=${id}&id=${userid}&categoryid=${categoryid}`;
}


async function getSingleProduct() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('productid');
    console.log("checkid:", id);

    try {
        // Fetch product data from server
        const response = await fetch(`/getSingleproduct/${id}`);
        const parsed_response = await response.json();
        console.log("parsed_response:", parsed_response);

        // Populate category breadcrumb
        const categorydiv = document.getElementById('categorydiv');
        const categoryText = `
            HOME > ${parsed_response.productcategory || 'Unknown'} 
            > ${parsed_response.product.subcategory || 'Unknown'} 
            > ${parsed_response.product.item || 'Unknown'} 
            > ${parsed_response.product.name || 'Unknown'}
        `;
        categorydiv.innerHTML = `<div class="categoryText">${categoryText}</div>`;

        // Populate product details
        const singleproductcontainer = document.getElementById('singleproductcontainer');
        const rows = `
        <div class="container my-4">
            <div class="row">
                <!-- Left Side Images -->
                <div class="col-2">
                    <div class="d-flex flex-column gap-1" id="imageunzoom">
                        ${parsed_response.product.images
                .map(
                    (image) =>
                        `<img 
                                        alt="Product Image" 
                                        class="img-fluid" 
                                        height="100" 
                                        src="${sanitizeUrl(image)}" 
                                        width="100" 
                                        onclick="displayZoomedImage('${sanitizeUrl(image)}')" 
                                    />`
                )
                .join("")}
                    </div>
                </div>
                
                <!-- Zoomed Image -->
                <div class="col-7">
                    <div class="col-12 text-center mt-1" id="imagezoom">
                        <img id="zoomedImg" class="zoomedImg" src="${sanitizeUrl(
                    parsed_response.product.images[0]
                )}" alt="Zoomed Image" />
                    </div>
                </div>
                
                <!-- Product Details -->
                <div class="col-3 pt-2">
                    <h1 class="fs-6 fw-bold">${parsed_response.product.description}</h1>
                    <div class="d-flex align-items-start mt-2 flex-column">
                        <span class="">Price ₹${parsed_response.product.price}</span>
                        <span class="text-success fs-6 fw-bold">Discount Price ₹${parsed_response.product.discountPrice}</span>
                        <span class="fs-6 fw-bold text-success">${parsed_response.product.weight} gm</span>
                    </div>
                    <div class=" mt-1">Inclusive of all taxes</div>
                    <button class="btn btn-dark fw-bold d-flex align-items-center px-2 py-1 gap-2 mt-3" onclick="addToWishlist('${parsed_response.product._id}')">
    <i class="fa fa-heart-o" aria-hidden="true"></i>
    <span class="">Wishlist</span>
</button>
<button 
    class="btn btn-dark fw-bold d-flex align-items-center px-2 py-1 mt-3" 
    onclick="order('${encodeURIComponent(JSON.stringify([parsed_response.product._id]))}')">
     <i class="fas fa-shopping-cart me-2"></i>
    Buy Now
</button>

                </div>
            </div>
        </div>
        `;

        singleproductcontainer.innerHTML = rows;

        let datacontainercategorysinglepage = document.getElementById('datacontainercategorysinglepage');
        let rows2 = '';

        for (i = 0; i < parsed_response.categoryProduct.length; i++) {
            const imageUrl = parsed_response.categoryProduct[i].images && parsed_response.categoryProduct[i].images[0] ? parsed_response.categoryProduct[i].images[0] : 'fallback-image-url.jpg';

            rows2 = rows2 + `
            <div class="d-flex flex-column shadow-none p-3 mb-5 bg-light rounded" onclick="singleProduct('${parsed_response.categoryProduct[i]._id}', '${id}','${parsed_response.categoryProduct[i].category
                }')">
           <div class="text-center"><img src="${imageUrl}" class="card-img-top" alt="Item Image"></div>
           <div class="text-center">
           <div class="mt-4 text-sm text-gray-800 ms-1">
                ${parsed_response.categoryProduct[i].name}
            </div>

            <div class="mt-1 text-lg font-bold text-black">
               Offer: ₹${parsed_response.categoryProduct[i].discountPrice}
            </div>
            <div class="text-md text-gray-600 text-decoration-line-through">
                Price: ₹${parsed_response.categoryProduct[i].price}
            </div>

            <!-- Stock status -->
            <div class="mt-1 text-sm text-gray-500">
                ${parsed_response.categoryProduct[i].stockStatus}
            </div>
        </div>
           </div>
            </div>
`
        }
        datacontainercategorysinglepage.innerHTML = rows2;

    } catch (error) {
        console.error("Error fetching product:", error);
    }
}

// Sanitize and encode the URL
function sanitizeUrl(url) {
    try {
        if (!url) throw new Error("Invalid URL");
        // Replace backslashes with forward slashes and remove extra slashes
        const normalizedUrl = url.replace(/\\/g, '/').replace(/\/{2,}/g, '/');
        return encodeURI(decodeURIComponent(normalizedUrl.trim()));
    } catch (error) {
        console.error("Error sanitizing URL:", error);
        return 'path/to/placeholder-image.jpg'; // Fallback placeholder
    }
}


// Handle zoomed image display
function displayZoomedImage(imageUrl) {
    console.log("Original Image URL:", imageUrl);
    const zoomedImgElement = document.getElementById('zoomedImg');
    if (zoomedImgElement) {
        zoomedImgElement.src = sanitizeUrl(imageUrl); // Use sanitized URL
    } else {
        console.error("Zoomed image element not found");
    }
}

//redirect to addtocart page
function addtocartpage() {
    const urlParams = new URLSearchParams(window.location.search);
    let id = urlParams.get('id');
    console.log("User ID:", id);
    if (!id) {
        alert("login to see addtocart")
    } else {
        window.location = `Addtocart.html?id=${id}`
    }
}

//AddToCArt
async function addToCart(pid) {
    alert("button clicked")
    const productid = pid;
    console.log("Product ID:", productid);

    // Extract user ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    let id = urlParams.get('id');
    console.log("User ID:", id);

    if (!id) {
        alert("User not logged in. Please log in to proceed.");
        return;
    }

    // Retrieve token from localStorage
    const token = localStorage.getItem(id);
    if (!token) {
        alert("Please log in to add items to your cart.");
        return;
    }

    try {
        // Make PUT request to server
        const response = await fetch(`/addtoCart/${id}/${productid}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        const parsedResponse = await response.json();
        console.log("Server Response:", parsedResponse);

        // Handle server response
        if (response.ok) {
            alert(parsedResponse.message || "Product added to cart successfully!");
        } else {
            alert(parsedResponse.message || "Failed to add product to cart. Please try again.");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("An error occurred while adding the product to the cart. Please try again.");
    }
}

//update add to cart
async function removeFromCart(pid) {
    const productid = pid;
    console.log("Product ID:", productid);

    // Extract user ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    let id = urlParams.get('id');
    console.log("User ID:", id);

    if (!id) {
        alert("User not logged in. Please log in to proceed.");
        return;
    }

    // Retrieve token from localStorage
    const token = localStorage.getItem(id);
    if (!token) {
        alert("Please log in to add items to your cart.");
        return;
    }

    try {
        // Make PUT request to server
        const response = await fetch(`/updateaddtoCart/${id}/${productid}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        const parsedResponse = await response.json();
        console.log("Server Response:", parsedResponse);

        // Handle server response
        if (response.ok) {
            alert(parsedResponse.message);
        } else {
            alert(parsedResponse.message);
        }
    } catch (error) {
        console.error("Error:", error);
        alert("An error occurred while adding the product to the cart. Please try again.");
    }
}

// display all products in addtocart
async function addtocartAllproducts() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    console.log("User ID:", id);

    const token = localStorage.getItem(id);
    if (!token) {
        console.error("No token found for the user.");
        alert("Please log in to access your cart.");
        return;
    }

    try {
        const response = await fetch(`/getalladdtoCart/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            console.error("Failed to fetch cart data:", response.statusText);
            alert("Could not retrieve cart data. Please try again later.");
            return;
        }

        const { products, count, address, totalprice } = await response.json();

        if (!products || !Array.isArray(products)) {
            console.error("Unexpected API response:", { products });
            alert("Invalid data received from server.");
            return;
        }

        // Update Cart Count
        document.getElementById('addtocartcount').innerHTML = `
            <div class="fs-6 p-3 border-bottom border-1 fw-bold mb-2">
                <i class="fa fa-long-arrow-left" aria-hidden="true"></i> My Cart (${count})
            </div>`;

        // Update Delivery Address
        document.getElementById("addtocartaddress").innerHTML = `
            <div class="bg-white p-4 border-bottom border-1 mb-2 pb-2">
                <div class="d-flex align-items-center justify-content-between">
                    <div class="d-flex align-items-center">
                        <i class="fas fa-map-marker-alt text-pink fs-5"></i>
                        <span class="ms-2 fs-5 fw-semibold">${address}</span>
                    </div>
                    <button class="btn btn-link text-purple fw-semibold">Check</button>
                </div>
                <p class="text-success mt-2">Get delivery in 2 days, 24 Nov</p>
            </div>`;

        // Render Cart Products
        const fetchallcartproducts = document.getElementById('fetchallcartproducts');
        fetchallcartproducts.innerHTML = ''; // Clear existing content

        products.forEach(product => {
            fetchallcartproducts.innerHTML += `
                <div class="bg-white p-4 border-bottom border-1 mt-2 mb-4">
                    <div class="d-flex align-items-center">
                        <img src="${product.images[0]}" alt="${product.name}" class="rounded me-3" width="60" height="60">
                        <div>
                            <h5 class="mb-1">${product.name}</h5>
                            <div class="d-flex align-items-center">
                                <span class="fw-bold text-primary">₹${product.price}</span>
                                <span class="text-success ms-2">${product.discountPrice}% off</span>
                            </div>
                            <div class="mt-2">
                                <button class="btn btn-sm btn-outline-danger me-2" onclick="removeFromCart('${product._id}')">Remove</button>
                                <button class="btn btn-sm btn-outline-secondary" onclick="addToWishlist('${product._id}')">Move to Wishlist</button>
                            </div>
                        </div>
                    </div>
                </div>`;
        });
        let productIdsString = JSON.stringify(products.map(product => product._id));

        let Totalprice = document.getElementById('totalprice');
        Totalprice.innerHTML = `
            <div class="d-flex justify-content-between align-items-center p-3 mt-2 border-bottom border-1">
                <div class="fs-5 fw-semibold text-dark">
                    Total Price: <span class="text-primary">₹${totalprice}</span>
                </div>
                <button class="btn btn-primary fw-semibold" onclick="order('${encodeURIComponent(productIdsString)}')">Proceed to Pay
                </button>
            </div>`;



    } catch (error) {
        console.error("Error:", error);
        alert("An error occurred while fetching your cart. Please try again later.");
    }
}


// redirect to wishlist page
function addtoWhishlistpage() {
    const urlParams = new URLSearchParams(window.location.search);
    let id = urlParams.get('id');
    console.log("User ID:", id);
    if (!id) {
        alert("login to see addtocart")
    } else {
        window.location = `Wishlist.html?id=${id}`
    }
}

// Add to whishlist
async function addToWishlist(pid) {
    const productid = pid;
    console.log("Product ID:", productid);

    // Extract user ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    let id = urlParams.get('id');
    console.log("User ID:", id);

    if (!id) {
        alert("User not logged in. Please log in to proceed.");
        return;
    }

    // Retrieve token from localStorage
    const token = localStorage.getItem(id);
    if (!token) {
        alert("Please log in to add items to your cart.");
        return;
    }

    try {
        // Make PUT request to server
        const response = await fetch(`/addtoWishlist/${id}/${productid}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        const parsedResponse = await response.json();
        console.log("Server Response:", parsedResponse);

        // Handle server response
        if (response.ok) {
            alert(parsedResponse.message || "Product added to Whishlist successfully!");
        } else {
            alert(parsedResponse.message || "Failed to add product to Whishlist. Please try again.");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("An error occurred while adding the product to the Whishlist. Please try again.");
    }
}

//update Whishlist
async function removeFromwishlist(pid) {
    const productid = pid;
    console.log("Product ID:", productid);

    // Extract user ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    let id = urlParams.get('id');
    console.log("User ID:", id);

    if (!id) {
        alert("User not logged in. Please log in to proceed.");
        return;
    }

    // Retrieve token from localStorage
    const token = localStorage.getItem(id);
    if (!token) {
        alert("Please log in to add items to your cart.");
        return;
    }

    try {
        // Make PUT request to server
        const response = await fetch(`/updateWishlist/${id}/${productid}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        const parsedResponse = await response.json();
        console.log("Server Response:", parsedResponse);

        // Handle server response
        if (response.ok) {
            alert(parsedResponse.message);
        } else {
            alert(parsedResponse.message);
        }
    } catch (error) {
        console.error("Error:", error);
        alert("An error occurred while adding the product to the cart. Please try again.");
    }
}

//wishlistpage all Products display
async function addWishlistAllproducts() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    console.log("User ID:", id);

    const token = localStorage.getItem(id);
    if (!token) {
        console.error("No token found for the user.");
        alert("Please log in to access your cart.");
        return;
    }

    try {
        const response = await fetch(`/getallWishlist/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            console.error("Failed to fetch cart data:", response.statusText);
            alert("Could not retrieve cart data. Please try again later.");
            return;
        }

        const { products, count, address, totalprice } = await response.json();

        if (!products || !Array.isArray(products)) {
            console.error("Unexpected API response:", { products });
            alert("Invalid data received from server.");
            return;
        }

        // Update Cart Count
        document.getElementById('addtocartcount').innerHTML = `
            <div class="fs-6 p-3 border-bottom border-1 fw-bold mb-2">
                <i class="fa fa-long-arrow-left" aria-hidden="true"></i> My Cart (${count})
            </div>`;

        // Update Delivery Address
        document.getElementById("addtocartaddress").innerHTML = `
            <div class="bg-white p-4 border-bottom border-1 mb-2 pb-2">
                <div class="d-flex align-items-center justify-content-between">
                    <div class="d-flex align-items-center">
                        <i class="fas fa-map-marker-alt text-pink fs-5"></i>
                        <span class="ms-2 fs-5 fw-semibold">${address}</span>
                    </div>
                    <button class="btn btn-link text-purple fw-semibold">Check</button>
                </div>
                <p class="text-success mt-2">Get delivery in 2 days, 24 Nov</p>
            </div>`;

        // Render Cart Products
        const fetchallcartproducts = document.getElementById('fetchallcartproducts');
        fetchallcartproducts.innerHTML = ''; // Clear existing content

        products.forEach(product => {
            fetchallcartproducts.innerHTML += `
                <div class="bg-white p-4 border-bottom border-1 mt-2 mb-4">
                    <div class="d-flex align-items-center">
                        <img src="${product.images[0]}" alt="${product.name}" class="rounded me-3" width="60" height="60">
                        <div>
                            <h5 class="mb-1">${product.name}</h5>
                            <div class="d-flex align-items-center">
                                <span class="fw-bold text-primary">₹${product.price}</span>
                                <span class="text-success ms-2">${product.discountPrice}% off</span>
                            </div>
                            <div class="mt-2">
                            <button class="btn btn-sm btn-outline-danger me-2" onclick="removeFromwishlist('${product._id}')">Remove</button>
                                 <button class="btn btn-sm btn-outline-secondary" onclick="addToCart('${product._id}')">Add to Cart</button>
                            </div>
                        </div>
                    </div>
                </div>`;
        });




    } catch (error) {
        console.error("Error:", error);
        alert("An error occurred while fetching your cart. Please try again later.");
    }
}

// to order products 
async function order(encodedProductIds) {
    // Decode the product IDs from URL parameter
    const productIds = JSON.parse(decodeURIComponent(encodedProductIds));

    // Get user ID and token from URL and localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('id');
    const token = localStorage.getItem(userId);

    // Validate user ID and token
    if (!userId || !token) {
        alert("User ID and token are required.");
        return;
    }

    // Prepare items list with default quantity
    const items = productIds.map(productId => ({
        product_id: productId,
        quantity: 1, // default quantity
    }));

    // Send request to the backend to place the order
    const response = await fetch(`/order/${userId}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ items }),
    });

    const data = await response.json();

    // If some products are already ordered, ask the user for confirmation to reorder
    if (response.status === 409 && data.message.includes("already been ordered")) {
        const reorderedProducts = data.reorderedProducts;

        const confirmReorder = confirm(`${data.message}\nDo you want to reorder the following products?\n` +
            reorderedProducts.map(item => item.productName).join("\n"));

        if (confirmReorder) {
            const reorderedItems = reorderedProducts.map(item => ({
                product_id: item.productId,
                quantity: item.quantity,
            }));

            // Send reorder request
            const reorderResponse = await fetch(`/reorder/${userId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({ items: reorderedItems }),
            });

            const reorderData = await reorderResponse.json();

            if (reorderResponse.ok) {
                alert("Products reordered successfully!");
                window.location.href = `order.html?id=${userId}`;
            } else {
                alert(reorderData.message || "Failed to reorder the products.");
            }
        } else {
            alert("Order canceled.");
        }

        // If the order is successfully placed
    } else if (response.ok) {
        alert("Order placed successfully!");
        window.location.href = `order.html?id=${userId}`;

        // Handle any other error responses
    } else {
        alert(data.message || "An error occurred while placing your order.");
    }
}

//redirect to order page
function orderpage() {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('id');

    if (userId) {
        window.location.href = `order.html?id=${userId}`;

    } else {
        alert("login To Continue")
    }
}

// to fetch all orders to display
async function getAllOrders() {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('id');
    const token = localStorage.getItem(userId);

    if (!userId || !token) {
        alert("User ID and token are required.");
        return;
    }

    try {
        // Make sure the endpoint is correct
        const response = await fetch(`/gatAllorders/${userId}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        const data = await response.json();

        // Check if the response is successful
        if (response.ok && data && data.orderedProducts) {
            const fetchallorderproducts = document.getElementById('fetchallorderproducts');
            fetchallorderproducts.innerHTML = ''; // Clear existing content

            const orderedProducts = data.orderedProducts;

            orderedProducts.forEach(product => {
                const productIdsString = `${product.productId},${product.quantity},${product.orderId}`; // Format the string with productId, quantity, and orderId

                fetchallorderproducts.innerHTML += `
                    <div class="bg-white p-4 border-bottom border-1 mt-2 mb-4">
                        <div class="d-flex align-items-center">
                            <!-- Product image -->
                            <img src="${product.productImage[0]}" alt="${product.productName}" class="rounded me-3" width="60" height="60">
                            <div>
                                <!-- Product name and description -->
                                <h5 class="mb-1">${product.productName}</h5>
                                <p class="text-muted">${product.productDescription}</p>
                                <div class="d-flex align-items-center">
                                    <span class="fw-bold text-primary">₹${product.price}</span>
                                    ${product.discountPrice ? `<span class="text-success ms-2">${product.discountPrice}% off</span>` : ''}
                                </div>
                                <div class="mt-2">
                                    <span class="text-muted">Quantity: ${product.quantity}</span>
                                </div>
                                <div class="mt-2">
                                    <button class="btn btn-sm btn-outline-danger me-2" onclick="removeFromOrder('${encodeURIComponent(productIdsString)}')">Cancel Order</button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            });
        } else {
            alert(data.message || "Failed to fetch ordered products.");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("An error occurred while fetching ordered products.");
    }
}

//cancel order
async function removeFromOrder(encodedProductIds1) {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('id');
    const token = localStorage.getItem(userId);

    const decodedString = decodeURIComponent(encodedProductIds1);
    const [productId, quantity, orderId] = decodedString.split(',');

    // Prepare the data to send in the request body
    const requestBody = {
        order_id: orderId,
        product_id: productId,
        quantity: parseInt(quantity) // Ensure quantity is a number
    };

    // Fetch request to cancel the order
    try {
        const response = await fetch(`/cancelOrder/${userId}`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        const data = await response.json();

        if (response.ok) {
            alert("Order canceled successfully!");
            // Optionally, you can refresh the order list or remove the canceled order from the UI
        } else {
            alert(data.message || "Failed to cancel order.");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("An error occurred while canceling the order.");
    }
}




























































