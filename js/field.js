import {cropList, fieldList, staffList, token,equipmentList} from "./db/db.js";

function populateCrops() {
    $.ajax({
        url: 'http://localhost:8080/greenshadow/api/v1/crops',
        method: 'GET',
        dataType: 'json',
        headers: { 'Authorization': "Bearer " + token },
        success: function (crops) {
            cropList.push(...crops);

            const dropdown = $("#plantedCrop");
            const dropdown_up = $("#plantedCrop-up");

            crops.forEach(crop => {
                dropdown.append(
                    `<option value="${crop.cropCode}" data-id="${crop.cropCode}">${crop.cropCommonName} : ${crop.cropScientificName}</option>`
                );
                dropdown_up.append(
                    `<option value="${crop.cropCode}" data-id="${crop.cropCode}">${crop.cropCommonName} : ${crop.cropScientificName}</option>`
                );
            });
        },
        error: function (xhr, status, error) {
            console.error("Error fetching crops:", error);
        }
    });
    $.ajax({
        url: 'http://localhost:8080/greenshadow/api/v1/equipment',
        method: 'GET',
        dataType: 'json',
        headers: {'Authorization': "Bearer " + token},
        success: function (crops) {
            equipmentList.push(...crops);
        }
    })
}
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
                listItem.html(`<label class="dropdown-item"><input type="checkbox" value="${staff.staffId}" data-id="${staff.staffId}"> ${staff.firstName} ${staff.lastName}</label>`);
                dropdown.append(listItem);


                const listItemUp = $('<li></li>');
                listItemUp.html(`<label class="dropdown-item"><input type="checkbox" value="${staff.staffId}" data-id="${staff.staffId}"> ${staff.firstName} ${staff.lastName}</label>`);
                dropdown_up.append(listItemUp);
            });
        },
        error: function (xhr, status, error) {
            console.error("Error fetching Staff members:", error);
        }
    });

}

    let fieldIdForUsage; //Using for general functions
$(document).ready(function () {

    loadStaffList()
    populateCrops()
    loadFields()


    //SAVE FIELD
    document.getElementById('saveFieldButton').addEventListener('click', function () {
        // Get the values from the form
        const fieldName = document.getElementById('fieldName').value;
        const location = document.getElementById('location').value;
        const size = document.getElementById('size').value;


        let plantedCrop = $("#plantedCrop").val();

        const image1 = document.getElementById('image1').files[0];
        const image2 = document.getElementById('image2').files[0];


        let selectedStaff = getSelectedStaff();


        if (selectedStaff.length === 0) {
            alert("Please select at least one staff member.");
            return;
        }

        const formData = new FormData();
        formData.append('fieldName', fieldName);
        formData.append('location', location);
        formData.append('size', size);
        formData.append('plantedCrop', plantedCrop);
        formData.append('staffList', JSON.stringify(selectedStaff));

        if (image1) formData.append('image1', image1);
        if (image2) formData.append('image2', image2);


        $.ajax({
            url: 'http://localhost:8080/greenshadow/api/v1/field',
            type: 'POST',
            data: formData,
            contentType: false,
            processData: false,
            headers: {'Authorization': "Bearer " + token},
            success: function (data) {
                console.log('Success:', data);

                $('#addFieldModal').modal('hide');
            },
            error: function (xhr, status, error) {
                console.error('Error:', error);
            }
        });
    });

    function getSelectedStaff() {
        const selectedStaff = [];

        $('#staff-members input[type="checkbox"]:checked').each(function() {
            selectedStaff.push($(this).val());
        });

        return selectedStaff;
    }

    //DELETE FIELD
    $("#search-field-btn").on("click", function () {
        const fieldName = $("#fieldCode-to-delete").val().trim();
        fieldIdForUsage = fieldName;
        if (!fieldName) {
            alert("Please enter a field ID.");
            return;
        }
        searchToDelete(fieldName);
    });

    $("#delete-field-btn").on("click", function () {
        if (!fieldIdForUsage) {
            alert("Invalid Field Code. Please try again.");
            return;
        }
        deleteField(fieldIdForUsage)
    });
    //UPDATE FIELD
    $("#search-field-btn-up").on("click", function () {
        const fieldID = $("#fieldCode-to-update").val().trim();
        fieldIdForUsage = fieldID;
        if (!fieldID) {
            alert("Please enter a field ID.");
            return;
        }
        console.log(fieldID)
        searchToUpdate(fieldID)
    })
    $("#updateField-btn").on("click", function () {
        updateField(fieldIdForUsage)
    })
})
function loadFields() {
    let crop;
    let staffNames;
    $("#field-tbody").empty();
    $.ajax({
        url: 'http://localhost:8080/greenshadow/api/v1/field',
        method: 'GET',
        dataType: 'json',
        headers: {'Authorization': "Bearer " + token},
        success: function (fields) {
            fields.map((field,index)=>{

                cropList.forEach((item,index)=>{
                    if (item.platedCrop === field.plantedCrop){
                        crop = item.cropCommonName;
                    }
                })
                const fieldRecord = `
                    <tr>
                        <td class="fieldCode">${field.fieldCode}</td>
                        <td class="fieldName">${field.fieldName}</td>
                        <td class="location"> x:${field.location.x} y: ${field.location.y} </td>
                        <td class="size">${field.size}</td>
                        <td class="more"><button class="btn btn-outline-success see-field-data" data-id="${field.fieldCode}"> ...</button></td>
                    </tr>
                `;

                fieldList.push(...fields)
                $("#field-tbody").append(fieldRecord);
            });
            $('.see-field-data').on('click', function() {
                const fieldCode = $(this).data('id');
                fieldList.forEach(item => {
                    console.log(item)
                    if (item.fieldCode === fieldCode) {
                        $("#fieldCode-modal").text(item.fieldCode)
                        $("#fieldName-modal").text(item.fieldName)
                        $("#location-modal").text(`X: ${item.location.x}, Y: ${item.location.y}`);
                        $("#size-modal").text(item.size)
                        $("#planted-crop").text(crop)
                        $("#fieldImage1").attr("src", `data:image/png;base64,${item.fieldPicture1}`);
                        $("#fieldImage2").attr("src", `data:image/png;base64,${item.fieldPicture2}`);

                        const matchingStaff = staffList.filter(staff => item.staff.includes(staff.staffId));
                        const matchingEquipment = equipmentList.filter(eq=>item.equipment.includes(eq.equipmentCode))

                        const workerList = document.getElementById('workerList-modal');
                        const eqList = document.getElementById('equipmentList-modal');
                        workerList.innerHTML = '';
                        eqList.innerHTML = '';

                        matchingStaff.forEach(worker => {
                            const li = document.createElement('li');
                            li.textContent = worker.firstName + ' ' + worker.lastName;
                            li.setAttribute('data-id', worker.staffId);
                            workerList.appendChild(li);
                        });
                        matchingEquipment.forEach(item => {
                            const li = document.createElement('li');
                            li.textContent = item.name+" " +item.type;
                            li.setAttribute('data-id', item.equipmentCode); // Store equipment ID as data attribute
                            eqList.appendChild(li);
                        });
                    }
                })
                $("#fieldModal").modal("show")
            })
        },
        error: function (xhr, status, error) {
            console.error('Error loading fields:', error);
        }

    });
    $("#deleteButton").on("click", function () {
        let fieldCode = $("#fieldCode-modal").text();
        $("#fieldModal").modal("hide")
        searchToDelete(fieldCode)
    })
    $("#updateButton").on("click",function (){
        let fieldCode = $("#fieldCode-modal").text();
        $("#fieldModal").modal("hide")
        searchToUpdate(fieldCode)
    })
}

function updateField(fieldCode){
    document.getElementById('updateFieldButton').addEventListener('click', function () {

        const fieldName = document.getElementById('fieldName-up').value;
        const location = document.getElementById('location-up').value;
        const size = document.getElementById('size-up').value;


        let plantedCrop = $("#plantedCrop-up").val();


        let selectedStaff = getSelectedStaff();


        if (selectedStaff.length === 0) {
            alert("Please select at least one staff member.");
            return;
        }


        const image1 = document.getElementById('image1-up').files[0];
        const image2 = document.getElementById('image2-up').files[0];


        if (!plantedCrop) {
            plantedCrop = null;
        }

        const formData = new FormData();
        formData.append('fieldName', fieldName);
        formData.append('location', location);
        formData.append('size', size);
        formData.append('plantedCrop', plantedCrop);
        formData.append('staffList', JSON.stringify(selectedStaff));


        if (image1) formData.append('image1', image1);
        if (image2) formData.append('image2', image2);


        console.log('Selected Staff:', selectedStaff);


        $.ajax({
            url: `http://localhost:8080/greenshadow/api/v1/field/${fieldCode}`,
            type: 'PUT',
            data: formData,
            contentType: false,
            processData: false,
            headers: {'Authorization': "Bearer " + token},
            success: function (data) {
                console.log('Success:', data);
                loadFields();
                $('#updateFieldModal').modal('hide');
            },
            error: function (xhr, status, error) {
                console.error('Error:', error);
            }
        });
    });


    function getSelectedStaff() {
        let selectedStaff = [];
        $('#staff-members-up input[type="checkbox"]:checked').each(function () {

            selectedStaff.push($(this).val());
        });
        return selectedStaff;
    }

}
function searchToDelete(fieldCode){
    fieldIdForUsage = fieldCode
    $.ajax({
        url: `http://localhost:8080/greenshadow/api/v1/field/${fieldCode}`,
        method: "GET",
        headers: {
            Authorization: "Bearer " + token
        },
        success: function (data) {

            $("#delete-fieldCode").text(`ID: ${data.fieldCode}`);
            $("#delete-fieldName").text(`Name: ${data.fieldName}`);
            $("#delete-fieldLocation").text(`Location: ${data.location.x}, ${data.location.y}`);


            $("#confirmation-field").modal("show");
        },
        error: function (xhr) {
            console.error("Error searching for field:", xhr.responseText);
            alert("An error occurred while searching for the field. Please try again.");
        }
    });
}
function searchToUpdate(fieldCode){
    fieldIdForUsage = fieldCode

    $.ajax({
        url: `http://localhost:8080/greenshadow/api/v1/field/${fieldCode}`,
        method: "GET",
        headers: {
            Authorization: "Bearer " + token
        },
        success: function (data) {

            $("#fieldName-up").val(data.fieldName);
            $("#location-up").val(`${data.location.x} ,${data.location.y}`);
            $("#size-up").val(data.size);
            $("#plantedCrop-up").val(data.plantedCrop);



            $(".img-thumbnail").remove();



                const imgPreview1 = $('<img>', {
                    src: `data:image/png;base64,${data.fieldPicture1}`,
                    alt: "Field Image 1",
                    class: "img-thumbnail mb-2",
                    style: "max-width: 50%; height: 200px;"
                });

                $("#image1-up").after(imgPreview1);


                    const imgPreview2 = $('<img>', {
                        src: `data:image/png;base64,${data.fieldPicture2}`,
                        alt: "Field Image 2",
                        class: "img-thumbnail mb-2",
                        style: "max-width: 50%; height: 200px;"
                    });
                    $("#image2-up").after(imgPreview2);




            $("#updateFieldModal").modal("show");
        },
        error: function (xhr) {
            console.error("Error fetching field data:", xhr.responseText);
            alert("Failed to load field data. Please try again.");
        }
    });

}
function deleteField(fieldCode){
    $.ajax({
        url: `http://localhost:8080/greenshadow/api/v1/field/${fieldCode}`,
        method: "DELETE",
        headers: {
            Authorization: "Bearer " + token
        },
        success: function () {
            alert("Field Deleted Successfully!")
            $("#confirmation-field").modal("hide");

            $("#delete-fieldCode").text("");
            $("#delete-fieldName").text("");
            $("#delete-fieldLocation").text("");
            loadFields()
        },
        error: function (xhr) {
            console.error("Error Deleting the field:", xhr.responseText);
            alert("An error occurred while trying to delete the field. Please try again.");
        }
    });
}
