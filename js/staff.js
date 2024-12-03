import {staffList} from "./db/db.js";
$(document).ready(function () {
    const token = localStorage.getItem("authToken")
    loadTable()
    $("#add-new-member").on("click", function () {
        const updateMember = new FormData();
        updateMember.append("firstName", $("#firstName").val());
        updateMember.append("lastName", $("#lastName").val());
        updateMember.append("designation", $("#designation").val());
        updateMember.append("gender", $('input[name="gender"]:checked').val());
        updateMember.append("joinedDate", $("#joinedDate").val());
        updateMember.append("dob", $("#dob").val());
        updateMember.append("role", $("#role").val());
        updateMember.append("address1", $("#address1").val());
        updateMember.append("address2", $("#address2").val());
        updateMember.append("address3", $("#address3").val());
        updateMember.append("address4", $("#address4").val());
        updateMember.append("address5", $("#address5").val());
        updateMember.append("contactNo", $("#contactNo").val());
        updateMember.append("email", $("#email").val());


            $.ajax({
                url: "http://localhost:8080/greenshadow/api/v1/staff/save",
                method: "POST",
                processData: false,
                contentType: false,
                data: updateMember,
                headers: {
                    'Authorization': 'Bearer ' + token // Include the Bearer token in the Authorization header
                },
                success: function (response) {
                    console.log("Staff member added successfully:", response);
                    alert("Staff member added successfully!");
                    $("#add-staff-member").modal("hide"); // Close the modal
                    $("#add-staff-member form")[0].reset(); // Reset the form
                    loadTable()
                },
                error: function (xhr, status, error) {
                    console.error("Error adding staff member:", xhr.responseText || status);
                    alert("Failed to add staff member. Please try again.");
                }
            });

    });
    $("#search-up").on("click", function () {
        const staffId = $("#update-member").val().trim();
        if (!staffId) {
            alert("Please enter a valid Staff ID.");
            return;
        }
        searchToUpdate(staffId)
        // Fetch staff data by ID

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
            addressLine1: $("#address1-up").val(),
            addressLine2: $("#address2-up").val(),
            addressLine3: $("#address3-up").val(),
            addressLine4: $("#address4-up").val(),
            addressLine5: $("#address5-up").val(),
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
            url: `http://localhost:8080/greenshadow/api/v1/staff/${staffId}`, // Replace with your API endpoint
            method: "PUT",
            contentType: "application/json",
            headers: {
              Authorization: "Bearer "+token
            },
            data: JSON.stringify(updatedStaffDTO),
            success: function (response) {
                console.log("Staff member updated successfully:", response);
                alert("Staff member updated successfully!");
                $("#update-staff-member1").modal("hide"); // Close the modal

                loadTable()
            },
            error: function (xhr) {
                console.error("Error updating staff member:", xhr.responseText);
                alert("Failed to update staff member. Please try again.");
            }
        });
    });
    function extractDate(isoDateString) {
        const date = new Date(isoDateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
        const day = String(date.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    }
    let memberIdToDelete;

    // Search button click event
    // Search member button click event
    $("#search-member-btn").on("click", function () {
        const username = $("#username-to-delete").val().trim();
        memberIdToDelete = username
        if (!username) {
            alert("Please enter a username.");
            return;
        }

        // Make an AJAX call to search for the member by username
        $.ajax({
            url: `http://localhost:8080/greenshadow/api/v1/staff/${username}`, // Replace with your API endpoint
            method: "GET",
            headers: {
                Authorization: "Bearer " + token // Ensure token is set correctly
            },
            success: function (data) {
                // Populate the confirmation modal with member data
                $("#delete-id").text(`ID: ${data.staffId}`);
                $("#delete-name").text(`Name: ${data.firstName} ${data.lastName}`);
                $("#delete-designation").text(`Designation: ${data.designation}`);

                // Store member ID for deletion
                $("#delete-member-btn").data("member-id", data.staffId);

                // Show the confirmation modal
                $("#confirmation").modal("show");
            },
            error: function (xhr) {
                console.error("Error searching for member:", xhr.responseText);
                alert("An error occurred while searching for the member. Please try again.");
            }
        });
    });

// Delete member button click event
    $("#delete-member-btn").on("click", function () {
        if (!memberIdToDelete) {
            alert("Invalid member ID. Please try again.");
            return;
        }
       deleteMember(memberIdToDelete)
    });

    function loadTable() {
        // Clear the existing table body
        $("#member-tbody").empty();

        // Make an AJAX call to fetch all staff members
        $.ajax({
            url: "http://localhost:8080/greenshadow/api/v1/staff/getAll", // Update the endpoint as needed
            method: "GET",
            contentType: "application/json",
            headers: {
                Authorization: "Bearer " + token // Ensure the token is correctly handled
            },
            success: function (results) {
                results.map((item,index) => {
                    const record = `
                    <tr>
                        <td class="name">${item.firstName} ${item.lastName}</td>
                        <td class="designation">${item.designation}</td>
                        <td class="gender">${item.gender}</td>
                        <td class="joined-date">${extractDate(item.joinedDate)}</td>
                        <td class="email">${item.email}</td>
                        <td class="role">${item.role}</td>
                        <td class="field-list"><button class="btn btn-outline-success see-member-btn" data-id="${item.staffId}">...</button></td>
                    </tr>
                `;
                    // Append the new record to the table body
                    $("#member-tbody").append(record);

                });
                staffList.push(...results);
                console.log(staffList);
                $('.see-member-btn').on('click', function() {
                    const staffId = $(this).data('id');
                    let staff ;
                    staffList.forEach(item => {
                        if (item.staffId === staffId) {
                           staff = item;
                        }
                    })
                    console.log(staff);
                    $("#staffId-modal").text(`${staffId}`);
                    $("#staffName-modal").text(`${staff.firstName} ${staff.lastName}`);
                    $("#staffDOB-modal").text(`${extractDate(staff.dob)}`);
                    $("#staffDesignation-modal").text(`${staff.designation}`);
                    $("#staffModal").modal("show");
                });
            },
            error: function (xhr) {
                console.error("Error loading table data:", xhr.responseText);
                alert("Failed to load staff data. Please try again later.");
            }
        });
        $("#deleteButton").on("click",function(){
            const deleteID = $("#staffId-modal").text()
            deleteMember(deleteID)
            $("#staffModal").modal("hide");
        })
        $("#updateButton").on("click",function(){
            const deleteID = $("#staffId-modal").text()
            $("#staffModal").modal("hide");
            searchToUpdate(deleteID)
        })
    }
    function deleteMember(staffId){
        $.ajax({
            url: `http://localhost:8080/greenshadow/api/v1/staff/${staffId}`,
            method: "DELETE",
            headers: {
                Authorization: "Bearer " + token // Ensure token is set correctly
            },
            success: function () {
                alert("Member deleted successfully.");
                $("#confirmation").modal("hide");
                $("#delete-member").modal("hide");

                // Clear search field and reset modal
                $("#username-to-delete").val("");
                $("#delete-id").text("ID");
                $("#delete-name").text("Name");
                $("#delete-designation").text("Designation");

                loadTable()
            },
            error: function (xhr) {
                console.error("Error deleting member:", xhr.responseText);
                alert("An error occurred while deleting the member. Please try again.");
            }
        });
    }
    function searchToUpdate(staffId){
        $.ajax({
            url: `http://localhost:8080/greenshadow/api/v1/staff/${staffId}`, // Replace with your API endpoint
            method: "GET",
            headers: {
                Authorization: "Bearer "+token
            },
            success: function (staff) {
                // Populate the second modal with the fetched staff data
                $("#firstName-up").val(staff.firstName);
                $("#lastName-up").val(staff.lastName);
                $("#designation-up").val(staff.designation);
                $(`input[name="gender"][value="${staff.gender}"]`).prop("checked", true);
                $("#joinedDate-up").val(extractDate(staff.joinedDate));
                $("#dob-up").val(extractDate(staff.dob));
                $("#address1-up").val(staff.addressLine1);
                $("#address2-up").val(staff.addressLine2);
                $("#address3-up").val(staff.addressLine3);
                $("#address4-up").val(staff.addressLine4);
                $("#address5-up").val(staff.addressLine5);
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
    }
});



