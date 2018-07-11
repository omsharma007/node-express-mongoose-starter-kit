/**
 * Created by OmPrakashSharma on 11-07-2018.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new mongoose.Schema({

    firstName: {
        type: String
    },
    lastName: {
        type: String
    },
    email: {
        type: String
    },
    mobile: {
        type: String
    },
    status: {
        type: 'boolean',
        default: true
    },
    createdAt: {
        type: Date,
        default: new Date()
    },
    updatedAt: {
        type: Date,
        default: new Date()
    }
});

exports.userSchema = module.exports.userSchema = userSchema;

exports.boot = module.exports.boot = function (app) {
    mongoose.model('User', userSchema);
    return app.models.User = mongoose.model('User');
};