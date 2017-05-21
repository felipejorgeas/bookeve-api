module.exports = function(sequelize, DataTypes) {
    return sequelize.define("EventsLecturers", {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: ''
        },
    }, {
        tableName: 'eventsLecturers'
    });
};
