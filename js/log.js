import {logList, cropList, fieldList, staffList, token} from "./db/db.js";
import {extractDate} from "./staff.js";

let usageCode;


function populateFieldsDropdown() {
    $.ajax({
        url: 'http://localhost:8080/greenshadow/api/v1/field',
        method: 'GET',
        dataType: 'json',
        headers: {'Authorization': "Bearer " + token},
        success: function (fields) {
            fieldList.push(...fields)
            const fieldDropdown = $("#add-log-field");
            const fieldDropdown2 = $("#update-log-field");
            fieldDropdown.empty();

            fieldList.forEach(field => {
                fieldDropdown.append(
                    `<option value="${field.fieldCode}" data-value="${JSON.stringify(field)}">${field.fieldName}</option>`
                );
                fieldDropdown2.append(
                    `<option value="${field.fieldCode}" data-value="${JSON.stringify(field)}">${field.fieldName}</option>`
                );
            });
        },
        error: function (xhr, status, error) {
            console.error('Error loading fields:', error);
        }

    });
}

function populateCropsDropdown() {
    $.ajax({
        url: 'http://localhost:8080/greenshadow/api/v1/crops',
        method: 'GET',
        dataType: 'json',
        headers: {'Authorization': "Bearer " + token},
        success: function (fields) {
            cropList.push(...fields)
            const cropDropdown = $("#add-log-crop");
            const cropDropdown2 = $("#update-log-crop");
            cropDropdown.empty();
            cropDropdown2.empty();

            cropList.forEach(crop => {
                cropDropdown.append(
                    `<option value="${crop.cropCode}" data-value='${JSON.stringify(crop)}'>${crop.cropCommonName} : ${crop.cropScientificName}</option>`
                );
                cropDropdown2.append(
                    `<option value="${crop.cropCode}" data-value='${JSON.stringify(crop)}'>${crop.cropCommonName} : ${crop.cropScientificName}</option>`
                );
            });
        },
        error: function (xhr, status, error) {
            console.error('Error loading fields:', error);
        }

    });

}

function loadTable() {
    let field;
    let crop;
    $("log-tbody").empty();
    $.ajax({
        url: 'http://localhost:8080/greenshadow/api/v1/logs',
        method: 'GET',
        dataType: 'json',
        headers: {'Authorization': "Bearer " + token},
        success: function (logs) {
            logs.map((monitorLog) => {

                console.log(monitorLog)


                if (monitorLog.crop === null) {
                     crop = "N/A"
                }else crop = JSON.stringify(monitorLog.crop)
                if(monitorLog.fields === null){
                    field = "N/A"
                }else  field = JSON.stringify(monitorLog.fields)
                const logRecord = `
                    <tr>
                    <td class="log-code">${monitorLog.logcode}</td>
                    <td class="lof-date">${extractDate(monitorLog.logdate)}</td>
                    <td class="log-field">${field}</td>
                    <td class="log-crop">${crop}</td>
                    <td class="crop-see-more"><button class="btn-outline-info log-data" data-id="${monitorLog.logcode}">...</button</td>
                    </tr>
                    `;
                $("#log-tbody").append(logRecord);
            })
            logList.push(...logs)
            $('.log-data').on('click', function () {
                const logId = $(this).data('id');
                logList.forEach(item => {
                    if (logId === item.logcode) {
                        $("#log-code-modal").text(logId)
                        $("#log-date-modal").text(extractDate(item.logdate))
                        $("#observation-modal").text(item.observation)
                        $("#field-modal").text(field)
                        $("#crop-modal").text(crop)
                        $("#log-Image-pre").attr("src", `data:image/png;base64,${item.logImage}`)
                    }
                })
                $("#log-details-modal").modal("show");
            })
        },
        error: function (xhr, status, error) {
            console.log("Error loading crop data", error);
        }

    });
    $("#log-delete-btn-modal").on("click", function () {
        let logId = $("#log-code-modal").text()
        usageCode = logId
        $("#log-details-modal").modal("hide");
        searchToDelete(logId)
    })
    $("#log-update-btn-modal").on("click", function () {
        let logId = $("#log-code-modal").text()
        usageCode = logId
        $("#log-details-modal").modal("hide");
        searchToUpdate(logId)
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
function searchToUpdate(logCode) {
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

function searchToDelete(logCode) {
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

function updateLog(logCode) {

    const date = $("#update-log-date").val().trim();
    const observation = $("#update-log-observation").val().trim();
    const selectedField = $("#update-log-field")
    const selectedCrop = $("#update-log-crop")

    let crop ;

    selectedCrop.on("change", function () {
        const selectedOption = $(this).find(":selected");
        crop = selectedOption.data("value");
    });

    let field;
    selectedField.on("change", function () {
        const selectedOption = $(this).find(":selected");
        field = selectedOption.data("value");
         // Logs the crop object
    });

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

    const imageFile = $("#log-image-up")[0].files[0];

   ;
    const formData = new FormData();
    formData.append("date", date);
    formData.append("observation", observation);
    formData.append("field", JSON.stringify(field));
    formData.append("crop", JSON.stringify(crop));
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

function deleteLog(logCode) {
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
    loadStaffList()
    loadTable()

    $("#save-log-button").on("click", function () {


        const date = $("#add-log-date").val().trim();
        const observation = $("#add-log-observation").val().trim();
        let selectedCrop = $("#add-log-crop").find(":selected").data("value");
        let selectedField = $("#add-log-field").find(":selected").data("value");

        console.log(selectedField , "Crop " , selectedCrop);

        if(selectedCrop === undefined||selectedCrop === "") {
            selectedCrop = {}
        }
        if (selectedField === undefined || null === selectedField) {selectedField={}}

        const imageFile = $("#log-image")[0].files[0];


        let selectedStaff = getSelectedStaff();

        const formData = new FormData();
        formData.append("logDate", date);
        formData.append("observation", observation);
        formData.append("field", JSON.stringify(selectedField));
        formData.append("crop", JSON.stringify(selectedCrop));
        formData.append("staff", JSON.stringify(selectedStaff));
        if (imageFile) {
            formData.append("logImage", imageFile);
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
        function getSelectedStaff() {
            const selectedStaff = [];

            $('#staff-members input[type="checkbox"]:checked').each(function() {
                selectedStaff.push($(this).val());
            });

            return selectedStaff;
        }
    })
    $("#search-log-btn-delete").on("click", function () {
        const logId = $("#log-to-delete").val().trim();
        usageCode = logId
        if (!logId) {
            alert("Please enter a log Id")
            return
        }
        searchToDelete(logId)
    })
    $("#update-log-modal-search-btn").on("click", function () {
        const logId = $("#log-to-update").val().trim();
        usageCode = logId
        if (!logId) {
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
