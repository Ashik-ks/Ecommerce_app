

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
        const response = await fetch('/category');
        const data = await response.json();

        // Check if the data structure is correct
        console.log("Fetched data:", data);

        // Check if categories exist
        if (!data || !data.data || data.data.length === 0) {
            console.error('No categories found.');
            return;
        }

        // Cache category display div
        const categoryDisplay = document.getElementById('category-display');

        // Create a map of categories by their names, making sure all category names are in lowercase
        const categoryMap = {};
        data.data.forEach((category) => {
            categoryMap[category.name.toLowerCase()] = category;  // Convert category name to lowercase
        });

        console.log("Category Map:", categoryMap);

        // Add event listeners for each category
        document.querySelectorAll('.category').forEach((categoryElement) => {
            const categoryKey = categoryElement.dataset.category.toLowerCase();  // Convert to lowercase

            // Add event listener for mouseover
            categoryElement.addEventListener('mouseover', () => {
                console.log(`Mouseover triggered for: ${categoryKey}`);

                // Clear the existing content before updating
                categoryDisplay.innerHTML = '';

                // Get the category data based on the key
                const category = categoryMap[categoryKey];

                if (category) {
                    console.log("Category data: ", category);

                    // Create title element with bold and underline styles
                    const title = document.createElement('h3');
                    title.textContent = category.name;
                    title.style.fontWeight = 'bold';
                    title.style.textDecoration = 'underline';


                    const itemList = document.createElement('ul');

                    // Loop through the subcategories and add their items
                    category.subcategories.forEach((subcategory) => {
                        console.log("Subcategory data: ", subcategory);
                        const subcategoryItem = document.createElement('li');
                        subcategoryItem.textContent = subcategory.name;

                        // Check if items exist and append them
                        if (subcategory.items) {
                            const itemsList = document.createElement('ul');
                            subcategory.items.forEach((item) => {
                                const itemElement = document.createElement('li');
                                itemElement.textContent = item.name;
                                itemElement.style.fontSize = '0.85rem';  // Make items smaller
                                itemsList.appendChild(itemElement);
                            });
                            subcategoryItem.appendChild(itemsList);
                        }

                        itemList.appendChild(subcategoryItem);
                    });

                    // Append the content to the display div
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
                    console.log('OTP sent to email');
                    alert("An OTP has been sent to your email");
                } else {
                    alert('Error sending OTP');
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
                if (data.statusCode === 200) {
                    alert('Admin login successful!');
                    window.location.href = `admin.html?id=${data.tokenid}`;
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

                    // Redirect based on user type (Buyer, Seller, Admin, etc.)
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
        } else {
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
    } else {
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
    console.log("delete : ",id,index)
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

function settingspage(){
    const location = window.location;
    const queryString = location.search;
    const urlParams = new URLSearchParams(queryString);
    const id = urlParams.get("id");

    if(id) {
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
        errorMessage.textContent = "Seller ID is missing in the URL.";
        submitButton.disabled = false;
        return;
    }

    const token = localStorage.getItem(id);
    if (!token) {
        errorMessage.textContent = "Authorization token is missing.";
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
        errorMessage.textContent = `Missing required fields: ${missingFields.join(', ')}`;
        successMessage.textContent = '';
        submitButton.disabled = false;
        return;
    }

    if (isNaN(productData.price) || productData.price <= 0) {
        errorMessage.textContent = "Price must be a positive number!";
        successMessage.textContent = '';
        submitButton.disabled = false;
        return;
    }

    if (isNaN(productData.stockQuantity) || productData.stockQuantity < 0) {
        errorMessage.textContent = "Stock quantity must be a non-negative integer.";
        successMessage.textContent = '';
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

        if (response.ok) {
            successMessage.textContent = "Product added successfully!";
            errorMessage.textContent = '';
            form.reset();
        } else {
            errorMessage.textContent = result.message || "An error occurred while adding the product.";
            successMessage.textContent = '';
        }
    } catch (error) {
        errorMessage.textContent = error.message || "Failed to submit product data.";
        successMessage.textContent = '';
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
                console.log("productImage : ",productImage)
                rows += `
                    <div class="product-card">
                        <img src="${productImage[0]}" alt="${product.name}" />
                        <h3>${product.name}</h3>
                        <p>Price: $${parseFloat(product.price).toFixed(2)}</p>
                        <p>Stock: ${product.stockQuantity}</p>
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













































// async function getselectbox() {
//     try {
//         let response = await fetch('/getusertypes');
//         console.log("response : ", response);

//         let Parsed_response = await response.json();
//         console.log("Parsed_response : ", Parsed_response);

//         let Parsed_response_usertypes = Parsed_response.userTypes;
//         console.log("Parsed_response_usertypes : ", Parsed_response_usertypes);

//         if (!Parsed_response_usertypes || Parsed_response_usertypes.length === 0) {
//             console.log("No user types available");
//             return;
//         }

//         let select = document.getElementById('userTypeSelect');
//         let rows = '';

//         // rows += `<option value="none">none</option>`;

//         for (let i = 0; i < Parsed_response_usertypes.length; i++) {
//             rows += `
//             <option value="${Parsed_response_usertypes[i].userType}">${Parsed_response_usertypes[i].userType}</option>
//             `;
//         }

//         select.innerHTML = rows;
//     } catch (error) {
//         console.error("Error fetching getusertypes: ", error);
//     }
// }

// async function adduser(event) {
//     event.preventDefault();  // Prevent form submission and page reload

//     // Get input values
//     let fullname = document.getElementById('fullname').value;
//     let email = document.getElementById('email').value;
//     let password = document.getElementById('password').value;
//     let phonenumber = document.getElementById('phonenumber').value;
//     let street = document.getElementById('street').value;
//     let city = document.getElementById('city').value;
//     let state = document.getElementById('state').value;
//     let country = document.getElementById('country').value;
//     let pincode = document.getElementById('pincode').value;
//     let userType = document.getElementById('userTypeSelect').value; // UserType from select

//     // Simple form validation
//     if (!fullname || !email || !password || !phonenumber || !street || !city || !state || !country || !pincode || !userType) {
//         alert("All fields are required.");
//         return;  // Stop further execution if validation fails
//     }

//     // Validate email format
//     const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
//     if (!emailPattern.test(email)) {
//         alert("Please enter a valid email address.");
//         return;
//     }

//     // Validate phone number (assuming 10-digit number)
//     const phonePattern = /^\d{10}$/;
//     if (!phonePattern.test(phonenumber)) {
//         alert("Please enter a valid phone number (10 digits).");
//         return;
//     }

//     // Validate pincode (assuming 6-digit number)
//     const pincodePattern = /^\d{6}$/;
//     if (!pincodePattern.test(pincode)) {
//         alert("Please enter a valid pincode (6 digits).");
//         return;
//     }

//     // Construct the data object
//     let data = {
//         fullname,
//         email,
//         password,
//         phonenumber,
//         address: {
//             street,
//             city,
//             state,
//             country,
//             pincode
//         },
//         userType // User type string
//     };

//     let str_data = JSON.stringify(data);
//     console.log("str_data: ", str_data);

//     try {
//         // Send the POST request
//         let response = await fetch('/users', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: str_data,
//         });

//         // Check if the request was successful
//         if (response.ok) {
//             let parsed_response = await response.json(); // Expecting a JSON response
//             console.log("parsed_response: ", parsed_response);

//             // If the response indicates success, redirect
//             if (parsed_response.success) {
//                 alert("User added successfully!");
//                 alert("Please Login to Continue")
//                 window.location.href = `login.html`; // Redirect to index.html
//             } else {
//                 alert(parsed_response.message || "Something went wrong. Please try again.");
//             }
//         } else {
//             const parsed_response = await response.json();
//             alert(parsed_response.message || "Failed to add user. Server returned an error.");
//         }
//     } catch (error) {
//         // Catch network or other errors
//         console.error("Error: ", error);
//         alert("An error occurred while adding the user.");
//     }
// }

// async function loginUser(event) {
//     event.preventDefault();  // Prevent default form submission

//     console.log("Login button clicked...");

//     // Get input values
//     let email = document.getElementById('email').value;
//     let password = document.getElementById('password').value;

//     // Construct request data
//     let data = { email, password };
//     let str_data = JSON.stringify(data);

//     try {
//         // Send the login request
//         let response = await fetch('/login', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: str_data
//         });

//         console.log("Response: ", response);

//         // Check if the response status is ok
//         if (!response.ok) {
//             let parsed_response = await response.json();
//             console.error("Error:", parsed_response.message);
//             alert(parsed_response.message || "Something went wrong. Please try again later.");
//             return;
//         }

//         // Parse the response
//         let parsed_response = await response.json();
//         console.log("Parsed Response: ", parsed_response);

//         if (parsed_response.statuscode === 200) {
//             console.log("Login successful");

//             // Extract token and user type information
//             let token_data = parsed_response.data.token;
//             let userId = parsed_response.data.tokenId;
//             let userTypes = parsed_response.data.userTypes;
//             console.log("User type: ", userTypes);

//             // Handle case if any expected data is missing
//             if (!token_data || !userId || !userTypes) {
//                 console.error("Missing token, user ID, or user type.");
//                 alert("Login data is incomplete. Please try again.");
//                 return;
//             }

//             // Store the token and user type in localStorage using userId as the key
//             let tokenKey = userId;  // Token key as user ID
//             localStorage.setItem(tokenKey, token_data);  // Store the token
//             localStorage.setItem(tokenKey + '_userType', userTypes.userType);  // Store the user type with the key
//             console.log("Token stored successfully");

//             // Redirect user based on user type
//             if (userTypes.userType === 'Admin') {
//                 alert("Admin login successful");
//                 window.location.href = `admin.html?id=${userId}&login=${tokenKey}`;
//             } else if (userTypes.userType === 'Seller') {
//                 alert("Seller login successful");
//                 window.location.href = `seller.html?id=${userId}&login=${tokenKey}`;
//             } else if (userTypes.userType === 'Buyer') {
//                 alert("Buyer login successful");
//                 window.location.href = `index.html?id=${userId}&login=${tokenKey}`;
//             } else {
//                 alert("Unknown user type. Please contact support.");
//             }

//         } else {
//             alert(parsed_response.message || "Login failed. Please check your credentials.");
//         }

//     } catch (error) {
//         console.error("Login Error: ", error);
//         alert("An error occurred while logging in. Please try again later.");
//     }
// }

// function checkUserStatus() {
//     // Get the current page location (URL)
//     let location = window.location;
//     console.log("location", location);

//     // Extract the query string from the URL
//     let querystring = location.search;
//     console.log("querystring", querystring);

//     // Parse the query string into URLSearchParams
//     let urlParams = new URLSearchParams(querystring);
//     console.log("url", urlParams);

//     // Get the 'id' and 'login' query parameters
//     let id = urlParams.get("id");
//     let tokenkey = urlParams.get('login');
//     console.log("id: ", id, typeof (id));
//     console.log("tokenkey: ", tokenkey);

//     // Check if both 'id' and 'tokenkey' are present
//     if (id && tokenkey) {
//         // Retrieve the user type from localStorage using the key `tokenkey + '_userType'`
//         let userType = localStorage.getItem(tokenkey + '_userType');
//         console.log("userType: ", userType);

//         if (userType) {
//             // If the user is a Buyer, hide Login and Signup, and show My Account
//             if (userType === 'Buyer') {
//                 document.getElementById('loginLink').style.display = 'none';  // Hide Login link
//                 document.getElementById('signupLink').style.display = 'none'; // Hide Signup link
//                 document.getElementById('myAccountLink').style.display = 'block';  // Show My Account link
//             } else {
//                 // Show other links based on user type if needed (e.g., Admin or Seller)
//                 document.getElementById('loginLink').style.display = 'none';
//                 document.getElementById('signupLink').style.display = 'none';
//                 document.getElementById('myAccountLink').style.display = 'none'; // For non-buyers
//             }
//         }
//     } else {
//         // If the user is not logged in (id or tokenkey missing), show Login and Signup links
//         document.getElementById('loginLink').style.display = 'block';
//         document.getElementById('signupLink').style.display = 'block';
//         document.getElementById('myAccountLink').style.display = 'none';  // Hide My Account link
//     }
// }







