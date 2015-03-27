// Racelist data array for filling in info box
var raceListData = [];

// DOM Ready =============================================================
$(document).ready(function () {

    // Populate the race table on initial page load
    populateTable();
    // Racename link click
    $('#raceList table tbody').on('click', 'td a.linkShowRace', showRaceInfo);
    // Add Race button click
    $('#btnAddRace').on('click', addRace);
    // Delete Race by button click
    $('#raceList table tbody').on('click', 'td button.linkDeleteRace', deleteRace);
    // edit race on button click
    $('#raceList table tbody').on('click', 'td button.linkUpdateRace', updateRace);
    // show existing race on button click
    //$('#raceListOfUser table tbody').on('click', 'td button.show_joined_race', showJoinedRace);

});

// Fill table with data
function populateTable() {

    // Empty content string
    var tableContent = '';
    var isAdmin = false;
    var extraAdminText = "";

    // jQuery AJAX call for JSON
    $.getJSON('/api/races', function (data) {

        // Stick our race data array into a racelist variable in the global object
        raceListData = data.data;

        if (data.role == "admin") {
            isAdmin = true;
            //admins can start races;
            extraAdminText = " and/or Start";
        }

        // create html table for the list of races which the user joined in.
        $("#raceListOfUser").html("<table><thead><th>Racenaam</th><th>Status</th><th></th></thead><tbody></tbody></table>");

        // For each item in our JSON, add a table row and cells to the content string
        $.each(data.data, function () {
            // bool to check whether the user is in the current race or not
            // if so, dont display it in the race list, but in the joined list
            var userIsAlreadyInRace = false;
            for (i = 0; i < this.users.length; i++) {
                if (this.users[i] == data.userid) {
                    userIsAlreadyInRace = true;
                }
            }
            if (!userIsAlreadyInRace) {
                tableContent += '<tr>';
                tableContent += '<td><a href="#" class="linkShowRace" rel="' + this.name + '">' + this.name + '</a></td>';
                if (isAdmin) {
                    tableContent += '<td><input type="text" placeholder="Nieuwe naam" id="' + this._id + '" class="update_race_name form-control input-sm" /></td>';
                }
                tableContent += '<td><button class="btn btn-small btn-primary linkShowRace" rel="' + this._id + '"><a href="/races/' + this._id + '"> Show' + extraAdminText + '</a></button></td>';
                if (isAdmin) {
                    tableContent += '<td><button class="btn btn-small btn-warning linkUpdateRace" rel="' + this._id + '">Update</button></td>';
                    tableContent += '<td><button class="btn btn-small btn-danger linkDeleteRace" rel="' + this._id + '">Delete</button></td>';
                }
                tableContent += '</tr>';
            } else {
                $("#raceListOfUser table tbody").append('<tr><td>' + this.name + '</td><td>' + this.status + '</td><td>\n\
                <button class="btn btn-primary btn-small show_joined_race" rel="' + this._id + '"><a href="/races/' + this._id + '/showrace">Show</a></button></td></tr>');
            }
        });
        // Inject the whole content string into our existing HTML table
        $('#raceList table tbody').html(tableContent);
    });
};

// Show Race Info
function showRaceInfo(event) {

    // Prevent Link from Firing
    event.preventDefault();

    // Retrieve racename from link rel attribute
    var thisRaceName = $(this).attr('rel');

    // Get Index of object based on id value
    var arrayPosition = raceListData.map(function (arrayItem) {
        return arrayItem.name;
    }).indexOf(thisRaceName);

    // Get our Race Object
    var thisRaceObject = raceListData[arrayPosition];

    //Populate Info Box
    $('#raceInfoName').text(thisRaceObject.name);
    $('#raceInfoStatus').text(thisRaceObject.status);
}

// Add Race
function addRace(event) {
    event.preventDefault();
    // increase errorCount variable if any fields are blank
    var errorCount = 0;
    $('.addRace input').each(function (index, val) {
        if ($(this).val() === '')
        {
            errorCount++;
        }
    });

    // Check and make sure errorCount's still at zero
    if (errorCount === 0) {
        // If it is, compile all user info into one object
        var newRace = {
            'name': $('.addRace fieldset input#inputRaceName').val()

        };
        
        $.ajax({
            type: 'POST',
            data: newRace,
            url: '/api/races',
            dataType: 'JSON'
        }).done(function (response) {
            // Check for successful (blank) response
            if (response.msg === '') {
                // Clear the form inputs
                $('.addRace fieldset input').val('');

                // Update the table
                populateTable();
            }
            else {
                // If something goes wrong, alert the error message that our service returned
                alert('Error: ' + response.msg);
            }
        });
    }
    else {
        // If errorCount is more than 0, error out
        alert('Doe wel ff een naam geven?!');
        return false;
    }
}
;

// Delete Race
function deleteRace(event) {

    event.preventDefault();

    // Pop up a confirmation dialog
    var confirmation = confirm('Are you sure you want to delete this user?');

    var raceId = $(this).attr('rel')

    // Check and make sure the user confirmed
    if (confirmation === true) {
        //console.log($(this).attr('rel'));
        // If they did, do our delete
        $.ajax({
            type: 'DELETE',
            url: '/api/races/' + raceId
        }).done(function (response) {
            // Check for a successful (blank) response
            if (response.msg === '') {
                // update table
                populateTable();
            }
            // an else is not necessary because in the route is checked whether a request is done or not
        });
    }
    else {
        // If they said no to the confirm, do nothing
        return false;
    }
};

function updateRace(event) {
    event.preventDefault();

    var raceId = $(this).attr('rel');
    var thisInput = $("#" + raceId);
    var newRaceName = thisInput.val();

    // pass the new name to the controller
    var data = {
        name: newRaceName
    };

    $.ajax({
        type: 'PUT',
        data: data,
        url: '/api/races/' + raceId
    }).done(function (response) {
        // Check for successful (blank) response
        if (response.msg === '') {
            // empty the input
            thisInput.val("");

            // Update the table
            populateTable();

        }
        // an else is not necessary because in the route is checked whether a request is done or not
    });
}