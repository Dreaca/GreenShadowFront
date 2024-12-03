import {fieldList} from "./db/db.js";
$(document).ready(function () {
    let token = localStorage.getItem('authToken');
    loadFields()

    document.getElementById('saveFieldButton').addEventListener('click', function () {

        const fieldName = document.getElementById('fieldName').value;
        const location = document.getElementById('location').value;
        const size = document.getElementById('size').value;
        const plantedCrop = document.getElementById('plantedCrop').value;
        const staffList = document.getElementById('staffList').value.split(',').map(name => name.trim());

        // Handle image uploads
        const image1 = document.getElementById('image1').files[0];
        const image2 = document.getElementById('image2').files[0];

        // Prepare data to send to the backend
        const formData = new FormData();
        formData.append('fieldName', fieldName);
        formData.append('location', location);
        formData.append('size', size);
        formData.append('plantedCrop', plantedCrop);
        formData.append('staffList', JSON.stringify(staffList)); // Convert staff list to a JSON string
        if (image1) formData.append('image1', image1);
        if (image2) formData.append('image2', image2);

        // Send the data to the backend using AJAX
        $.ajax({
            url: 'http://localhost:8080/greenshadow/api/v1/field', // Replace with your actual backend URL
            type: 'POST',
            data: formData,
            contentType: false, // Important: Set content type to false
            processData: false,
            headers: {'Authorization': "Bearer " + token},
            success: function (data) {
                console.log('Success:', data);
                // Close the modal after saving
                $('#addFieldModal').modal('hide');
            },
            error: function (xhr, status, error) {
                console.error('Error:', error);
            }
        });

    });

    function loadFields() {
        console.log("called loadfields");
        $.ajax({
            url: 'http://localhost:8080/greenshadow/api/v1/field',
            method: 'GET',
            dataType: 'json',
            headers: {'Authorization': "Bearer " + token},
            success: function (fields) {
                fields.map((field,index)=>{
                    const loc = field.location;
                    console.log(loc)
                            const fieldRecord = `
                    <tr>
                        <td class="fieldCode">${field.fieldCode}</td>
                        <td class="fieldName">${field.fieldName}</td>
                        <td class="location"> x:${field.location.x} y: ${field.location.y} </td>
                        <td class="size">${field.size}</td>
                        <td class="more"><button class="btn btn-outline-success see-field-data" data-id="${field.fieldCode}"> ...</button></td>
                    </tr>
                `;
                    $("#field-tbody").append(fieldRecord);
                });
                $('.see-field-data').on('click', function() {
                    const fieldCode = $(this).data('id');
                    $("#fieldModal").modal("show")
                })
                fieldList.push(...fields)
                console.log(fieldList);
            },
            error: function (xhr, status, error) {
                console.error('Error loading fields:', error);
            }
        });
    }

})
