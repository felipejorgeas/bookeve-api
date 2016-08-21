module.exports = function (sequelize, models) {
    var routes = {
        users: require(__dirname + '/routes/Users.js')(sequelize, models),
        contents: require(__dirname + '/routes/Contents.js')(sequelize, models),
        events: require(__dirname + '/routes/Events.js')(sequelize, models),
    }
    return routes;
}
