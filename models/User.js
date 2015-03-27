function init(mongoose, bcrypt) {
    console.log('Initializing user schema');

    var userSchema = mongoose.Schema({
        local: {
            email: {type: String, unique: true, required: true},
            password: {type: String, required: true},
            role: { type: String }
        }, 
        races: [{type: mongoose.Schema.Types.ObjectId, ref: 'Race' /* Pseudo-joins */}]
    },
    // settings:
    {
        toObject: {virtuals: true},
        toJSON: {virtuals: true}
    });

    // Virtuals
    userSchema.virtual('id').get(function () {
        return this._id;
    });
    
    userSchema.virtual('fullinfo').get(function () {
        return "email: " + this.local.email + ", role: " + this.local.role;
    });
    
    // validation
//    userSchema.path('local.email').validate(function (val) {
//        return val && val.length >= 10;
//    }, 'username cannot be longer than 10 characters');
//    
//    userSchema.path('local.password').validate(function (val) {
//        return val && val.length >= 10;
//    }, 'username cannot be longer than 10 characters');
    
    // Methods
    // generate hash
    userSchema.methods.generateHash = function (password) {
        return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
    };

    // checking if password is valid
    userSchema.methods.validPassword = function (password) {
        return bcrypt.compareSync(password, this.local.password);
    };

    mongoose.model('User', userSchema);
}

module.exports = init;