$(".logout-btn").on("click", function() {
    localStorage.removeItem("authToken");
    window.location.href = "../../index.html";
})