import {logList,cropList,fieldList,staffList} from "./db/db.js";


function populateFieldsDropdown() {
    const fieldDropdown = $("#add-log-field");
    fieldDropdown.empty();

    fieldList.forEach(field => {
        fieldDropdown.append(
            `<option value="${field.fieldCode}">${field.name}</option>`
        );
    });
}

function populateCropsDropdown() {
    const cropDropdown = $("#add-log-crop");
    cropDropdown.empty();

    cropList.forEach(crop => {
        cropDropdown.append(
            `<option value="${crop.cropCode}">${crop.commonName} : ${crop.scientificName}</option>`
        );
    });
}

// Call these functions when the page loads or modal is shown
$(document).ready(function () {
    populateFieldsDropdown();
    populateCropsDropdown();
});
