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
        const container = $('.main-content');

        // Clear the container before adding new cards
        container.empty();

        // Make an AJAX request to fetch the field data from the backend
        $.ajax({
            url: 'http://localhost:8080/greenshadow/api/v1/field',
            method: 'GET',
            dataType: 'json',
            headers: {'Authorization': "Bearer " + token},
            success: function (fields) {
                console.log(fields);
                $.each(fields, function (index, field) {
                    // Create a unique ID for each carousel
                    const carouselId = `photoCarousel-${field.fieldCode}`;

                    // Construct carousel items
                    const carouselItems = `
                    <div class="carousel-item active">
                        <img src="data:image/png;base64,${field.fieldPicture1}" class="d-block w-100" alt="Field Picture 1">
                    </div>
                    <div class="carousel-item">
                        <img src="data:image/png;base64,${field.fieldPicture2}" class="d-block w-100" alt="https://via.placeholder.com/200x100/ff7f7f" >
                    </div>
                `;

                    // Create the card HTML
                    const cardHtml = `
                <div class="card small-card">
                    <div id="${carouselId}" class="carousel slide" data-ride="carousel">
                        <div class="carousel-inner">
                            ${carouselItems}
                        </div>
                        <a class="carousel-control-prev" href="#${carouselId}" role="button" data-slide="prev">
                            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                          
                        </a>
                        <a class="carousel-control-next" href="#${carouselId}" role="button" data-slide="next">
                            <span class="carousel-control-next-icon" aria-hidden="true"></span>
                      
                        </a>
                    </div>
                    <div class="card-body">
                        <h5 class="card-title">Field Information</h5>
                        <div class="row">
                            <div class="col-6">Field ID:</div>
                            <div class="col-6" id="field-id">${field.fieldCode}</div>
                        </div>
                        <div class="row">
                            <div class="col-6">Name:</div>
                            <div class="col-6" id="field-name">${field.fieldName}</div>
                        </div>
                        <div class="row">
                            <div class="col-6">Location:</div>
                            <div class="col-6" id="field-location">${field.location}</div>
                        </div>
                        <div class="row">
                            <div class="col-6">Ext Size:</div>
                            <div class="col-6" id="field-size">${field.size}</div>
                        </div>
                        <div class="row">
                            <div class="col-6">Planted Crop:</div>
                            <div class="col-6" id="planted-crop">${field.crop}</div>
                        </div>
                        <div class="row">
                            <div class="col-6">Attended Staff:</div>
                            <div class="col-6"><button class="btn btn-outline-primary btn-staff-view">View Staff</button></div>
                        </div>
                    </div>
                    <div class="card-footer">
                        <button class="btn btn-outline-danger" id="btn-delete-field" data-field-id="${field.fieldCode}">Delete</button>
                        <button class="btn btn-outline-warning" id="btn-edit-field" data-field-id="${field.fieldCode}">Edit</button>
                    </div>
                </div>
                `;

                    // Append the card to the container
                    container.append(cardHtml);
                    $(`#${carouselId}`).carousel();
                });
            },
            error: function (xhr, status, error) {
                console.error('Error loading fields:', error);
            }
        });
    }

})
