module.exports = function(sequelize, DataTypes) {
    return sequelize.define("Contents", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        link: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: ''
        },
        active: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1
        },
    }, {
        tableName: 'contents'
    });
};
