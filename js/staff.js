$(document).ready(function () {
    $("#add-new-member").on("click", function () {
        console.log("clicked")
        const staffDTO = {
            firstName: $("#firstName").val(),
            lastName: $("#lastName").val(),
            designation: $("#designation").val(),
            gender: $('input[name="gender"]:checked').val(),
            joinedDate: $("#joinedDate").val(),
            DOB: $("#dob").val(),
            addressLine1: $("#address1").val(),
            addressLine2: $("#address2").val(),
            addressLine3: $("#address3").val(),
            addressLine4: $("#address4").val(),
            addressLine5: $("#address5").val(),
            contactNo: $("#contactNo").val(),
            email: $("#email").val(),
            role: $("#role").val()
        };

        // Validate required fields
        // if (!staffDTO.firstName || !staffDTO.lastName || !staffDTO.designation || !staffDTO.gender ||
        //     !staffDTO.joinedDate || !staffDTO.dob || !staffDTO.contactNo || !staffDTO.email) {
        //     alert("Please fill all the required fields.");
        //     return;
        // }

        // AJAX POST request
        $.ajax({
            url: "http://localhost:8080/greenshadow/api/v1/staff/save",
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify(staffDTO),
            success: function (response) {
                console.log("Staff member added successfully:", response);
                alert("Staff member added successfully!");
                $("#add-staff-member").modal("hide"); // Close the modal
                // Optionally, refresh the staff list or reset the form
                $("#add-staff-member form")[0].reset(); // Reset the form
            },
            error: function (xhr, status, error) {
                console.error("Error adding staff member:", xhr.responseText || status);
                alert("Failed to add staff member. Please try again.");
            }
        });
    });
    // Update Member
    // Handle Search Member button
    $(".btn-outline-dark").on("click", function () {
        const staffId = $("#update-member").val().trim();

        if (!staffId) {
            alert("Please enter a valid Staff ID.");
            return;
        }

        // Fetch staff data by ID
        $.ajax({
            url: `http://localhost:8080/greenshadow/api/v1/staff/${staffId}`, // Replace with your API endpoint
            method: "GET",
            success: function (staff) {
                // Populate the second modal with the fetched staff data
                $("#firstName-up").val(staff.firstName);
                $("#lastName-up").val(staff.lastName);
                $("#designation-up").val(staff.designation);
                $(`input[name="gender"][value="${staff.gender}"]`).prop("checked", true);
                $("#joinedDate-up").val(staff.joinedDate);
                $("#dob-up").val(staff.dob);
                $("#address1-up").val(staff.address1);
                $("#address2-up").val(staff.address2);
                $("#address3-up").val(staff.address3);
                $("#address4-up").val(staff.address4);
                $("#address5-up").val(staff.address5);
                $("#contactNo-up").val(staff.contactNo);
                $("#email-up").val(staff.email);
                $("#role-up").val(staff.role);
                // Open the second modal
                $("#update-staff-member1").modal("show");
            },
            error: function (xhr) {
                console.error("Error fetching staff member:", xhr.responseText);
                alert("Staff member not found or an error occurred.");
            }
        });
    });

    // Handle Submit button in the second modal
    $("#update-member-btn").on("click", function () {
        const staffId = $("#update-member").val().trim();

        if (!staffId) {
            alert("Staff ID is missing. Please search for the staff member again.");
            return;
        }

        // Collect updated data
        const updatedStaffDTO = {
            firstName: $("#firstName-up").val(),
            lastName: $("#lastName-up").val(),
            designation: $("#designation-up").val(),
            gender: $('input[name="gender"]:checked').val(),
            joinedDate: $("#joinedDate-up").val(),
            dob: $("#dob-up").val(),
            address1: $("#address1-up").val(),
            address2: $("#address2-up").val(),
            address3: $("#address3-up").val(),
            address4: $("#address4-up").val(),
            address5: $("#address5-up").val(),
            contactNo: $("#contactNo-up").val(),
            email: $("#email-up").val(),
            role: $("#role-up").val()
        };

        // Validate required fields
        if (!updatedStaffDTO.firstName || !updatedStaffDTO.lastName || !updatedStaffDTO.designation ||
            !updatedStaffDTO.gender || !updatedStaffDTO.joinedDate || !updatedStaffDTO.dob ||
            !updatedStaffDTO.contactNo || !updatedStaffDTO.email) {
            alert("Please fill all the required fields.");
            return;
        }

        // Send updated data to the backend
        $.ajax({
            url: `http://localhost:8080/greenshadow/api/v1/staff/update/${staffId}`, // Replace with your API endpoint
            method: "PUT",
            contentType: "application/json",
            data: JSON.stringify(updatedStaffDTO),
            success: function (response) {
                console.log("Staff member updated successfully:", response);
                alert("Staff member updated successfully!");
                $("#update-staff-member1").modal("hide"); // Close the modal
                // Optionally, refresh the staff list or reset the form
            },
            error: function (xhr) {
                console.error("Error updating staff member:", xhr.responseText);
                alert("Failed to update staff member. Please try again.");
            }
        });
    });
});

