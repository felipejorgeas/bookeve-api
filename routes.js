module.exports = function (sequelize, models, Utils, async, Mails) {
    var routes = {
        users: require(__dirname + '/routes/Users.js')(sequelize, models, Utils),
        contents: require(__dirname + '/routes/Contents.js')(sequelize, models, Utils),
        events: require(__dirname + '/routes/Events.js')(sequelize, models, Utils, async),
        eventsVideos: require(__dirname + '/routes/EventsVideos.js')(sequelize, models, Utils),
        eventsLecturers: require(__dirname + '/routes/EventsLecturers.js')(sequelize, models, Utils),
        eventsUsers: require(__dirname + '/routes/EventsUsers.js')(sequelize, models, Utils, Mails),
        comunicates: require(__dirname + '/routes/Comunicates.js')(sequelize, models, Utils, async, Mails),
    };
    return routes;
};
