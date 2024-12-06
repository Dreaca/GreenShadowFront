import {cropList, equipmentList, fieldList, staffList, token} from './db/db.js'
let equipmentCodeForUsage;
function loadStaffList() {
    $.ajax({
        url: 'http://localhost:8080/greenshadow/api/v1/staff/getAll',
        method: 'GET',
        dataType: 'json',
        headers: { 'Authorization': "Bearer " + token },
        success: function (getStaff) {
            staffList.push(...getStaff);
            const dropdown = $("#staff-members");
            const dropdown_up = $("#staff-members-up");
            dropdown.empty();
            dropdown_up.empty()

            getStaff.forEach(staff => {

                const listItem = $('<li></li>');
                listItem.html(`<label class="dropdown-item"><input type="checkbox" value="${staff.staffId}"> ${staff.firstName} ${staff.lastName}</label>`);
                dropdown.append(listItem);

                const listItemUp = $('<li></li>');
                listItemUp.html(`<label class="dropdown-item"><input type="checkbox" value="${staff.staffId}"> ${staff.firstName} ${staff.lastName}</label>`);
                dropdown_up.append(listItemUp);

            });
        },
        error: function (xhr, status, error) {
            console.error("Error fetching Staff members:", error);
        }
    });
}
function populateField() {
    $.ajax({
        url: 'http://localhost:8080/greenshadow/api/v1/field',
        method: 'GET',
        dataType: 'json',
        headers: {'Authorization': "Bearer " + token},
        success: function (fields) {
            console.log(fields)
            fieldList.push(...fields);

            const dropdown = $("#fields");
            const dropdown_up = $("#fields-up");

            fields.forEach(field => {
                const listItem = $('<li></li>');
                listItem.html(`<label class="dropdown-item"><input type="checkbox" value="${field.fieldCode}" data-value="${field}"> ${field.fieldName} </label>`);
                dropdown.append(listItem);

                const listItemUp = $('<li></li>');
                listItemUp.html(`<label class="dropdown-item"><input type="checkbox" value="${field.fieldCode} data-value="${field}"> ${field.fieldName}  </label>`);
                dropdown_up.append(listItemUp);
            });
        },
        error: function (xhr, status, error) {
            console.error("Error fetching crops:", error);
        }
    });
}
$(document).ready(function() {
    loadStaffList()
    populateField()
    // Load Data
    loadEquipment()
    // Update Data
    $("#search-equipment-btn-up").on("click", function() {
       const equipCode = $("#equipment-to-update").val().trim();
       equipmentCodeForUsage = equipCode;
       if(!equipCode){
           alert("Please enter a id ");
       }
       searchToUpdate(equipCode);
    })
    $("#update-equipment-confirm-btn").on("click", function(){
        updateEquipment(equipmentCodeForUsage);
    })
    // Delete Data
    $("#search-equipment-btn").on("click", function () {
        const eCode = $("#equipment-to-delete").val().trim();
        equipmentCodeForUsage = eCode;
        if(!eCode){
            alert("Please enter a id ");
        }
        searchToDelete(eCode)
    })
    $("#delete-equipment-confirm-btn").on("click", function () {
        deleteEquipment(equipmentCodeForUsage);
    })
    //Save data
    $("#add-equipment-confirm-btn").on("click", function () {

        function getSelectedStaff() {
            const selectedStaff = [];

            $('#staff-members input[type="checkbox"]:checked').each(function() {
                selectedStaff.push($(this).data("value"));
            });

            return selectedStaff;
        }
        function getSelectedFields(){
            const selectedFields = [];

            $('#fields input[type="checkbox"]:checked').each(function() {
                selectedFields.push($(this).data("value"));
            });

            return selectedFields;
        }
        let selectedStaff = getSelectedStaff();
        let selectedFields = getSelectedFields();

        const name =  $("#add-equipment-name").val().trim();
        const type = $("#add-equipment-type").val().trim()
        const status =  $("#add-equipment-status").val().trim()

        console.log(name,type,status);

        const formData = new FormData();
        formData.append("name",name);
        formData.append("type", type);
        formData.append("status",status);
        formData.append("staffList",JSON.stringify(selectedStaff));
        formData.append("fieldList", JSON.stringify(selectedFields));

        if (!formData.get("name") || !formData.get("type") || !(formData.get("status"))) {
            alert("Please fill in all required fields.");
            return;
        }
        $.ajax({
            url: `http://localhost:8080/greenshadow/api/v1/equipment`,
            method: "POST",
            contentType:false,
            processData: false,
            headers: {
                Authorization: "Bearer " + token
            },
            data: formData,
            success: function (response) {
                alert("Equipment updated successfully!");
                $("#update-equipment-modal").modal("hide");
                loadEquipment()
            },
            error: function (xhr, status, error) {

                console.error("Error updating equipment:", xhr.responseText);
                alert("Failed to update equipment. Please try again.");
            }
        });
    })
})
function searchToDelete(equipCode){
    equipmentCodeForUsage =equipCode
    $.ajax({
        url: `http://localhost:8080/greenshadow/api/v1/equipment/${equipCode}`,
        method: "GET",
        headers: {
            Authorization: "Bearer " + token
        },
        success: function (data) {

            $("#delete-equipment-code").text(`CODE: ${data.equipmentCode}`);
            $("#delete-equipment-name").text(`NAME: ${data.name}`);
            $("#delete-equipment-status").text(`STATUS: ${data.status}`);


            $("#confirmation-equipment").modal("show");
        },
        error: function (xhr) {
            console.error("Error searching for field:", xhr.responseText);
            alert("An error occurred while searching for the field. Please try again.");
        }
    });
}
function searchToUpdate(equipCode){
    equipmentCodeForUsage = equipCode;
    $.ajax({
        url: `http://localhost:8080/greenshadow/api/v1/equipment/${equipCode}`,
        method: "GET",
        headers: {
            Authorization: "Bearer " + token
        },
        success: function (data) {
            $("#update-equipment-name").val(data.name);
            $("#update-equipment-type").val(data.type);
            $("#update-equipment-status").val(data.status);

            $("#update-equipment-field").val(data.fieldList.join(", "));
            $("#update-equipment-staff").val(data.staffList.join(", "));


            $("#update-equipment-modal").modal("show")
        },
        error: function (xhr) {
            console.error("Error searching for field:", xhr.responseText);
            alert("An error occurred while searching for the field. Please try again.");
        }
    });
}
function updateEquipment(equipCode){

    function getSelectedStaff() {
        const selectedStaff = [];

        $('#staff-members-up input[type="checkbox"]:checked').each(function() {
            selectedStaff.push($(this).data("value"));
        });

        return selectedStaff;
    }
    function getSelectedFields(){
        const selectedFields = [];

        $('#fields-up input[type="checkbox"]:checked').each(function() {
            selectedFields.push($(this).data("value"));
        });

        return selectedFields;
    }
    let updatedStaff = getSelectedStaff();
    let updatedFields = getSelectedFields();



    const formData = new FormData();
    formData.append("name", $("#update-equipment-name").val().trim());
    formData.append("type", $("#update-equipment-type").val().trim());
    formData.append("status", $("#update-equipment-status").val().trim());
    formData.append("staffList", JSON.stringify(updatedStaff));
    formData.append("fieldList", JSON.stringify(updatedFields));

    if (!formData.get("name") || !formData.get("type") || !(formData.get("status"))) {
        alert("Please fill in all required fields.");
        return;
    }
    $.ajax({
        url: `http://localhost:8080/greenshadow/api/v1/equipment/${equipCode}`,
        method: "PUT",
        contentType:false,
        processData: false,
        headers: {
            Authorization: "Bearer " + token
        },
        data: formData,
        success: function (response) {
            alert("Equipment updated successfully!");
            $("#update-equipment-modal").modal("hide");
            loadEquipment()
        },
        error: function (xhr, status, error) {

            console.error("Error updating equipment:", xhr.responseText);
            alert("Failed to update equipment. Please try again.");
        }
    });
}
function deleteEquipment(equipCode){
    $.ajax({
        url: `http://localhost:8080/greenshadow/api/v1/equipment/${equipCode}`,
        method: "DELETE",
        headers: {
            Authorization: "Bearer " + token
        },
        success: function (data) {

            $("#delete-equipment-code").text("");
            $("#delete-equipment-name").text("");
            $("#delete-equipment-status").text("");


            $("#confirmation-equipment").modal("hide");
            loadEquipment()
        },
        error: function (xhr) {
            console.error("Error searching for field:", xhr.responseText);
            alert("An error occurred while searching for the field. Please try again.");
        }
    });
}
function loadEquipment(){
    $("#equipment-tbody").empty();
    $.ajax({
        url:'http://localhost:8080/greenshadow/api/v1/equipment',
        method:'GET',
        dataType:'json',
        headers:{'Authorization': "Bearer " + token},
        success:function(equipments){
            console.log(equipments)
            equipments.map((item)=>{
                const cropRecord=`
                    <tr>
                    <td class="equipment-code">${item.equipmentCode}</td>
                    <td class="equipment-name">${item.name}</td>
                    <td class="equipment-type">${item.type}</td>
                    <td class="equipment-status">${item.status}</td>
                    <td class="equipment-more"><button class="btn btn-outline-info see-more-equipment" data-id="${item.equipmentCode}">...</button</td>
                    </tr>
                    `;
                $("#equipment-tbody").append(cropRecord);
                staffList.push(...item.staff)
                fieldList.push(...item.field);
            })
            equipmentList.push(...equipments)

            $('.see-more-equipment').on('click', function(){
                const equipCode = $(this).data('id');
                equipmentList.forEach(item => {
                    if (equipCode === item.equipmentCode){
                        $("#equipment-code-modal").text(equipCode)
                        $("#equipment-name-modal").text(item.name)
                        $("#equipment-type-modal").text(item.type)
                        $("#equipment-status-modal").text(item.status)
                        //TODO : Load the lists here

                        const matchingStaff = staffList;
                        const workerList = document.getElementById('workerList-modal');
                        workerList.innerHTML = '';

                        matchingStaff.forEach(worker => {
                            const li = document.createElement('li');
                            li.textContent = worker.firstName + ' ' + worker.lastName;
                            li.setAttribute('data-id', worker.staffId);
                            workerList.appendChild(li);
                        });
                    }
                })
                $("#equipment-detail-modal").modal("show");
            })
        },
        error:function(xhr, status, error) {
            alert("Error loading equipment data"+error);
        }

    });
    $("#delete-equipment-btn-modal").on("click", function () {
        let equipCode = $("#equipment-code-modal").text()
        $("#equipment-detail-modal").modal("hide");
        searchToDelete(equipCode)
    })
    $("#update-equipment-btn-modal").on("click",function (){
        let equipCode = $("#equipment-code-modal").text()
        $("#equipment-detail-modal").modal("hide");
        searchToUpdate(equipCode)
    })
}