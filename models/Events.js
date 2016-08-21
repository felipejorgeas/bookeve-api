module.exports = function (sequelize, DataTypes) {
    return sequelize.define("Events", {
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
        description: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        banner: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: ''
        },
        dateIni: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        dateFin: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        vacancies: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        address: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: ''
        },
        number: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
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
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        state: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        zip: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        active: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        deleted: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        }
    }, {
        tableName: 'events',
        scopes: {
            eventsOk: {
                where: {
                    deleted: 0
                }
            },
            eventsActive: {
                where: {
                    active: 1
                }
            },
            eventsInactive: {
                where: {
                    active: 0
                }
            }
        }
    });
};
