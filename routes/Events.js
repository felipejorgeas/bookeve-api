module.exports = function (sequelize, models, Utils, async) {
    var Events = {
        evento: null,
        insert: function (req, res) {
            var event = req.body;
            if(!event.lecturers){
                event.lecturers = [];
            }
            if(!event.videos){
                event.videos = [];
            }
            models.Events.create(event).then(function (result) {
                var evento = result.dataValues;
                if (evento) {
                    evento.lecturers = event.lecturers;
                    evento.videos = event.videos;
                    Events.evento = evento;
                    async.parallel({
                        lecturers: Events.saveEventLecturers,
                        videos: Events.saveEventVideos
                    }, function (err, result) {
                        res.send(Utils.setResponse(200, evento));
                    });
                } else {
                    throw 'Não foi possível cadastrar o evento';
                }
            }).catch(function (err) {
                res.send(Utils.setResponse(err));
            });
        },
        saveEventLecturers: function (callback) {
            if (Events.evento.lecturers.length) {
                var lecturers = Events.evento.lecturers;
                lecturers = lecturers.map(function (item) {
                    item.eventId = Events.evento.id;
                    return item;
                });
                models.EventsLecturers.saveLecturers(lecturers, callback);
            } else {
                callback([]);
            }
        },
        saveEventVideos: function (callback) {
            if (Events.evento.videos.length) {
                var videos = Events.evento.videos;
                videos = videos.map(function (item) {
                    item.eventId = Events.evento.id;
                    return item;
                });
                models.EventsVideos.saveVideos(videos, callback);
            } else {
                callback([]);
            }
        },
        update: function (req, res) {
            var dataUpdate = req.body;
            var params = req.params;
            var event = {
                id: params.id
            };
            var where = {
                where: event
            };
            var update = dataUpdate;

            models.Events.findOne(where).then(function (data) {
                if (data) {
                    data = data.dataValues;
                    models.Events.update(update, where).then(function (result) {
                        if (result) {
                            models.Events.findOne(where).then(function (data) {
                                res.send(Utils.setResponse(200, data));
                            });
                        } else {
                            throw 'Não foi possível atualizar os dados do evento!';
                        }
                    });
                } else {
                    throw 'Evento não encontrado!';
                }
            }).catch(function (err) {
                res.send(Utils.setResponse(err));
            });
        },
        get: function (req, res) {
            var queryString = req.query;
            var where = {
                where: (queryString ? queryString : {})
            };
            models.Events.findAll(where).then(function (eventos) {
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
            models.Events.findOne(where).then(function (evento) {
                if (evento) {
                    evento = evento.dataValues;
                    Events.evento = evento;
                    async.parallel({
                        lecturers: Events.getEventLecturers,
                        videos: Events.getEventVideos
                    }, function (err, result) {
                        evento.lecturers = result.lecturers;
                        evento.videos = result.videos;
                        res.send(Utils.setResponse(200, evento));
                    });
                } else {
                    throw 'Evento não encontrado!';
                }
            }).catch(function (err) {
                res.send(Utils.setResponse(err));
            });
        },
        getEventLecturers: function (callback) {
            var where = {
                where: {
                    eventId: Events.evento.id
                }
            };
            models.EventsLecturers.findAll(where).then(function (lecturers) {
                callback(null, lecturers);
            });
        },
        getEventVideos: function (callback) {
            var where = {
                where: {
                    eventId: Events.evento.id
                }
            };
            models.EventsVideos.findAll(where).then(function (videos) {
                callback(null, videos);
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
