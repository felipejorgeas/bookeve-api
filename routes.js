module.exports = function (sequelize, models, Utils, async) {
    var routes = {
        users: require(__dirname + '/routes/Users.js')(sequelize, models, Utils),
        contents: require(__dirname + '/routes/Contents.js')(sequelize, models, Utils),
        events: require(__dirname + '/routes/Events.js')(sequelize, models, Utils, async),
        eventsVideos: require(__dirname + '/routes/EventsVideos.js')(sequelize, models, Utils),
        eventsLecturers: require(__dirname + '/routes/EventsLecturers.js')(sequelize, models, Utils),
    };
    return routes;
};
