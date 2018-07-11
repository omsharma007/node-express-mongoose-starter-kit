/**
 * Created by OmPrakashSharma on 11-07-2018.
 */

'use strict';

var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
var responseStatus = require('../../config/api-codes');
var config = require('../../config/config');
var fs = require('fs');
var async = require('async');
var _ = require('lodash');
var path = require('path');
var waterfall = require('async-waterfall');

module.exports = function (io, app) {

    var User = app.models.User;

    app.getUserInfo = function (req, res) {

        if (req.params && req.params.userId) {

            User.findOne({
                _id: req.params.userId
            }, function (err, userResponse) {

                if (err) {
                    return res.status(responseStatus.INTERNAL_ERROR).send({
                        message: 'INTERNAL SERVER ERROR',
                        error: err
                    });
                }

                if (userResponse) {
                    return res.status(responseStatus.SUCCESS).send({
                        info: userResponse,
                        status: true
                    });
                } else {
                    return res.status(responseStatus.SUCCESS).send({
                        info: userResponse,
                        message: 'No user found ',
                        status: false
                    });
                }
            });
        } else {
            return res.status(responseStatus.BAD_REQUEST).send({
                message: 'User id is missing ',
                status: false
            });
        }
    };

    app.getUsersList = function (req, res) {

        var query = {};
        var dataPerPage = 20;
        var page;
        if (req.query && req.query.page) {
            page = Math.abs(parseInt(req.query.page));
        } else {
            page = 0;
        }

        async.parallel([
                function (callback) {
                    User.count(query).exec(function (err, count) {
                        if (err) {
                            callback(err, null);
                        } else {
                            callback(null, count);
                        }
                    });
                }, function (callback) {

                    User.find(query)
                        .skip(page * dataPerPage)
                        .limit(dataPerPage)
                        .exec(
                        function (err, searchResponse) {
                            if (err) {
                                callback(err, null);
                            } else {
                                callback(null, searchResponse);
                            }
                        });
                }],
            function (err, results) {

                if (err) {
                    return res.status(responseStatus.INTERNAL_ERROR).send({
                        message: 'INTERNAL SERVER ERROR',
                        error: err
                    });
                }
                var responseObject = {
                    totalCount: results[0],
                    users: results[1]
                };
                return res.status(responseStatus.SUCCESS).json(responseObject);
            });
    }

    app.createUser = function (req, res) {

        if (req.body && req.body.firstName && req.body.mobile && req.body.email) {

            var query = [];
            var userObject = new User(req.body);
            if (userObject.email) {
                query.push({'email': userObject.email});
            }
            if (userObject.mobile) {
                query.push({'mobile': userObject.mobile});
            }
            User.findOne({
                $or: query
            }).exec(function (err, userSearchResult) {

                if (err) {
                    return res.status(responseStatus.INTERNAL_ERROR).send({
                        message: "INTERNAL SERVER ERROR",
                        error: err
                    });
                }
                if (userSearchResult) {
                    return res.status(responseStatus.SUCCESS).json({
                        message: "User info already exist",
                        status: false
                    });
                } else {
                    userObject.save(function (err, result) {
                        if (err) {
                            return res.status(responseStatus.INTERNAL_ERROR).send({
                                message: 'Internal Server Error'
                            });

                        } else {
                            return res.status(responseStatus.SUCCESS).send({
                                info: result,
                                status: true
                            });
                        }
                    })
                }
            });
        } else {
            return res.status(responseStatus.BAD_REQUEST).send({status: false, message: "User Info is missing !!"})
        }

    };

    app.updateUser = function (req, res) {

        if (req.params && req.params.userId) {

            User.findOne({
                _id: req.params.userId
            }, function (err, response) {
                if (err) {
                    return res.status(responseStatus.INTERNAL_ERROR).send({
                        message: 'INTERNAL SERVER ERROR',
                        error: err
                    });
                }
                if (response) {

                    if (req.body.firstName) {
                        response.firstName = req.body.firstName;
                    }
                    if (req.body.lastName) {
                        response.lastName = req.body.lastName;
                    }
                    if (req.body.email) {
                        response.email = req.body.email;
                    }
                    if (req.body.mobile) {
                        response.mobile = req.body.mobile;
                    }
                    if (req.body.status != undefined) {
                        response.status = req.body.status;
                    }
                    response.save(function (err, response) {
                        if (err) {
                            return res.status(responseStatus.INTERNAL_ERROR).send({
                                message: 'Internal Server Error'
                            });

                        } else {
                            return res.status(responseStatus.SUCCESS).send({
                                message: 'User info updated successfully !!',
                                status: true
                            });
                        }
                    });
                } else {
                    return res.status(responseStatus.SUCCESS).send({
                        message: 'No user found ',
                        status: false
                    });
                }
            });
        } else {
            return res.status(responseStatus.BAD_REQUEST).send({
                message: 'User id is missing ',
                status: false
            });
        }
    };

    app.deleteUser = function (req, res) {

        if (req.params && req.params.userId) {

            User.findOne({
                _id: req.params.userId
            }, function (err, response) {

                if (err) {
                    return res.status(responseStatus.INTERNAL_ERROR).send({
                        message: "INTERNAL SERVER ERROR",
                        status: false
                    });
                }
                if (response) {
                    response.remove(function (err, deleteResponse) {
                        if (err) {
                            return res.status(responseStatus.INTERNAL_ERROR).send({
                                message: "INTERNAL SERVER ERROR",
                                status: false
                            });
                        }
                        return res.status(responseStatus.SUCCESS).send({
                            message: "User info deleted successfully !!",
                            status: true
                        });
                    });
                } else {
                    return res.status(responseStatus.SUCCESS).send({message: "User not found !!", status: false});
                }
            });
        } else {
            return res.status(responseStatus.BAD_REQUEST).send({message: "User id is missing  !!", status: false});
        }
    };

}