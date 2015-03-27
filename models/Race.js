function init(mongoose) {
    console.log('Initializing race schema');

    var raceSchema = mongoose.Schema({
        name: {type: String, required: true},
        status: {type: String, required: true, default: "pending"},
        startDate: {type: Date},
        endDate: {type: Date},
        users: [{type: mongoose.Schema.Types.ObjectId, ref: 'User' /* Pseudo-joins */}],
        waypoints: [{type: mongoose.Schema.Types.ObjectId, ref: 'Waypoint' /* Pseudo-joins */}],
        results: [{
                user: {type: mongoose.Schema.Types.ObjectId, ref: 'User' /* Pseudo-joins */},
                waypoint: {type: mongoose.Schema.Types.ObjectId, ref: 'Waypoint' /* Pseudo-joins */},
                timeChecked: {type: Date, default: Date.now}
            }]
    },
    // settings:
    {
        toObject: {virtuals: true},
        toJSON: {virtuals: true}
    });

    // validation
    raceSchema.path('name').validate(function (val) {
        return val && val.length <= 10;
    }, 'racename cannot be longer than 10 characters');

    // filters
    raceSchema.statics.filterOnName = function (result, name) {
        if (!result) {
            result = this.find();
        }

        return result.where('name', name);
    };

    //paging
    raceSchema.statics.findByPage = function (result, pageIndex, pageSize) {
        if (!result) {
            result = this.find();
        }

        return result
                .limit(pageSize)
                .skip(pageIndex * pageSize)
    };

    //function
    raceSchema.methods.getWinner = function (result) {
        
        var raceResults = result.results;
        var winnerArray = [];
        var startDate = result.startDate;
        var countingInHours = 1000*60*60;
        var countingInMinutes = 1000*60;
        var countingInSeconds = 1000;
        
        for(i = 0; i < result.users.length; i++){
            var counter = 0;
            var lastDate = "";
            for(a = 0; a < raceResults.length; a++){
                if(raceResults[a].user.equals(result.users[i])){
                    counter++;
                    lastDate = raceResults[a].timeChecked;
                }
            }
            var syntax = "";
            if(lastDate != ""){
                var timeNeeded = lastDate - startDate;
                syntax = (timeNeeded/countingInMinutes).toFixed() + " minutes or " + (timeNeeded/countingInSeconds).toFixed() + " seconds.";
            }else{
                syntax = "Niet van toepassing.";
            }
            winnerArray.push({userid: result.users[i], amountOfChecks: counter, inTime: syntax});
        }
        return winnerArray;
    };


    mongoose.model('Race', raceSchema);
}

module.exports = init;