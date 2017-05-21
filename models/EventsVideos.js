module.exports = function(sequelize, DataTypes) {
    return sequelize.define("EventsVideos", {
        url: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: ''
        },
    }, {
        tableName: 'eventsVideos'
    });
};
