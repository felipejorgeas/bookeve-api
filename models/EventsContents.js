module.exports = function(sequelize, DataTypes) {
    return sequelize.define("EventsContents", {
        active: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
    }, {
        tableName: 'eventsContents'
    });
};
