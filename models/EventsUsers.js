module.exports = function (sequelize, DataTypes) {
    return sequelize.define("EventsUsers", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        deleted: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        }
    }, {
            tableName: 'eventsUsers'
        });
};
