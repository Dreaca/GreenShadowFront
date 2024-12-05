// File: login.js

// Assuming the backend API URL for login
import {cropList, token} from "./db/db.js";

const LOGIN_API_URL = "http://localhost:8080/greenshadow/api/v1/auth/signIn";

// Event listener for form submission using jQuery
$("form").on("submit", function (event) {
    event.preventDefault(); // Prevent default form submission

    const email = $("#email").val();
    const password = $("#password").val();

    if (!email || !password) {
        alert("Please fill in both email and password fields.");
        return;
    }

    $.ajax({
        url: LOGIN_API_URL,
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify({ email, password }),
        success: function (data) {

            localStorage.setItem("authToken", data.token);
            console.log(data.token)

            var decoded = decodeJwtToken(data.token);

            redirectToDashboard(decoded.role);

        },
        error: function (xhr, status, error) {
            console.error("Login error:", error);
            alert("Login failed. Please check your credentials.");
        }
    });
});

// Function to redirect user based on role
function redirectToDashboard(role) {
    switch (role) {
        case "ROLE_ADMINISTRATOR":
            window.location.href = "./html/navPages/staff.html";
            break;
        case "ROLE_MANAGER":
            window.location.href = "./html/navPages/staff.html";
            break;
        case "ROLE_SCIENTIST":
            window.location.href = "./html/navPages/crop.html";
            break;
        case "ROLE_OTHER":
            window.location.href = "./html/navPages/log.html";
            break;
        default:
            alert("Unknown role. Access restricted.");
            localStorage.clear(); // Clear any stored data if role is invalid
    }
}

// Utility to restrict access to pages
function checkAccess(allowedRoles) {
    const token = localStorage.getItem("authToken");
    const role = localStorage.getItem("userRole");

    if (!token || !role || !allowedRoles.includes(role)) {
        alert("Access denied. Redirecting to login.");
        window.location.href = "index.html"; // Redirect to login page
    }
}
function decodeJwtToken(token){
    const parts = token.split('.'); // Split the token into header, payload, and signature
    if (parts.length !== 3) {
        throw new Error('Invalid JWT token');
    }

    // Helper to decode Base64Url
    const decodeBase64Url = (base64Url) => {
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(atob(base64));
    };

    // Decode the payload
    return decodeBase64Url(parts[1]);
}
