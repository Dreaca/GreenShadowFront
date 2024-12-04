import {equipmentList, token} from './db/db.js'

$(document).ready(function() {
    let equipmentCodeForUsage;
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

    function loadEquipment(){
        $("#equipment-tbody").empty();
        $.ajax({
            url:'http://localhost:8080/greenshadow/api/v1/equipment',
            method:'GET',
            dataType:'json',
            headers:{'Authorization': "Bearer " + token},
            success:function(equipments){
                equipments.map((item)=>{
                    const cropRecord=`
                    <tr>
                    <td class="equipment-code">${item.equipmentCode}</td>
                    <td class="equipment-name">${item.name}</td>
                    <td class="equipment-type">${item.type}</td>
                    <td class="equipment-status">${item.status}</td>
                    <td class="equipment-more"><button class="btn-outline-info see-more-equipment" data-id="${item.equipmentCode}">...</button</td>
                    </tr>
                    `;
                    $("#equipment-tbody").append(cropRecord);
                })
                equipmentList.push(...equipments)
                $('.see-more-equipment').on('click', function(){
                    const equipCode = $(this).data('id');
                    equipmentList.forEach(item => {
                        if (equipCode === item.equipmentCode){
                            $("#equipment-code-modal").text(equipCode)
                            $("#equipment-name-modal").text(item.commonName)
                            $("#equipment-type-modal").text(item.scientificName)
                            $("#equipment-status-modal").text(item.status)
                            //TODO : Load the lists here
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
        $("update-equipment-btn-modal").on("click",function (){
            let equipCode = $("#equipment-code-modal").text()
            $("#equipment-detail-modal").modal("hide");
            searchToUpdate(equipCode)
        })
    }
    function searchToDelete(equipCode){
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
        $.ajax({
            url: `http://localhost:8080/greenshadow/api/v1/crop/${equipCode}`,
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
        const formData = new FormData();
        formData.append("name", $("#update-equipment-name").val().trim());
        formData.append("type", $("#update-equipment-type").val().trim());
        formData.append("status", $("#update-equipment-status").val().trim());
        formData.append("staffList", $("#update-equipment-staff").val().trim());
        formData.append("fieldList", $("#update-equipment-field").val().trim());

        if (!formData.get("name") || !formData.get("type") || (formData.get("status"))) {
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

})