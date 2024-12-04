import {logList,cropList,fieldList,staffList,token} from "./db/db.js";
import { extractDate } from "./staff.js";

let usageCode;


function populateFieldsDropdown() {
    const fieldDropdown = $("#add-log-field");
    const fieldDropdown2=$("#update-log-field");
    fieldDropdown.empty();

    fieldList.forEach(field => {
        fieldDropdown.append(
            `<option value="${field.fieldCode}" data-id="${field.fieldCode}">${field.name}</option>`
        );
        fieldDropdown2.append(
            `<option value="${field.fieldCode}" data-id="${field.fieldCode}">${field.name}</option>`
        );
    });
}

function populateCropsDropdown() {
    const cropDropdown = $("#add-log-crop");
    const cropDropdown2 = $("#update-log-crop");
    cropDropdown.empty();

    cropList.forEach(crop => {
        cropDropdown.append(
            `<option value="${crop.cropCode}" data-id="${crop.cropCode}">${crop.commonName} : ${crop.scientificName}</option>`
        );
        cropDropdown2.append(
            `<option value="${crop.cropCode}" data-id="${crop.cropCode}">${crop.commonName} : ${crop.scientificName}</option>`
        );
    });
}

function loadTable(){
    $("log-tbody").empty();
    $.ajax({
        url:'http://localhost:8080/greenshadow/api/v1/logs',
        method:'GET',
        dataType:'json',
        headers:{'Authorization': "Bearer " + token},
        success:function(logs){
            logs.map((log)=>{
                const logRecord=`
                    <tr>
                    <td class="log-code">${log.logCode}</td>
                    <td class="lof-date">${extractDate(log.logDate)}</td>
                    <td class="log-field">${log.field.fieldNAme}</td>
                    <td class="log-crop">${log.crop.cropCommonName}</td>
                    <td class="crop-see-more"><button class="btn-outline-info log-data" data-id="${log.logCode}">...</button</td>
                    </tr>
                    `;
                $("log-tbody").append(logRecord);
            })
            logList.push(...logs)
            $('.log-data').on('click', function(){
                const logId = $(this).data('id');
                logList.forEach(item => {
                    if (logId === item.logCode){
                        $("#log-code-modal").text(logId)
                        $("#log-date-modal").text(extractDate(item.logDate))
                        $("#observation-modal").text(item.observation)
                        $("#field-modal").text(item.field.fieldName)
                        $("#crop-modal").text(item.crop.cropName)
                        //TODO : Load the lists here
                        $("#log-Image-pre").attr("src", `data:image/png;base64,${item.logImage}`)
                    }
                })
                $("#log-details-modal").modal("show");
            })
        },
        error:function(xhr, status, error) {
            console.log("Error loading crop data",error);
        }

    });
    $("#log-delete-btn-modal").on("click", function () {
        let logId = $("#log-code-modal").text()
        usageCode = logId
        $("#log-details-modal").modal("hide");
        searchToDelete(logId)
    })
    $("#log-update-btn-modal").on("click",function (){
        let logId = $("#log-code-modal").text()
        usageCode = logId
        $("#log-details-modal").modal("hide");
        searchToUpdate(logId)
    })

}

function searchToUpdate(logCode){
    $.ajax({
        url: `http://localhost:8080/greenshadow/api/v1/logs/${logCode}`,
        method: "GET",
        headers: {
            Authorization: "Bearer " + token
        },
        success: function (data) {
            $("#update-log-date").val(extractDate(data.logDate));
            $("#update-log-observation").val(data.observation);
            $("#update-log-field").val(data.field.name);
            $("#update-log-crop").val(data.crop.cropName);

            $("#log-staff-list-update").val(data.fieldList.join(", "));

            if (data.logImage) {
                $("#log-image-preview").remove();


                const imagePreview = $('<img>', {
                    src: data.logImage,
                    id: "crop-image-preview",
                    alt: "Crop Image",
                    class: "img-thumbnail mb-2",
                    style: "max-width: 100%; height: auto;"
                });

                $("#log-image-up").after(imagePreview);
            }

            $("#update-log-modal-data").modal("show")
        },
        error: function (xhr) {
            console.error("Error searching for field:", xhr.responseText);
            alert("An error occurred while searching for the field. Please try again.");
        }
    });
}
function searchToDelete(logCode){
    $.ajax({
        url: `http://localhost:8080/greenshadow/api/v1/logs/${logCode}`,
        method: "GET",
        headers: {
            Authorization: "Bearer " + token
        },
        success: function (data) {

            $("#delete-log-code").text(`CODE: ${data.logCode}`);
            $("#delete-log-date").text(`DATE: ${extractDate(data.logDate)}`);
            $("#delete-log-crop").text(`CROP: ${data.crop.commonName}`);
            $("#delete-log-field").text(`FIELD:${data.field.name}`);


            $("#confirmation-log").modal("show");
        },
        error: function (xhr) {
            console.error("Error searching for field:", xhr.responseText);
            alert("An error occurred while searching for the field. Please try again.");
        }
    });
}

function updateLog(logCode){

    const date = $("#update-log-date").val().trim();
    const observation = $("#update-log-observation").val().trim();
    const selectedFieldId = $("#update-log-field").data("id");
    const selectedCropId = $("#update-log-crop").data("id");
    const staffInput = $("#log-staff-list-update").val().trim();
    const imageFile = $("#log-image-up")[0].files[0];

    if (!selectedCropId || !selectedFieldId || !observation || !date) {
        alert("Please fill in all required fields.");
        return;
    }


    const selectedField = fieldList.find(field => field.fieclCode === selectedFieldId);
    if (!selectedField) {
        alert("Invalid field selected.");
        return;
    }


    const selectedCrop = cropList.find(crop => crop.cropCode === selectedCropId);
    if (!selectedCrop) {
        alert("Invalid crop selected.");
        return;
    }
    const staffArray = staffInput.split(",").map(name => name.trim());
    const selectedStaff = staffArray.map(name => {
        const [firstName, lastName] = name.split(" ");
        return staffList.find(staff => staff.firstName === firstName && staff.lastName === lastName);
    }).filter(Boolean);

    if (selectedStaff.length !== staffArray.length) {
        alert("Some staff names could not be matched.");
        return;
    }
    const formData = new FormData();
    formData.append("date", date);
    formData.append("observation", observation);
    formData.append("field", JSON.stringify(selectedField));
    formData.append("crop", JSON.stringify(selectedCrop));
    formData.append("staff", JSON.stringify(selectedStaff));
    if (imageFile) {
        formData.append("image", imageFile);
    }


    $.ajax({
        url: `http://localhost:8080/greenshadow/api/v1/logs/${logCode}`,
        method: "PUT",
        headers: {
            Authorization: "Bearer " + token
        },
        data: formData,
        processData: false,
        contentType: false,
        success: function (response) {
            alert("Log data saved successfully!");
            $("#update-log-modal-data").modal("hide");
            $("#update-log-form")[0].reset();
            loadTable()
        },
        error: function (xhr) {
            console.error("Error saving log data:", xhr.responseText);
            alert("Failed to save log data. Please try again.");
        }
    });
}

function deleteLog(logCode){
    $.ajax({
        url: `http://localhost:8080/greenshadow/api/v1/logs/${logCode}`,
        method: "DELETE",
        headers: {
            Authorization: "Bearer " + token
        },
        success: function (data) {

            $("#delete-log-code").text("");
            $("#delete-log-date").text("");
            $("#delete-log-crop").text("");
            $("#delete-log-field").text("");


            $("#confirmation-log").modal("hide");
            loadTable()
        },
        error: function (xhr) {
            console.error("Error searching for field:", xhr.responseText);
            alert("An error occurred while searching for the field. Please try again.");
        }
    });
}



$(document).ready(function () {
    populateFieldsDropdown();
    populateCropsDropdown();
    loadTable()
    $("#save-crop-button").on("click", function () {
        e.preventDefault();


        const date = $("#add-log-date").val().trim();
        const observation = $("#add-log-observation").val().trim();
        const selectedFieldId = $("#add-log-field").data("id");
        const selectedCropId = $("#add-log-crop").data("id");
        const staffInput = $("#log-staff-list").val().trim();
        const imageFile = $("#log-image")[0].files[0];

        if (!date || !observation || !selectedFieldId || !selectedCropId) {
            alert("Please fill in all required fields.");
            return;
        }


        const selectedField = fieldList.find(field => field.fieclCode === selectedFieldId);
        if (!selectedField) {
            alert("Invalid field selected.");
            return;
        }


        const selectedCrop = cropList.find(crop => crop.cropCode === selectedCropId);
        if (!selectedCrop) {
            alert("Invalid crop selected.");
            return;
        }
        const staffArray = staffInput.split(",").map(name => name.trim());
        const selectedStaff = staffArray.map(name => {
            const [firstName, lastName] = name.split(" ");
            return staffList.find(staff => staff.firstName === firstName && staff.lastName === lastName);
        }).filter(Boolean);

        if (selectedStaff.length !== staffArray.length) {
            alert("Some staff names could not be matched.");
            return;
        }
        const formData = new FormData();
        formData.append("date", date);
        formData.append("observation", observation);
        formData.append("field", JSON.stringify(selectedField));
        formData.append("crop", JSON.stringify(selectedCrop));
        formData.append("staff", JSON.stringify(selectedStaff));
        if (imageFile) {
            formData.append("image", imageFile);
        }


        $.ajax({
            url: "http://localhost:8080/greenshadow/api/v1/logs",
            method: "POST",
            headers: {
                Authorization: "Bearer " + token
            },
            data: formData,
            processData: false,
            contentType: false,
            success: function (response) {
                alert("Log data saved successfully!");
                $("#add-new-log").modal("hide");
                $("#add-log-form")[0].reset();
                loadTable()
            },
            error: function (xhr) {
                console.error("Error saving log data:", xhr.responseText);
                alert("Failed to save log data. Please try again.");
            }
        });
    })
    $("#search-log-btn-delete").on("click", function () {
        const logId = $("#log-to-delete").val().trim();
        usageCode = logId
        if (!logId){
            alert("Please enter a log Id")
            return
        }
        searchToDelete(logId)
    })
    $("#update-log-modal-search-btn").on("click", function () {
        const logId = $("#log-to-update").val().trim();
        usageCode = logId
        if (!logId){
            alert("Please enter a log Id")
            return
        }
        searchToUpdate(logId)
    })
    $("#update-log-button").on("click", function () {
        updateLog(usageCode)
    })
    $("#deletebtn").on("click", function () {
        deleteLog(usageCode)
    })
});
