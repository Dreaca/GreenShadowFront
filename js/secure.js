import { token } from "./db/db.js";

$(document).ready(function () {
    try {
        const decoded = decodeJwtToken(token);
        console.log(decoded.role);
        restrictAccess(decoded.role);
    } catch (error) {
        console.error("Error decoding token:", error.message);
        window.location.href = "denied.html"; // Redirect to access denied if decoding fails
    }
});

function decodeJwtToken(token) {
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

function restrictAccess(role) {
    // Define access mapping
    const roleAccessMap = {
        ROLE_MANAGER: ["staff.html", "field.html", "crop.html", "equipment.html", "vehicle.html", "log.html"],
        ROLE_ADMINISTRATOR: ["staff.html", "equipment.html", "vehicle.html"],
        ROLE_SCIENTIST: ["field.html", "crop.html", "log.html"],
    };

    // Get current page
    const currentPage = window.location.pathname.split("/").pop();

    // Check access for the role
    const allowedPages = roleAccessMap[role] || [];
    if (!allowedPages.includes(currentPage)) {
        window.location.href = "denied.html"; // Redirect if access is not allowed
    }
}
