/**
 * Created by OmPrakashSharma on 11-07-2018.
 */

module.exports = function (app) {

    var multiparty = require('connect-multiparty');
    var multipartyMiddleware = multiparty();

    app.route('/api/v1/user/:userId').get(app.getUserInfo);
    app.route('/api/v1/user').get(app.getUsersList);
    app.route('/api/v1/user').post(app.createUser);
    app.route('/api/v1/user:/userId').put(app.updateUser);
    app.route('/api/v1/user/:userId').delete(app.deleteUser);

}