module.exports = function (dbData, Sequelize) {
    var db = {
        error: '',
        isConnected: false,
        sequelize: null,
        models: null,
        connect: function (callBack) {
            var sequelize = new Sequelize(dbData.database, dbData.user, dbData.password, {
                define: { engine: 'InnoDB' },
                host: dbData.host,
                dialect: 'mysql',
                timestamps: true,
                logging: false
            });
            sequelize.authenticate()
                .then(function (err) {
                    db.isConnected = true;

                    var Users = sequelize.import(__dirname + "/models/Users");
                    var Events = sequelize.import(__dirname + "/models/Events");
                    var Contents = sequelize.import(__dirname + "/models/Contents");
                    var EventsUsers = sequelize.import(__dirname + "/models/EventsUsers");
                    var EventsContents = sequelize.import(__dirname + "/models/EventsContents");
                    var EventsLecturers = sequelize.import(__dirname + "/models/EventsLecturers");
                    var EventsVideos = sequelize.import(__dirname + "/models/EventsVideos");

                    // Cria a ligacao do usuario que criou o evento.
                    Events.belongsTo(Users, { foreignKey: 'userId', targetKey: 'id' });

                    // Cria a relacao de participantes de eventos.
                    Users.belongsToMany(Events, { through: EventsUsers, foreignKey: 'userId', targetKey: 'id' });
                    Events.belongsToMany(Users, { through: EventsUsers, foreignKey: 'eventId', targetKey: 'id' });

                    // Cria a relacao de conteudos de eventos.
                    Contents.belongsToMany(Events, { through: EventsContents, foreignKey: 'contentId', targetKey: 'id' });
                    Events.belongsToMany(Contents, { through: EventsContents, foreignKey: 'eventId', targetKey: 'id' });

                    // Cria a licagacao de palestrantes de eventos.
                    EventsLecturers.belongsTo(Events, { foreignKey: 'eventId', targetKey: 'id' });

                    // Cria a licagacao de videos de eventos.
                    EventsVideos.belongsTo(Events, { foreignKey: 'eventId', targetKey: 'id' });

                    Users.sync();
                    Contents.sync();
                    Events.sync();
                    EventsUsers.sync();
                    EventsContents.sync();
                    EventsLecturers.sync();
                    EventsVideos.sync();

                    db.models = {
                        Users: Users,
                        Events: Events,
                        Contents: Contents,
                        EventsUsers: EventsUsers,
                        EventsContents: EventsContents,
                        EventsLecturers: EventsLecturers,
                        EventsVideos: EventsVideos,
                    };

                    db.sequelize = sequelize;
                })
                .catch(function (err) {
                    db.error = 'Não foi possível se conectar ao banco de dados: ' + err;
                })
                .finally(function () {
                    setTimeout(function () {
                        callBack(db);
                    }, 1);
                });
        }
    }
    return db;
}
