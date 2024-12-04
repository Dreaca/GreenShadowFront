import {fieldList,token} from "./db/db.js";
$(document).ready(function () {
    // let token = localStorage.getItem('authToken');
    loadFields()
    let fieldIdForUsage; //Using for general functions

    //SAVE FIELD
    document.getElementById('saveFieldButton').addEventListener('click', function () {

        const fieldName = document.getElementById('fieldName').value;
        const location = document.getElementById('location').value;
        const size = document.getElementById('size').value;
        const plantedCrop = document.getElementById('plantedCrop').value;
        const staffList = document.getElementById('staffList').value.split(',').map(name => name.trim());

        const image1 = document.getElementById('image1').files[0];
        const image2 = document.getElementById('image2').files[0];


        const formData = new FormData();
        formData.append('fieldName', fieldName);
        formData.append('location', location);
        formData.append('size', size);
        formData.append('plantedCrop', plantedCrop);
        formData.append('staffList', JSON.stringify(staffList));
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
        const fieldID = $("#fieldCode-to-update").text();
        fieldIdForUsage = fieldID;
        if (!fieldID) {
            alert("Please enter a field ID.");
            return;
        }
        searchToUpdate(fieldID)
    })
    $("#updateField-btn").on("click", function () {
        updateField(fieldIdForUsage)
    })
    //LOAD DATA
    function loadFields() {
        $("#field-tbody").empty();
        $.ajax({
            url: 'http://localhost:8080/greenshadow/api/v1/field',
            method: 'GET',
            dataType: 'json',
            headers: {'Authorization': "Bearer " + token},
            success: function (fields) {
                fields.map((field,index)=>{
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
                        if (item.fieldCode === fieldCode) {
                            $("#fieldCode-modal").text(item.fieldCode)
                            $("#fieldName-modal").text(item.fieldName)
                            $("#location-modal").text(`X: ${item.location.x}, Y: ${item.location.y}`);
                            $("#size-modal").text(item.size)
                            $("#fieldImage1").attr("src", `data:image/png;base64,${item.fieldPicture1}`);
                            $("#fieldImage2").attr("src", `data:image/png;base64,${item.fieldPicture2}`);
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
    function updateField(fieldCode){
        const fieldName = document.getElementById('fieldName-up').value;
        const location = document.getElementById('location-up').value;
        const size = document.getElementById('size-up').value;
        const plantedCrop = document.getElementById('plantedCrop-up').value;
        const staffList = document.getElementById('staffList-up').value.split(',').map(name => name.trim());


        const image1 = document.getElementById('image1-up').files[0];
        const image2 = document.getElementById('image2-up').files[0];

        const formData = new FormData();
        formData.append('fieldName', fieldName);
        formData.append('location', location);
        formData.append('size', size);
        formData.append('plantedCrop', plantedCrop);
        formData.append('staffList', JSON.stringify(staffList));
        if (image1) formData.append('image1', image1);
        if (image2) formData.append('image2', image2);

        $.ajax({
            url: `http://localhost:8080/greenshadow/api/v1/field/${fieldCode}`,
            type: 'PUT',
            data: formData,
            contentType: false,
            processData: false,
            headers: {'Authorization': "Bearer " + token},
            success: function (data) {
                console.log('Success:', data);

                $('#updateFieldModal').modal('hide');
            },
            error: function (xhr, status, error) {
                console.error('Error:', error);
            }
        });
    }
    function searchToUpdate(fieldCode){
        fieldIdForUsage = fieldCode

        $.ajax({
            url: `http://localhost:8080/greenshadow/api/v1/fields/${fieldCode}`,
            method: "GET",
            headers: {
                Authorization: "Bearer " + token
            },
            success: function (data) {

                $("#fieldName-up").val(data.fieldName);
                $("#location-up").val(data.location);
                $("#size-up").val(data.size);
                $("#plantedCrop-up").val(data.plantedCrop);
                $("#staffList-up").val(data.staffList.join(", "));


                $(".img-thumbnail").remove();


                if (data.images && data.images.length > 0) {
                    const imgPreview1 = $('<img>', {
                        src: data.images[0],
                        alt: "Field Image 1",
                        class: "img-thumbnail mb-2",
                        style: "max-width: 100%; height: auto;"
                    });
                    $("#image1-up").after(imgPreview1);

                    if (data.images.length > 1) {
                        const imgPreview2 = $('<img>', {
                            src: data.images[1],
                            alt: "Field Image 2",
                            class: "img-thumbnail mb-2",
                            style: "max-width: 100%; height: auto;"
                        });
                        $("#image2-up").after(imgPreview2);
                    }
                }


                $("#updateFieldForm").modal("show");
            },
            error: function (xhr) {
                console.error("Error fetching field data:", xhr.responseText);
                alert("Failed to load field data. Please try again.");
            }
        });

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
})
