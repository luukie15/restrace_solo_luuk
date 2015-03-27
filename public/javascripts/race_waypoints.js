$(document).ready(function () {

    fillWaypointTable();

    fillUserTable();

    doSearchForCafes();

    doAdminStartRace();

    doBtnStopRace();

    switch ($("#userrole").val()) {
        case 'admin':
            $(".waypoint_info_races").hide();
            break
        case 'visitor':
        case 'moderator':
            $(".waypoint_info_races").show();
            if ($("#racestatus").val() == "started") {
                $(".enter_race").html('<label>Race is already started! :(</label>');
            } else {
                $(".enter_race").html('<button class="enter_race_button btn btn-small btn-primary" id="enter_race_button">Enter race!</button>');
                doUserEnterRace();
            }
            break;
        default:
            $(".enter_race").html('<button class="enter_race_button btn btn-small btn-primary"><a href="/login">Login to enter a race</a></button>');
            break;
    }
});

function doBtnStopRace() {
    $(".btn_stop_race").unbind('click');
    $(".btn_stop_race").click(function () {
        var raceId = $(".race_id_label").attr('rel');
        var data = {
            status: "stopped"
        };
        $.ajax({
            type: 'POST',
            data: data,
            url: '/api/races/' + raceId
        }).done(function (response) {
            $(".btn_stop_race").parent().prepend("<button class='btn btn-warning btn-small btn_show_results' rel='" + raceId + "'><a href='/races/"+raceId+"/results'>Show Results!</a></button>");
            $(".btn_stop_race").remove();
        });
    });
}

function fillWaypointTable() {
    var raceId = $(".race_id_label").attr('rel');
    // jQuery AJAX call for JSON
    $.getJSON('/api/races/' + raceId + '/waypoints', function (data) {
        $.each(data.array, function () {
            var buttonHtml = "";
            var linkStartHtml = "";
            var linkEndHtml = "";
            if ($("#userrole").val() === 'admin') {
                buttonHtml = "<button class='btn btn-small btn-primary btn_delete_waypoint' rel='" + this.reference + "'><span class='glyphicon glyphicon-minus'></span></button>";
            } else {
                linkStartHtml = "<a href='#' id='" + this.reference + "' class='single_cafe show_waypoint_info'>";
                linkEndHtml = "</a>";
            }
            $(".waypoints_of_race").append("<div class='waypoint_row'><div class='single_waypoint'>" + linkStartHtml + this.name + linkEndHtml + "</div>\n\
            " + buttonHtml + "</div>");
            addViewInformationWaypointFunctionality();
            doClickHandlerDeleteWayoint();
        });
    });
}

function fillUserTable() {
    var raceId = $(".race_id_label").attr('rel');
    // jQuery AJAX call for JSON
    $.getJSON('/api/races/' + raceId + '/users', function (data) {
        $.each(data, function () {
            $(".users_of_race").append("<div class='user_row'><div class='single_user' id='" + this.id + "'>" + this.name + "</div></div>");
        });
    });
}

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
                    $(".data_result").append("<div class='single_cafe_row' id='" + value.reference + "'><a href='#' id='" + value.id + "' class='single_cafe'>" + value.name + "</a>\n\
                    <button class='btn btn-small btn-primary btn_add_waypoint'><span class='glyphicon glyphicon-plus'></span></button></div>");
                });
                doClickHandlerAddWaypoint();
            }
            else {
                // If something goes wrong, alert the error message that our service returned
                alert('Error: ' + response.msg);
            }
        });
    });
}

function doClickHandlerAddWaypoint() {
    $(".btn_add_waypoint").unbind('click');
    $(".btn_add_waypoint").each(function () {
        $(this).click(function () {
            var reference = $(this).parent().attr('id');
            var raceId = $(".race_id_label").attr('rel');
            var id = $(this).parent().find(".single_cafe").attr('id');
            var data = {
                reference: reference,
                id: id
            };
            $.ajax({
                type: 'POST',
                data: data,
                url: '/api/races/' + raceId + '/waypoints',
                dataType: 'JSON'
            }).done(function (response) {
                if (response.msg === '') {
                    $(".waypoints_of_race").html("");
                    fillWaypointTable();
                }
            });
        });
    });
}

function doClickHandlerDeleteWayoint() {
    $(".btn_delete_waypoint").unbind('click');
    $(".btn_delete_waypoint").each(function () {
        $(this).click(function () {
            var reference = $(this).attr('rel');
            var raceId = $(".race_id_label").attr('rel');
            $.ajax({
                type: 'DELETE',
                url: '/api/races/' + raceId + '/waypoints/' + reference
            }).done(function (response) {
                if (response.msg === '') {
                    $(".waypoints_of_race").html("");
                    fillWaypointTable();
                }
            });
        });
    });
}

function addViewInformationWaypointFunctionality() {
    $(".single_cafe").unbind('click');
    $(".waypoint_row .single_waypoint a").each(function () {
        $(this).click(function () {
            var reference = $(this).attr('id');

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

function doUserEnterRace() {
    $("#enter_race_button").unbind('click');
    $("#enter_race_button").click(function () {
        var raceId = $(".race_id_label").attr('rel');
        $.ajax({
            type: 'POST',
            url: '/api/races/' + raceId + '/users',
            dataType: 'JSON'
        }).done(function (response) {


        });
    });
}

function doAdminStartRace() {
    $(".btn_start_race").unbind('click');
    $(".btn_start_race").click(function () {
        var raceId = $(".race_id_label").attr('rel');
        var data = {
            status: "started"
        };
        $.ajax({
            type: 'POST',
            data: data,
            url: '/api/races/' + raceId
        }).done(function (response) {
            $(".btn_start_race").parent().prepend("<button class='btn btn-danger btn-small btn_stop_race' rel='" + raceId + "'>Stop the race!</button>");
            $(".btn_start_race").remove();
            doBtnStopRace();
        });
    });
}