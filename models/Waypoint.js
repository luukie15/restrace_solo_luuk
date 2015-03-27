function init(mongoose) {
    console.log('Initializing waypoint schema');

    var waypointSchema = mongoose.Schema({
            name: { type: String, unique: true, required: true },
            place_id: { type: String, unique: true, required: true },
            reference: { type: String, unique: true },
            address: { type: String },
            location: {
                    lat: { type: Number, required: true },
                    lng: { type: Number, required: true }
            },
            id: { type: String, unique: true, required: true }
    },
    // settings:
    {
        toObject: {virtuals: true},
        toJSON: {virtuals: true}
    });


    mongoose.model('Waypoint', waypointSchema);
}

module.exports = init;