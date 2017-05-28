module.exports = function (sequelize, DataTypes) {
    return sequelize.define("Users", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: ''
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: ''
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: ''
        },
        address: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: ''
        },
        number: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: ''
        },
        complement: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: ''
        },
        neighborhood: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: ''
        },
        city: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: ''
        },
        state: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: ''
        },
        zip: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        accessLevel: {
            type: DataTypes.ENUM,
            values: ['administrador', 'organizador', 'participante'],
            allowNull: false,
            defaultValue: 'participante'
        },
        pswd: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: ''
        },
        active: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1
        },
        deleted: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        }
    }, {
        tableName: 'users',
        scopes: {
            usersOk: {
                where: {
                    deleted: 0
                }
            }
        }
    });
};
