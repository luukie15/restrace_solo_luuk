$(document).ready(function () {
    doGetWaypointsForStartedRace();
});

function doGetWaypointsForStartedRace() {
    $(".data_result").html('');
    var raceId = $("#raceid").val();
    var userId = $("#userid").val();
    $.getJSON('/api/races/' + raceId + '/waypoints', function (data) {
        $.each(data.array, function () {
            var buttonHtml = "<button class='btn btn-small btn-primary check_waypoint' id=" + this.id + ">CHECK JONGE</button>";

            for (i = 0; i < data.race.results.length; i++) {
                if (data.race.results[i].user == userId && data.race.results[i].waypoint == this.id) {
                    console.log("staat al in checked results");
                    buttonHtml = "";
                }
            }

            $(".data_result").append("<div class='row_waypoint'><div class='single_waypoint'>" + this.name + "</div>" + buttonHtml + "</div></br>");
        });
        addClickHandlerCheckWaypoint();
    });

}

function addClickHandlerCheckWaypoint() {
    $('.check_waypoint').unbind('click');
    $(".check_waypoint").each(function () {
        $(this).click(function () {
            var waypointId = $(this).attr('id');
            var raceId = $("#raceid").val();
            var button = $(this);
            var checkWaypoint = {
                'waypointId': waypointId
            };
            $.ajax({
                type: 'POST',
                data: checkWaypoint,
                url: '/api/races/' + raceId + '/checkrace',
                dataType: 'JSON'
            }).done(function (response) {
                button.parent().find('button').remove();
            });


        });
    });
}