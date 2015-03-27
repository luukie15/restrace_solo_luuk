var express = require('express');
var router = express();
var _ = require('underscore');



module.exports = function (errCallback, googlePlaces) {
    console.log('Initializing waypoint api routing module');
    
    var handleError = errCallback;
    
    var places = new googlePlaces('AIzaSyBB1DIOHfoeKnUS0PBjxDbSPwnR6SXy5VQ', 'json');

    function doTextSearch(req, res) {
        var parameters = {
            query: req.body.cafeName,
            types: 'cafe'
        };
        places.textSearch(parameters, function (error, response) {
            res.send(
                    (error === null) ? {msg: '', data: response.results} : {msg: error}
            );
        });
    }

    function getPlaceDetails(req, res) {
        places.placeDetailsRequest({reference: req.params.reference}, function (error, response) {
            if (error)
                return handleError(req, res, 500, error);
            res.json(response.result);
        });
    }
    
    router.route('/')
            .post(doTextSearch);

    router.route('/:reference')
            .get(getPlaceDetails);

    return router;
};

