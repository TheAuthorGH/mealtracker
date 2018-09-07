const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    email: {type: String, required: true, unique: true},
    verified: {type: Boolean, required: true, default: false},
    password: {type: String, required: true},
    journals: [mongoose.Schema.Types.ObjectId]
});

userSchema.methods.serialize = function() {
    return {
        id: this._id,
        email: this.email,
        verified: this.verified,
        journals: this.journals
    };
};

const Users = mongoose.model('User', userSchema);

module.exports = Users;