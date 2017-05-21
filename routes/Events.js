module.exports = function (sequelize, models, Utils) {
    var Events = {
        insert: function (req, res) {
            var event = req.body.event;
            models.Events.create(event).then(function (event) {
                res.send(event);
            });
        },
        get: function (req, res) {
            var queryString = req.query;
            var where = {
                where: (queryString ? queryString : {})
            };
            models.Events.scope('eventsActive').findAll(where).then(function (eventos) {
                if (eventos) {
                    res.send(Utils.setResponse(200, eventos));
                } else {
                    res.send(Utils.setResponse(201));
                }
            }).catch(function (err) {
                res.send(Utils.setResponse(err));
            });
        },
        getOne: function (req, res) {
            var params = req.params;
            var where = {
                where: {
                    id: params.id
                }
            };
            models.Events.scope('eventsOk').findOne(where).then(function (evento) {
                if (evento) {
                    evento = evento.dataValues;
                    // Busca os videos do evento
                    var where = {
                        where: {
                            eventId: evento.id
                        }
                    };
                    models.EventsVideos.findAll(where).then(function (videos) {
                        if (videos) {
                            evento.videos = videos;
                        }
                        res.send(Utils.setResponse(200, evento));
                    });
                } else {
                    throw 'Evento não encontrado!';
                }
            }).catch(function (err) {
                res.send(Utils.setResponse(err));
            });
        },
        remove: function (req, res) {
            var params = req.params;
            var event = {
                id: params.id
            };
            var where = {
                where: event
            };
            var update = {
                deleted: 1
            };
            models.Events.scope('eventsOk').findOne(where).then(function (evento) {
                if (evento) {
                    models.Events.update(update, where).then(function (result) {
                        if (result) {
                            models.Events.findOne(where).then(function (evento) {
                                res.send(Utils.setResponse(200, evento));
                            });
                        } else {
                            throw 'Não foi possível excluir o evento!';
                        }
                    });
                } else {
                    throw 'Evento não encontrado!';
                }
            }).catch(function (err) {
                res.send(Utils.setResponse(err));
            });
        }
    };
    return Events;
};
