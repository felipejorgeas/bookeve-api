module.exports = function (sequelize, DataTypes) {
    var EventsLecturers = sequelize.define("EventsLecturers", {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: ''
        },
    }, {
            tableName: 'eventsLecturers'
        });
    EventsLecturers.saveLecturers = function (lecturers, callback, res) {
        EventsLecturers.bulkCreate(lecturers, { individualHooks: true }).then(function (lecturers) {
            if (callback) {
                callback(lecturers, res);
            }
        }).catch(function (err) {
            if (callback) {
                callback(lecturers, res, err);
            }
        });
    };
    return EventsLecturers;
};
