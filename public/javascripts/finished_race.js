$(document).ready(function(){
    $(".race_results").append("<div class='single_result'><div class='check_time'>In hoeveel tijd</div><div class='user'>Deelnemer</div><div class='checkpoints_checked'>Hoeveel checkpoints</div></div></br>");
    fillResults();
});

function fillResults(){
    var raceId = $(".race_id").attr('rel');
    // jQuery AJAX call for JSON
    $.getJSON('/api/races/' + raceId + '/results', function (data) {
        $.each(data, function () {
            $(".race_results").append("<div class='single_result'><div class='check_time'>"+this.inTime+"</div><div class='user'>"+this.username+"</div><div class='checkpoints_checked'>"+this.checkpointsChecked+"</div></div></br>");
        });
    });
}


