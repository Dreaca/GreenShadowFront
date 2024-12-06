import {vehicleList, token, equipmentList, staffList} from "./db/db.js";

$(document).ready(function(){
    let vehicleCodeForUsage;
    loadStaffList()
    loadVehicles();
    $("#update-vehicle-confirm-btn").on("click", function(){
        updateVehicle(vehicleCodeForUsage);
    })
    $("#add-vehicle-confirm-btn").on("click", function(){
        function getSelectedStaff() {
            const selectedStaff = [];

            $('#staff-members input[type="checkbox"]:checked').each(function() {
                selectedStaff.push($(this).data('value'));
            });

            return selectedStaff;
        }
        let selectedStaff = getSelectedStaff();

        const formData = new FormData();
        formData.append("licensePlateNo", $("#add-license-plate").val().trim());
        formData.append("category", $("#add-category").val().trim());
        formData.append("fuelType", $("#add-fuel-type").val().trim());
        formData.append("status", $("#add-vehicle-status").val().trim());
        formData.append("allocatedStaff", JSON.stringify(selectedStaff));
        formData.append("remarks",$("#add-remarks").val().trim());

        $.ajax({
            url: `http://localhost:8080/greenshadow/api/v1/vehicle`,
            method: "POST",
            processData: false,
            contentType: false,
            headers: {
                Authorization: "Bearer " + token
            },
            data: formData,
            success: function (response) {

                alert("Vehicle Saved successfully!");
                $("#add-vehicle").modal("hide");
                loadVehicles()
            },
            error: function (xhr, status, error) {
                // Error handler
                console.error("Error saving vehicle:", xhr.responseText);
                alert("Failed to add vehicle. Please try again.");
            }
        });




    })
    $("#search-vehicle-btn-up").on("click", function(){
        const vCode = $("#vehicle-to-update").val().trim()
        vehicleCodeForUsage = vCode
        if(!vCode){
            alert("Please enter a vehicle code")
        }
        searchToUpdate(vCode)
    })
    $("#search-vehicle-btn").on("click", function(){
        const vCode = $("#vehicle-to-delete").val().trim()
        vehicleCodeForUsage = vCode
        if(!vCode){
            alert("Please enter a vehicle code")
        }
        searchToDelete(vCode)
    })
    $("#delete-vehicle-confirm-btn").on("click", function(){
        deleteVehicle(vehicleCodeForUsage);
    })
    function loadVehicles(){
        $("#vehicle-tbody").empty();
        $.ajax({
            url:'http://localhost:8080/greenshadow/api/v1/vehicle',
            method:'GET',
            dataType:'json',
            headers:{'Authorization': "Bearer " + token},
            success:function(vehicles){
                vehicles.map((item)=>{
                    const vehicleRecord=`
                    <tr>
                    <td class="equipment-code">${item.licensePlateNo}</td>
                    <td class="equipment-name">${item.category}</td>
                    <td class="equipment-type">${item.fuelType}</td>
                    <td class="equipment-status">${item.status}</td>
                    <td class="equipment-more"><button class="btn btn-outline-info see-more-vehicles" data-id="${item.vehicleCode}">...</button</td>
                    </tr>
                    `;
                    $("#vehicle-tbody").append(vehicleRecord);
                })
                vehicleList.push(...vehicles)
                $('.see-more-vehicles').on('click', function(){
                    const vehicleCode = $(this).data('id');
                    vehicleList.forEach(item => {
                        if (vehicleCode === item.vehicleCode){
                            console.log(item)
                            $("#vehicle-code-modal").text(vehicleCode);
                            $("#license-plate-modal").text(item.licensePlateNo)
                            $("#category-modal").text(item.category)
                            $("#fuel-type-modal").text(item.fuelType)
                            $("#vehicle-status-modal").text(item.status)
                            $("#remarks-modal").text(item.remarks)

                        }
                    })
                    $("#vehicle-detail-modal").modal("show");
                })
            },
            error:function(xhr, status, error) {
                alert("Error loading equipment data"+error);
            }

        });
        $("#delete-vehicle-btn-modal").on("click", function () {
            let vehicleCode = $("#vehicle-code-modal").text()
            vehicleCodeForUsage = vehicleCode
            $("#vehicle-detail-modal").modal("hide");
            searchToDelete(vehicleCode)
        })
        $("#update-vehicle-btn-modal").on("click",function (){
            let vehicleCode = $("#vehicle-code-modal").text()
            vehicleCodeForUsage = vehicleCode

            $("#vehicle-detail-modal").modal("hide");
            searchToUpdate(vehicleCode)
        })
    }

    function searchToDelete(vehicleCode){
        $.ajax({
            url: `http://localhost:8080/greenshadow/api/v1/vehicle/${vehicleCode}`,
            method: "GET",
            headers: {
                Authorization: "Bearer " + token
            },
            success: function (data) {

                $("#delete-vehicle-code").text(`CODE: ${data.vehicleCode}`);
                $("#delete-licensePlateNo").text(`NAME: ${data.licensePlateNo}`);
                $("#delete-fuel-type").text(`STATUS: ${data.fuelType}`);
                $("#delete-category").text(`STATUS: ${data.category}`);
                $("#delete-vehicle-status").text(`STATUS: ${data.status}`);


                $("#confirmation-vehicle").modal("show");
            },
            error: function (xhr) {
                console.error("Error searching for field:", xhr.responseText);
                alert("An error occurred while searching for the field. Please try again.");
            }
        });
    }
    function searchToUpdate(vehicleCode){
        $.ajax({
            url: `http://localhost:8080/greenshadow/api/v1/vehicle/${vehicleCode}`,
            method: "GET",
            headers: {
                Authorization: "Bearer " + token
            },
            success: function (data) {
                $("#update-license-plate").val(data.licensePlateNo);
                $("#update-category").val(data.category);
                $("#update-fuel-type").val(data.fuelType);
                $("#update-vehicle-status").val(data.status);

                $("#update-remarks").append(data.remarks);

                $("#update-vehicle-modal").modal("show")
            },
            error: function (xhr) {
                console.error("Error searching for field:", xhr.responseText);
                alert("An error occurred while searching for the field. Please try again.");
            }
        });
    }
    function updateVehicle(vehicleCode) {
        console.log("CODE",vehicleCode)
        function getSelectedStaff() {
            const selectedStaff = [];

            $('#staff-members-up input[type="checkbox"]:checked').each(function() {
                selectedStaff.push($(this).data("value"));
            });

            return selectedStaff;
        }
        let selectedStaff = getSelectedStaff();

        const formData = new FormData();
        formData.append("licensePlateNo", $("#update-license-plate").val().trim());
        formData.append("category", $("#update-category").val().trim());
        formData.append("fuelType", $("#update-fuel-type").val().trim());
        formData.append("status", $("#update-vehicle-status").val().trim());
        formData.append("allocatedStaff", JSON.stringify(selectedStaff));
        formData.append("remarks",$("#update-remarks").val().trim())



        $.ajax({
            url: `http://localhost:8080/greenshadow/api/v1/vehicle/${vehicleCode}`,
            method: "PUT",
            processData: false,
            contentType: false,
            headers: {
                Authorization: "Bearer " + token
            },
            data: formData,
            success: function (response) {

                alert("Vehicle updated successfully!");
                $("#update-vehicle-modal").modal("hide");
                loadVehicles()
            },
            error: function (xhr, status, error) {
                // Error handler
                console.error("Error updating vehicle:", xhr.responseText);
                alert("Failed to update vehicle. Please try again.");
            }
        });
    }
    function deleteVehicle(vehicleCode){
        $.ajax({
            url: `http://localhost:8080/greenshadow/api/v1/vehicle/${vehicleCode}`,
            method: "DELETE",
            headers: {
                Authorization: "Bearer " + token
            },
            success: function (data) {

                $("#delete-vehicle-code").text("");
                $("#delete-licensePlateNo").text("");
                $("#delete-fuel-type").text("");
                $("#delete-category").text("");
                $("#delete-vehicle-status").text("");


                $("#confirmation-vehicle").modal("hide");
                loadVehicles()
            },
            error: function (xhr) {
                console.error("Error searching for field:", xhr.responseText);
                alert("An error occurred while searching for the field. Please try again.");
            }
        });
    }
})
function loadStaffList() {
    $.ajax({
        url: 'http://localhost:8080/greenshadow/api/v1/staff/getAll',
        method: 'GET',
        dataType: 'json',
        headers: {'Authorization': "Bearer " + token},
        success: function (getStaff) {

            staffList.push(...getStaff);

            const dropdown = $("#staff-members");
            const dropdown_up = $("#staff-members-up");

            dropdown.empty();
            dropdown_up.empty();


            getStaff.forEach(staff => {

                const listItem = $('<li></li>');
                listItem.html(`<label class="dropdown-item"><input type="checkbox" value="${staff.staffId}" data-value="${JSON.stringify(staff)}"> ${staff.firstName} ${staff.lastName}</label>`);
                dropdown.append(listItem);


                const listItemUp = $('<li></li>');
                listItemUp.html(`<label class="dropdown-item"><input type="checkbox" value="${staff.staffId}" data-value="${JSON.stringify(staff)}"> ${staff.firstName} ${staff.lastName}</label>`);
                dropdown_up.append(listItemUp);
            });
        },
        error: function (xhr, status, error) {
            console.error("Error fetching Staff members:", error);
        }
    });

}