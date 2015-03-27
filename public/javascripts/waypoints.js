$(document).ready(function () {

    doSearchForCafes();

});

function doSearchForCafes() {
    $("#search_cafe_submit").click(function () {

        var data = {
            cafeName: $("#search_cafe").val()
        };
        // send json data to route which will return the found cafe places with the cafe name value
        $.ajax({
            type: 'POST',
            data: data,
            url: '/api/waypoints'
        }).done(function (response) {
            // Check for successful (blank) response
            if (response.msg === '') {
                $(".data_result").html("");
                $.each(response.data, function (key, value) {
                    $(".data_result").append("<div class='single_cafe_data' id='" + value.reference + "'><a href='#' id='cafe_" + value.id + "' class='single_cafe'>" + value.name + "</a></div>");
                });
                doClickHandler();
            }
            else {

                // If something goes wrong, alert the error message that our service returned
                alert('Error: ' + response.msg);

            }
        });
    });
}

function doClickHandler() {
    $(".single_cafe").unbind('click');
    $(".single_cafe").each(function () {
        $(this).click(function () {
            var reference = $(this).parent().attr('id');

            var data = {
                reference: reference
            };

            $.ajax({
                type: 'GET',
                data: data,
                url: '/api/waypoints/' + data.reference,
                dataType: 'JSON'
            }).done(function (response) {
                $(".types").html("");
                $.getJSON('/api/waypoints/' + data.reference, function (data) {
                    $(".place").html(data.address_components[4].short_name);
                    $(".rating").html(data.rating);
                    $(".icon").html("<img src='" + data.icon + "' width='50px' height='50px' alt='image_of_cafe' />");
                    $.each(data.types, function (key, value) {
                        $(".types").html($(".types").html() + ", " + value);
                    });
                });
            });
        });
    });
}