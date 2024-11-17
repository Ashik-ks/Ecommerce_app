const dayjs = require('dayjs');
let fs = require('fs');
const path = require('path');  

exports.fileUpload = async function (file, directory) {
    return new Promise((resolve, reject) => {
        try {
            // Extract MIME type from the file header (base64 data URL)
            const mimeType = file.split(';')[0].split('/')[1];
            console.log("Mime type:", mimeType);

            // Check if the file is one of the supported formats
            const supportedMimeTypes = ["png", "jpeg", "jpg", "webp"];
            if (!supportedMimeTypes.includes(mimeType)) {
                return reject("Unsupported file type. Allowed types are png, jpeg, jpg, webp.");
            }

            // Generate a unique filename using the current time and a random number
            const filename = `${dayjs().format('YYYYMMDDHHmmssSSS')}_${Math.floor(Math.random() * 100)}.${mimeType}`;
            
            // Construct relative upload path (uploads/products)
            const uploadPath = path.join('uploads', directory);
            const filePath = path.join(uploadPath, filename);  // Full relative file path

            console.log("File path:", filePath); // Debugging

            // Extract the base64 content from the file data (after the comma)
            const base64Data = file.split(';base64,')[1];

            // Create the directory if it doesn't exist
            fs.mkdir(uploadPath, { recursive: true }, (err) => {
                if (err) {
                    reject(err.message || err);
                } else {
                    // Write the image data to the file
                    fs.writeFile(filePath, base64Data, { encoding: "base64" }, function (err) {
                        if (err) {
                            reject(err.message || err);
                        } else {
                            // Return the relative file path including 'uploads/'
                            resolve(filePath.replace('uploads' + path.sep, 'uploads/'));  // Cross-platform handling
                        }
                    });
                }
            });
        } catch (error) {
            reject(error.message || error);
        }
    });
};





