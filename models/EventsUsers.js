module.exports = function(sequelize, DataTypes) {
    return sequelize.define("EventsUsers", {
        code: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        active: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1
        },
    }, {
        tableName: 'eventsUsers'
    });
};
