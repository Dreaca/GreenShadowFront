import {cropList, equipmentList, fieldList, token} from "./db/db.js";
let cropCodeForUsage;
function populateFields() {
    $.ajax({
        url: 'http://localhost:8080/greenshadow/api/v1/field',
        method: 'GET',
        dataType: 'json',
        headers: { 'Authorization': "Bearer " + token },
        success: function (fields) {
            fieldList.push(...fields);


            const dropdown = $("#fields");
            const dropdown_up = $("#fields-up");

            fields.forEach(field => {
                const listItem = $('<li></li>');
                listItem.html(`<label class="dropdown-item"><input type="checkbox" value="${field.fieldCode}" data-field ='${JSON.stringify(field)}'> ${field.fieldName} </label>`);
                dropdown.append(listItem);

                const listItemUp = $('<li></li>');
                listItemUp.html(`<label class="dropdown-item"><input type="checkbox" value="${field.fieldCode}"> ${field.fieldName}  </label>`);
                dropdown_up.append(listItemUp);
            });
        },
        error: function (xhr, status, error) {
            console.error("Error fetching crops:", error);
        }
    });
    // $.ajax({
    //     url: 'http://localhost:8080/greenshadow/api/v1/equipment',
    //     method: 'GET',
    //     dataType: 'json',
    //     headers: {'Authorization': "Bearer " + token},
    //     success: function (crops) {
    //         equipmentList.push(...crops);
    //     }
    // })
}
$(document).ready(function(){

    populateFields()
    loadTable()
    // Load Data
    function loadTable(){
        $("crop-tbody").empty();
        $.ajax({
            url:'http://localhost:8080/greenshadow/api/v1/crops',
            method:'GET',
            dataType:'json',
            headers:{'Authorization': "Bearer " + token},
            success:function(crops){
                console.log(crops)
                crops.map((crop)=>{
                    const cropRecord=`
                    <tr>
                    <td class="crop-code">${crop.cropCode}</td>
                    <td class="crop-c-name">${crop.cropCommonName}</td>
                    <td class="crop-s-name">${crop.cropScientificName}</td>
                    <td class="crop-category">${crop.category}</td>
                    <td class="crop-see-more"><button class="btn btn-outline-info see-crop-details" data-id="${crop.cropCode}">...</button</td>
                    </tr>
                    `;
                    $("#crop-tbody").append(cropRecord);
                })
                cropList.push(...crops)
                $('.see-crop-details').on('click', function(){
                    const cropCode = $(this).data('id');
                    cropList.forEach(item => {
                        if (cropCode === item.cropCode){
                            $("#crop-code-modal").text(cropCode)
                            $("#crop-common-name-modal").text(item.cropCommonName)
                            $("#crop-scientific-name-modal").text(item.cropScientificName)
                            $("#category-modal").text(item.category)
                            $("#season-modal").text(item.season)
                            $("#crop-Image-pre").attr("src", `data:image/png;base64,${item.cropImage}`)
                        }
                    })
                    $("#crop-details-modal").modal("show");
                })
            },
            error:function(xhr, status, error) {
                console.log("Error loading crop data",error);
            }

        });
        $("#deleteButton").on("click", function () {
            let cropCode = $("#crop-code-modal").text()
            $("#crop-details-modal").modal("hide");
            searchToDelete(cropCode)
        })
        $("#updateButton").on("click",function (){
            let cropCode = $("#crop-code-modal").text()
            $("#crop-details-modal").modal("hide");
            searchToUpdate(cropCode)
        })
    }
    //Save data
    $("#save-crop-button").on("click", function () {

        function getSelectedStaff() {
            const selectedStaff = [];

            $('#fields input[type="checkbox"]:checked').each(function() {
                selectedStaff.push($(this).data("field"));
            });

            return selectedStaff;
        }


        let field = getSelectedStaff();

        const cropData = {
            commonName: $("#crop-add-name").val().trim(),
            scientificName: $("#crop-add-s-name").val().trim(),
            category: $("#crop-add-category").val().trim(),
            season: $("#crop-add-season").val().trim(),
            fields:JSON.stringify(field)
        };
        console.log(cropData)

        if (!cropData.commonName || !cropData.scientificName || !cropData.category || !cropData.season) {
            alert("Please fill in all required fields.");
            return;
        }
        console.log(field)


        const imageFile = $("#crop-image")[0].files[0];


        const formData = new FormData();
        formData.append("commonName", cropData.commonName);
        formData.append("scientificName", cropData.scientificName);
        formData.append("category", cropData.category);
        formData.append("season", cropData.season);
        formData.append("fields",cropData.fields)
        if (imageFile) {
            formData.append("image", imageFile);
        }


        $.ajax({
            url: "http://localhost:8080/greenshadow/api/v1/crops",
            method: "POST",
            data: formData,
            processData: false,
            contentType: false,
            headers: {
                Authorization: "Bearer " + token
            },
            success: function (response) {
                alert("Crop data saved successfully!");
                $("#add-crop-modal").modal("hide");
                $("#add-crop-form")[0].reset();
                loadTable()
            },
            error: function (xhr) {
                console.error("Error saving crop data:", xhr.responseText);
                alert("An error occurred while saving the crop data. Please try again.");
            }
        });
    });
    //Delete Crop
    $("#search-crop-btn").on("click",function (){
        let cropId = $("#crop-to-delete").val().trim();
        cropCodeForUsage = cropId
        if(!cropId){
            alert("Please enter a crop code")
            return;
        }
        console.log(cropId)
        // searchToDelete(cropId)
    })
    $("#delete-btn").on("click", function () {
        if (!cropCodeForUsage) {
            alert("Error Occurred please check your ID again")
        }
        deleteCrop(cropCodeForUsage)
    })

    //Update Crop
    $("#search-crop-btn-up").on("click", function () {
        let cropId = $("#crop-to-update").val().trim();
        cropCodeForUsage = cropId
        if(!cropId){
            alert("Please check the ID")
        }
        searchToUpdate(cropId)
    })
    $("#update-crop-button").on("click",function (){
        updateCrop(cropCodeForUsage)
    })
    function searchToDelete(cropCode){
        $.ajax({
            url: `http://localhost:8080/greenshadow/api/v1/crops/${cropCode}`,
            method: "GET",
            headers: {
                Authorization: "Bearer " + token
            },
            success: function (data) {

                $("#delete-crop-code").text(`CODE: ${data.cropCode}`);
                $("#delete-crop-common").text(`C.NAME: ${data.cropCommonName}`);
                $("#delete-crop-scientific").text(`S.NAME: ${data.cropScientificName}`);


                $("#confirmation-crop").modal("show");
            },
            error: function (xhr) {
                console.error("Error searching for field:", xhr.responseText);
                alert("An error occurred while searching for the field. Please try again.");
            }
        });
    }
    function deleteCrop(cropCode){
        $.ajax({
            url: `http://localhost:8080/greenshadow/api/v1/crops/${cropCode}`,
            method: "DELETE",
            headers: {
                Authorization: "Bearer " + token
            },
            success: function () {
                alert("Field Deleted Successfully!")
                $("#confirmation-crop").modal("hide");

                $("#delete-crop-code").text("");
                $("#delete-crop-common").text("");
                $("#delete-crop-scientific").text("");
                loadTable()
            },
            error: function (xhr) {
                console.error("Error Deleting the field:", xhr.responseText);
                alert("An error occurred while trying to delete the field. Please try again.");
            }
        });
    }
    function searchToUpdate(cropCode){
        $.ajax({
            url: `http://localhost:8080/greenshadow/api/v1/crops/${cropCode}`,
            method: "GET",
            headers: {
                Authorization: "Bearer " + token
            },
            success: function (data) {
                $("#crop-update-name").val(data.cropCommonName);
                $("#crop-update-s-name").val(data.cropScientificName);
                $("#crop-update-category").val(data.category);
                $("#crop-update-season").val(data.season);



                if (data.cropImage) {
                    $("#crop-image-preview").remove();


                    const imagePreview = $('<img>', {
                        src: `data:image/png;base64,${data.cropImage}`,
                        id: "crop-image-preview",
                        alt: "Crop Image",
                        class: "img-thumbnail mb-2",
                        style: "max-width: 100%; height: auto;"
                    });

                    $("#crop-image-up").after(imagePreview);
                }

                $("#update-crop-modal").modal("show")
            },
            error: function (xhr) {
                console.error("Error searching for field:", xhr.responseText);
                alert("An error occurred while searching for the field. Please try again.");
            }
        });
    }
    function updateCrop(cropCode){
        const cropData = {
            commonName: $("#crop-update-name").val().trim(),
            scientificName: $("#crop-update-s-name").val().trim(),
            category: $("#crop-update-category").val().trim(),
            season: $("#crop-update-season").val().trim(),
            fieldList: $("#crop-field-list-up").val().trim().split(",").map(field => field.trim())
        };


        if (!cropData.commonName || !cropData.scientificName || !cropData.category || !cropData.season) {
            alert("Please fill in all required fields.");
            return;
        }


        const imageFile = $("#crop-image")[0].files[0];


        const formData = new FormData();
        formData.append("commonName", cropData.commonName);
        formData.append("scientificName", cropData.scientificName);
        formData.append("category", cropData.category);
        formData.append("season", cropData.season);
        formData.append("fieldList", JSON.stringify(cropData.fieldList));
        if (imageFile) {
            formData.append("image", imageFile);
        }


        $.ajax({
            url: `http://localhost:8080/greenshadow/api/v1/crops/${cropCode}`,
            method: "PUT",
            data: formData,
            processData: false,
            contentType: false,
            headers: {
                Authorization: "Bearer " + token
            },
            success: function (response) {
                alert("Crop data saved successfully!");
                $("#update-crop-modal").modal("hide");
                $("#update-crop-form")[0].reset();
                loadTable()
            },
            error: function (xhr) {
                console.error("Error saving crop data:", xhr.responseText);
                alert("An error occurred while saving the crop data. Please try again.");
            }
        });
    }
})