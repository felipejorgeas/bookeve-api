module.exports = function (sequelize, DataTypes) {
    var EventsVideos = sequelize.define("EventsVideos", {
        url: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: ''
        },
    }, {
            tableName: 'eventsVideos'
        });
    EventsVideos.saveVideos = function (videos, callback, res) {
        EventsVideos.bulkCreate(videos, { individualHooks: true }).then(function (videos) {
            if (callback) {
                callback(videos, res);
            }
        }).catch(function (err) {
            if (callback) {
                callback(videos, res, err);
            }
        });
    };
    return EventsVideos;
};
