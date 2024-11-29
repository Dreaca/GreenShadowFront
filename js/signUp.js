$(document).ready(function () {
    // Event listener for form submission
    $("form").on("submit", function (event) {
        event.preventDefault(); // Prevent default form submission

        // Collect StaffDTO and UserDTO data
        const formData = new FormData();
        formData.append("firstName", $("#firstName").val());
        formData.append("lastName", $("#lastName").val());
        formData.append("designation", $("#designation").val());
        formData.append("gender", $('input[name="gender"]:checked').val());
        formData.append("joinedDate", $("#joinedDate").val());
        formData.append("dob", $("#dob").val());
        formData.append("role", $("#role").val());
        formData.append("address1", $("#address1").val());
        formData.append("address2", $("#address2").val());
        formData.append("address3", $("#address3").val());
        formData.append("address4", $("#address4").val());
        formData.append("address5", $("#address5").val());
        formData.append("contactNo", $("#contactNo").val());
        formData.append("email", $("#email").val()); // Email is part of StaffDTO // Email for UserDTO
        formData.append("password", $("#password").val()); // Password for UserDTO

        // Send the data via AJAX
        sendMultipartRequest("http://localhost:8080/greenshadow/api/v1/auth/signup", formData)
            .then(response => {
                console.log("SignUp successful:", response);
                alert("Sign-up completed successfully!");
                window.location.href = "index.html";
            })
            .catch(error => {
                console.error("Error during sign-up:", error);
                alert("An error occurred during sign-up. Please try again.");
            });
    });

    /**
     * Sends an AJAX POST request with multipart/form-data
     * @param {string} url The endpoint URL.
     * @param {FormData} formData The form data to send.
     * @returns {Promise} - A promise that resolves with the server response.
     */
    function sendMultipartRequest(url, formData) {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: url,
                method: "POST",
                processData: false, // Prevent jQuery from processing the data
                contentType: false, // Let the browser handle the content type
                data: formData,
                success: function (response) {
                    resolve(response);
                },
                error: function (xhr, status, error) {
                    reject(`HTTP ${xhr.status}: ${xhr.statusText}`);
                }
            });
        });
    }
});
