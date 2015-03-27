var express = require('express');
var router = express();
var _ = require('underscore');
var async = require('async');

function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}

module.exports = function (mongoose, errCallback, googlePlaces) {
    console.log('Initializing racers api routing module');
    var Race = mongoose.model('Race');
    var Waypoint = mongoose.model('Waypoint');
    var User = mongoose.model('User');
    var handleError = errCallback;
    var places = new googlePlaces('AIzaSyBB1DIOHfoeKnUS0PBjxDbSPwnR6SXy5VQ', 'json');


    function getUserRole(req, res) {
        var role = "";
        if (isLoggedIn && typeof req.user !== 'undefined') {
            role = req.user.local.role;
        } else {
            role = "geen rol";
        }
        return role;
    }

    function getRaces(req, res) {
        // based on the query, this will be all authors or 1 author
        var result = Race.find({});

        if (req.query.pageIndex && req.query.pageSize) {
            result = Race.findByPage(result, req.query.pageIndex, req.query.pageSize);
        }

        if (req.query.name && req.query.name !== undefined) {

            result = Race.filterOnName(result, req.query.name);
        }

        // show list of only available races to user
        result.exec(function (err, data) {
            if (err) {
                return handleError(req, res, 500, err);
            }
            var role = getUserRole(req, res);

            var userId = "";
            if (typeof req.user != 'undefined') {
                userId = req.user._id;
            } else {
                userId = 0;
            }

            res.send(
                    {data: data, role: role, userid: userId}
            );
        });
    }

    function addRace(req, res) {
        var race = new Race(req.body);
        race.save(function (err, savedRace) {
            if (err) {
                return handleError(req, res, 500, err);
            }
            else {
                res.send(
                        {msg: ''}
                );
            }
        });
    }

    function updateRace(req, res) {
        var idOfUpdatingRace = req.params.id;
        Race.findById(idOfUpdatingRace, function (err, result) {
            if (err) {
                return handleError(req, res, 500, err);
            }
            // set race name
            result.name = req.body.name;
            result.save(function (err) {
                if (err) {
                    return handleError(req, res, 500, err);
                }
                else {
                    res.send(
                            {msg: ''}
                    );
                }
            });
        });
    }

    function startOrStopRace(req, res) {
        Race.findById(req.params.id, function (err, result) {
            if (err) {
                return handleError(req, res, 500, err);
            }
            var status = req.body.status;
            result.status = status;
            if(req.body.status == "started"){
                result.startDate = new Date();
            }else{
                result.endDate = new Date();
            }
            result.save(function (err) {
                if (err) {
                    return handleError(req, res, 500, err);
                }
                else {
                    res.send(
                            {msg: ''}
                    );
                }
            });
        });
    }

    function deleteRace(req, res, next) {
        Race.remove({
            _id: req.params.id
        }, function (err, result) {
            if (err) {
                return handleError(req, res, 500, err);
            }
            else {
                res.send(
                        {msg: ''}
                );
            }
        });
    }

    function getWaypointsOfRace(req, res) {
        var race = Race.findOne({_id: req.params.id});
        var array = [];
        race.exec(function (err, data) {
            if (err) {
                return handleError(req, res, 500, err);
            }
            async.each(data.waypoints, function (waypoint, next) {
                Waypoint.findById(waypoint, function (error, response) {
                    if (err) {
                        return handleError(req, res, 500, err);
                    }
                    array.push({name: response.name, reference: response.reference, id: response._id});
                    next();
                });
            }, function (err) {
                res.json({array: array, race: data});
            });
        });
    }

    function addWaypointToRace(req, res) {
        var raceId = req.params.id;
        places.placeDetailsRequest({reference: req.body.reference}, function (err, response) {
            if (err) {
                return handleError(req, res, 500, err);
            }
            Race.findById(raceId, function (err, race) {
                if (err) {
                    return handleError(req, res, 500, err);
                }
                Waypoint.find({id: req.body.id}, function (err, waypoint) {
                    if (err) {
                        return handleError(req, res, 500, err);
                    }
                    if (waypoint.length) {
                        Waypoint.findOne({id: req.body.id}, function (error, response) {
                            race.waypoints.push(response);
                            race.save(function (err) {
                                if (err) {
                                    return handleError(req, res, 500, err);
                                }
                                else {
                                    res.send(
                                            {msg: ''}
                                    );
                                }
                            });
                        });
                    }
                    else {
                        var waypoint = new Waypoint({
                            name: response.result.name,
                            place_id: response.result.place_id,
                            reference: response.result.reference,
                            address: response.result.formatted_address,
                            location: {
                                lat: response.result.geometry.location.lat,
                                lng: response.result.geometry.location.lng
                            },
                            id: response.result.id
                        });
                        waypoint.save(function (err, savedWaypoint) {
                            if (err) {
                                return handleError(req, res, 500, err);
                            } else {
                                race.waypoints.push(savedWaypoint);
                                race.save(function (err) {
                                    if (err) {
                                        return handleError(req, res, 500, err);
                                    }
                                    else {
                                        res.send(
                                                {msg: ''}
                                        );
                                    }
                                });
                            }
                        });
                    }
                });
            });
        });
    }

    function deleteWaypointOfRace(req, res) {
        var raceId = req.params.id;
        var reference = req.params.reference;
        Race.findById(raceId, function (err, race) {
            if (err) {
                return handleError(req, res, 500, err);
            }
            Waypoint.find({reference: reference}, function (err, waypoint) {
                if (err) {
                    return handleError(req, res, 500, err);
                }
                var waypointId = waypoint[0]._id;
                for (i = 0; i < race.waypoints.length; i++) {
                    if (waypointId.equals(race.waypoints[i])) {
                        Race.update({_id: raceId}, {$pull: {waypoints: race.waypoints[i]}}, function (err, result) {
                            res.send((result === 1) ? {msg: ''} : {msg: 'error: ' + err + req});
                        });
                    }
                }
            });
        });
    }

    function getUsersOfRace(req, res) {
        var race = Race.findOne({_id: req.params.id});
        var array = [];
        race.exec(function (err, data) {
            if (err) {
                return handleError(req, res, 500, err);
            }
            async.each(data.users, function (user, next) {
                User.findById(user, function (error, response) {
                    if (err) {
                        return handleError(req, res, 500, err);
                    }
                    array.push({name: response.local.email, id: response._id});
                    next();
                });
            }, function (err) {
                res.json(array);
            });
        });
    }

    function addUserToRace(req, res) {
        User.findById(req.user._id, function (err, user) {
            if (err) {
                return handleError(req, res, 500, err);
            }
            Race.findById(req.params.id, function (err, race) {
                if (err) {
                    return handleError(req, res, 500, err);
                }
                user.races.push(race);
                user.save(function (err) {
                    if (err) {
                        return handleError(req, res, 500, err);
                    }
                    else {
                        race.users.push(user);
                        race.save(function (err) {
                            if (err) {
                                return handleError(req, res, 500, err);
                            }
                            res.redirect('/');
                        });
                    }
                });
            });
        });
    }

    function checkWaypoint(req, res) {
        Race.findById(req.params.id, function (err, race) {
            if (err) {
                return handleError(req, res, 500, err);
            }
            var user = req.user;
            var waypointId = req.body.waypointId;
            Waypoint.findById(waypointId, function (err, waypoint) {
                if (err) {
                    return handleError(req, res, 500, err);
                }
                race.results.push({user: user, waypoint: waypoint});
                race.save(function (err) {
                    if (err) {
                        return handleError(req, res, 500, err);
                    }
                    else {
                        res.send({msg: ''});
                    }
                });
            });
        });
    }

    function getJsonResults(req, res) {
        Race.findById(req.params.id, function (err, race) {
            if (err) {
                return handleError(req, res, 500, err);
            }
            var array = [];
            var raceWinnerArray = race.getWinner(race);
            var actualWinner = "";
            async.each(raceWinnerArray, function (result, next) {   
                User.findById(result.userid, function (err, user) {
                    if (err) {
                        return handleError(req, res, 500, err);
                    }               
                    var username = user.local.email;
                    // @TODO calculate the winner
//                    if(actualWinner == ""){
//                        actualWinner = username;
//                    }else{
//                        //if(result.amountOfChecks)
//                    }
                    array.push({username: username, checkpointsChecked: result.amountOfChecks, inTime: result.inTime});
                    next();
                });
            }, function (err) {
                res.json(array);
            });
        });
    }

    router.route('/')
            // returns json with all races
            .get(getRaces)
            // saves a new race
            .post(addRace);
    router.route('/:id')
            // update a single race
            .put(updateRace)
            // set status of race to started
            .post(startOrStopRace)
            // delete single race
            .delete(deleteRace);
    router.route('/:id/waypoints')
            // returns json of all waypoints of a single race
            .get(getWaypointsOfRace)
            // posts a new waypoint to a race
            .post(addWaypointToRace);
    router.route('/:id/users')
            // returns json of all users in a race
            .get(getUsersOfRace)
            // posts a new user to a race
            .post(addUserToRace);
    router.route('/:id/waypoints/:reference')
            // deletes a waypoint from a race
            .delete(deleteWaypointOfRace);
    router.route('/:id/checkrace')
            .post(checkWaypoint);
    router.route('/:id/results')
            .get(getJsonResults);

    return router;
};


/**
 * 
 /Races
 HTMl
 
 API/RACES
 JSON
 
 Api/Races [   ::GET
 { name: race 1, etc... }
 ]
 
 Api/Races/2    ::GET
 { id: 2, name : race2, etc}
 
 Api/Races    ::POST
 {    name: new Race, etc...  }
 
 API/RACES/2 ::PUT
 { name: new Race, etc...}
 
 xample:  GetRace( Req.url.id ).update(req.body.race);
 
 API/RACES/2 ::DELTE
 { EMPTY }
 
 ########## TOEVEOGEN VAN EEN WAYPOINT ###############
 API/RACES/2/WAYPTOINS   ::POST
 { waypointName: 'weej pointje', etc. }
 
 
 --> ShowRace 
 --> GetRAce
 
 
 **/