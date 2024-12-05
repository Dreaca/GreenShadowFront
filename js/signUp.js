$(document).ready(function () {

    $("form").on("submit", function (event) {
        event.preventDefault();
        const password = $("#password").val().trim();

        if (password!== $("#confirmPassword").val().trim()){
            alert("Password is mismatched");
        }


        const formData = new FormData();

        formData.append("email", $("#email").val());
        formData.append("password", password);


        sendMultipartRequest("http://localhost:8080/greenshadow/api/v1/auth/signup", formData)
            .then(response => {
                console.log("SignUp successful:", response);
                localStorage.setItem("authToken",response.token)
                alert("Sign-up completed successfully!");
                window.location.href = "index.html";
            })
            .catch(error => {
                console.error("Error during sign-up:", error);
                alert("An error occurred during sign-up. Please try again.");
            });
    });

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
