import {vehicleList, token, equipmentList} from "./db/db.js";

$(document).ready(function(){
    let vehicleCodeForUsage;
    loadVehicles();
    $("#update-vehicle-confirm-btn").on("click", function(){
        updateVehicle(vehicleCodeForUsage);
    })
    $("#update-vehicle-btn").on("click", function(){
        const vCode = $("#vehicle-to-update").val().trim()
        vehicleCodeForUsage = vCode
        if(!vCode){
            alert("Please enter a vehicle code")
        }
        searchToUpdate(vCode)
    })
    $("#delete-vehicle-btn").on("click", function(){
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
                    <td class="equipment-more"><button class="btn-outline-info see-more-vehicles" data-id="${item.vehicleCode}">...</button</td>
                    </tr>
                    `;
                    $("crop-tbody").append(vehicleRecord);
                })
                vehicleList.push(...vehicles)
                $('.see-more-vehicles').on('click', function(){
                    const vehicleCode = $(this).data('id');
                    vehicleList.forEach(item => {
                        if (vehicleCode === item.vehicleCode){
                            $("#vehicle-code-modal").text(vehicleCode);
                            $("#license-plate-modal").text(item.licensePlateNo)
                            $("#category-modal").text(item.category)
                            $("#fuel-type-modal").text(item.fuelType)
                            //TODO : Load the lists here
                            $("#remarks-modal").text(item.remarks)
                        }
                    })
                    $("#vehicle-detail").modal("show");
                })
            },
            error:function(xhr, status, error) {
                alert("Error loading equipment data"+error);
            }

        });
        $("#delete-vehicle-btn-modal").on("click", function () {
            let vehicleCode = $("#vehicle-code-modal").text()
            $("#vehicle-detail").modal("hide");
            searchToDelete(vehicleCode)
        })
        $("#update-vehicle-btn-modal").on("click",function (){
            let vehicleCode = $("#vehicle-code-modal").text()
            $("#equipment-detail-modal").modal("hide");
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

                $("#update-allocated-staff").val(data.allocatedStaff.join(", "));

                $("#update-remarks").append(data.remarks);

                $("#update-vehicle").modal("show")
            },
            error: function (xhr) {
                console.error("Error searching for field:", xhr.responseText);
                alert("An error occurred while searching for the field. Please try again.");
            }
        });
    }
    function updateVehicle(vehicleCode) {
        const formData = new FormData();
        formData.append("licensePlate", $("#update-license-plate").val().trim());
        formData.append("category", $("#update-category").val().trim());
        formData.append("fuelType", $("#update-fuel-type").val().trim());
        formData.append("vehicleStatus", $("#update-vehicle-status").val().trim());


        const allocatedStaffInput = $("#update-allocated-staff").val().trim();
        const allocatedStaffArray = allocatedStaffInput ? allocatedStaffInput.split(",").map(staff => staff.trim()) : [];
        allocatedStaffArray.forEach(staff => formData.append("allocatedStaff", staff));

        formData.append("remarks", $("#update-remarks").val().trim());

        if (!formData.get("licensePlate") || !formData.get("category") || (formData.get("fuelType")) || isNaN(formData.get("vehicleStatus"))) {
            alert("Please fill in all required fields correctly.");
            return;
        }
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


                $("#confirmation-equipment").modal("hide");
                loadVehicles()
            },
            error: function (xhr) {
                console.error("Error searching for field:", xhr.responseText);
                alert("An error occurred while searching for the field. Please try again.");
            }
        });
    }
})