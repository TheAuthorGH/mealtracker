const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    journals: [{type: mongoose.Schema.Types.ObjectId}]
});

userSchema.methods.serialize = function() {
    return {
        id: this._id,
        email: this.email,
        journals: this.journals
    };
};

const Users = mongoose.model('User', userSchema);

module.exports = Users;