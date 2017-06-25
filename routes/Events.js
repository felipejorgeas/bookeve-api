module.exports = function (sequelize, models, Utils, async, Mails) {
    var Events = {
        evento: null,
        insert: function (req, res) {
            var event = req.body;
            event.dateIni = new Date(event.dateIni);
            event.dateFin = new Date(event.dateFin);
            if (event.image) {
                if (event.image.indexOf('png') !== false) {
                    event.banner = 'banner.png';
                } else {
                    event.banner = 'banner.jpg';
                }
            }
            if (!event.lecturers) {
                event.lecturers = [];
            }
            if (!event.videos) {
                event.videos = [];
            }
            models.Events.create(event).then(function (result) {
                var evento = result.dataValues;
                if (evento) {
                    evento.lecturers = event.lecturers;
                    evento.videos = event.videos;
                    Events.evento = evento;
                    async.parallel({
                        banner: Events.saveBanner,
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
        saveBanner: function (callback) {
            var base64Data = Events.evento.image.replace(/^data:image\/png;base64,/, "");
            base64Data = base64Data.replace(/^data:image\/jpg;base64,/, "");
            base64Data = base64Data.replace(/^data:image\/jpeg;base64,/, "");
            var dir = './banners/' + Events.evento.id;
            var filename = dir + '/' + Events.evento.banner;
            if (!require('fs').existsSync(dir)) {
                require("fs").mkdirSync(dir);
            }
            require("fs").writeFile(filename, base64Data, 'base64', function (err) {
                console.log(err);
                if (callback) {
                    callback(err);
                }
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
            var options = {
                where: event
            };
            dataUpdate.dateIni = new Date(dataUpdate.dateIni);
            dataUpdate.dateFin = new Date(dataUpdate.dateFin);
            if (dataUpdate.image) {
                if (dataUpdate.image.indexOf('png') != -1) {
                    dataUpdate.banner = 'banner.png';
                } else {
                    dataUpdate.banner = 'banner.jpg';
                }
            }
            var update = dataUpdate;
            models.Events.findOne(options).then(function (data) {
                if (data) {
                    data = data.dataValues;
                    models.Events.update(update, where).then(function (result) {
                        if (result) {
                            models.Events.findOne(options).then(function (evento) {
                                if (dataUpdate.image) {
                                    Events.evento = dataUpdate;
                                    Events.evento.id = evento.id;
                                    Events.saveBanner();
                                }
                                res.send(Utils.setResponse(200, evento));
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
            var options = {
                where: (queryString ? queryString : {})
            };
            models.Events.findAll(options).then(function (eventos) {
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
            var options = {
                where: {
                    id: params.id
                }
            };
            models.Events.findOne(options).then(function (evento) {
                if (evento) {
                    evento = evento.dataValues;
                    Events.evento = evento;
                    async.parallel({
                        organizer: Events.getEventOrganizer,
                        lecturers: Events.getEventLecturers,
                        videos: Events.getEventVideos,
                        users: Events.getEventUsers
                    }, function (err, result) {
                        evento.organizer = result.organizer;
                        evento.lecturers = result.lecturers;
                        evento.videos = result.videos;
                        evento.users = result.users;
                        res.send(Utils.setResponse(200, evento));
                    });
                } else {
                    throw 'Evento não encontrado!';
                }
            }).catch(function (err) {
                res.send(Utils.setResponse(err));
            });
        },
        getEventOrganizer: function (callback) {
            var options = {
                where: {
                    id: Events.evento.userId
                }
            };
            models.Users.findOne(options).then(function (user) {
                var organizador = {
                    name: user.name,
                    email: user.email
                };
                callback(null, organizador);
            });
        },
        getEventLecturers: function (callback) {
            var options = {
                where: {
                    eventId: Events.evento.id
                }
            };
            models.EventsLecturers.findAll(options).then(function (lecturers) {
                callback(null, lecturers);
            });
        },
        getEventVideos: function (callback) {
            var options = {
                where: {
                    eventId: Events.evento.id
                }
            };
            models.EventsVideos.findAll(options).then(function (videos) {
                callback(null, videos);
            });
        },
        getEventUsers: function (callback) {
            var options = {
                include: {
                    model: models.Events,
                    where: {
                        id: Events.evento.id
                    },
                    through: {
                        where:
                        {
                            deleted: 0
                        }
                    }
                },
                order: [
                    ['name', 'ASC']
                ]
            }
            models.Users.findAll(options).then(function (users) {
                callback(null, users);
            });
        },
        remove: function (req, res) {
            var params = req.params;
            var event = {
                id: params.id
            };
            var options = {
                where: event
            };
            var update = {
                deleted: 1
            };
            models.Events.scope('eventsOk').findOne(options).then(function (evento) {
                if (evento) {
                    models.Events.update(update, where).then(function (result) {
                        if (result) {
                            models.Events.findOne(options).then(function (evento) {
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
        },
        getEventUsersList: function (req, res) {
            var params = req.params;
            var options = {
                where: {
                    id: params.id
                }
            };
            models.Events.findOne(options).then(function (evento) {
                if (evento) {
                    evento = evento.dataValues;
                    var options = {
                        include: {
                            model: models.Events,
                            where: {
                                id: evento.id
                            },
                            through: {
                                where:
                                {
                                    deleted: 0
                                }
                            },
                            order: [
                                ['name', 'ASC']
                            ]
                        }
                    }
                    models.Users.findAll(options).then(function (users) {
                        if (users) {
                            // obtem o template do email de comunicados.
                            var template = Utils.getMailTemplate(Mails.EVENTO_PARTICIPANTES_LIST);
                            var filename = 'inscritos.pdf';
                            var destination = Utils.sprintf('./events_content/%s/%s', evento.id, filename);
                            var data_vars = {};
                            // seta os dados do evento.
                            data_vars.event_name = evento.name;
                            data_vars.event_address = Utils.sprintf('%s, %s %s, %s<br/>%s-%s - Cep: %s', evento.address, evento.number, evento.complement, evento.neighborhood, evento.city, evento.state, evento.zip);
                            var dateIni = {
                                date: (Utils.getDateFormat(evento.dateIni.toString())).split(' ')[0],
                                hour: (Utils.getDateFormat(evento.dateIni.toString())).split(' ')[1]
                            };
                            var dateFin = {
                                date: (Utils.getDateFormat(evento.dateFin)).split(' ')[0],
                                hour: (Utils.getDateFormat(evento.dateFin)).split(' ')[1]
                            };
                            data_vars.event_time = Utils.sprintf('dàs %s do dia %s até às %s do dia %s', dateIni.hour, dateIni.date, dateFin.hour, dateFin.date);
                            // monta uma linha na lista para cada participante.
                            var tr_users = '';
                            users.forEach(function (user) {
                                tr_users += Utils.sprintf('<tr><td>%s</td><td>&nbsp;</td></tr>', user.name);
                            });
                            data_vars.tr_users = tr_users;
                            template = Utils.replaceVars(template, data_vars);
                            Utils.generatePdf(template, destination, false, function (err, result) {
                                if (err) {
                                    res.send(Utils.setResponse(err));
                                } else {
                                    var data = {
                                        eventId: evento.id,
                                        filename: filename
                                    };
                                    res.send(Utils.setResponse(200, data));
                                }
                            });
                        }
                    });
                } else {
                    throw 'Evento não encontrado!';
                }
            }).catch(function (err) {
                res.send(Utils.setResponse(err));
            });
        },
        saveParticipated: function (req, res) {
            var eventId = req.params.id;
            var users = req.body.users;
            var data = users.map(function (eventUser) {
                eventUser.eventId = eventId
                return eventUser;
            });
            var options = {
                updateOnDuplicate: ['participated']
            };
            models.EventsUsers.bulkCreate(data, options).then(function (result) {
                if (result) {
                    res.send(Utils.setResponse(200, result));
                } else {
                    throw 'Não foi possível atualizar os dados do evento!';
                }
            }).catch(function (err) {
                res.send(Utils.setResponse(err));
            });
        }
    };
    return Events;
};
