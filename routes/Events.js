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
                    evento.image = event.image;
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
                console.log(err);
                res.send(Utils.setResponse(err));
            });
        },
        saveBanner: function (callback) {
            var base64Data = Events.evento.image.replace(/^data:image\/png;base64,/, "");
            base64Data = base64Data.replace(/^data:image\/jpg;base64,/, "");
            base64Data = base64Data.replace(/^data:image\/jpeg;base64,/, "");
            var dir = './events_content/' + Events.evento.id;
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
                    models.Events.update(update, options).then(function (result) {
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

            if (queryString.painel) {
                var userId = queryString.userId;
                delete queryString.painel;
                delete queryString.userId;

                models.Users.findOne({ where: { id: userId } }).then(function (user) {
                    user = user.dataValues;
                    if (user.accessLevel == 'participante') {
                        var query = `SELECT 
                                        events.* 
                                    FROM 
                                        events
                                        INNER JOIN eventsUsers ON (eventsUsers.eventId = events.id AND
                                                                eventsUsers.userId = :userId AND
                                                                eventsUsers.deleted = 0)
                                    WHERE
                                        events.active = :active AND
                                        events.deleted = :deleted`;
                        sequelize.query(query, { replacements: { userId: user.id, active: 1, deleted: 0 }, type: sequelize.QueryTypes.SELECT })
                        .then(function (eventos) {
                            if (eventos) {
                                res.send(Utils.setResponse(200, eventos));
                            } else {
                                res.send(Utils.setResponse(201));
                            }
                        }).catch(function (err) {
                            console.log(err);
                            res.send(Utils.setResponse(err));
                        });
                    } else if (user.accessLevel == 'organizador') {
                        var query = `SELECT 
                                        events.*
                                    FROM 
                                        events
                                        LEFT JOIN eventsUsers ON (eventsUsers.eventId = events.id AND
                                                                eventsUsers.deleted = 0)
                                    WHERE
                                        (
                                            eventsUsers.userId = :userId AND 
                                            events.active = :active AND
                                            events.deleted = :deleted
                                        ) OR (
                                            events.userId = :userId AND
                                            events.deleted = 0
                                        )`;
                        sequelize.query(query, { replacements: { userId: user.id, active: 1, deleted: 0 }, type: sequelize.QueryTypes.SELECT })
                        .then(function (eventos) {
                            if (eventos) {
                                res.send(Utils.setResponse(200, eventos));
                            } else {
                                res.send(Utils.setResponse(201));
                            }
                        }).catch(function (err) {
                            console.log(err);
                            res.send(Utils.setResponse(err));
                        });
                    } else {
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
                    }
                });
            } else {

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
            }
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
                        var users = result.users;
                        users = users.map(function (user) {
                            user.Events[0].EventsUsers.participated = user.Events[0].EventsUsers.participated ? true : false;
                            return user;
                        });
                        evento.users = users;
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
                    models.Events.update(update, options).then(function (result) {
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
                console.log(err);
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
        },
        getEventUsersCrachas: function (req, res) {
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
                            var template = Utils.getMailTemplate(Mails.EVENTO_PARTICIPANTES_CRACHAS);
                            var filename = 'crachas.html';
                            var destination = Utils.sprintf('./events_content/%s/%s', evento.id, filename);
                            var data_vars = {};
                            var crachas = '';
                            users.forEach(function (user, i) {
                                if (i > 0 && i % 6 == 0) {
                                    crachas += `
                                    <div style="page-break-after: always;"></div>
                                    `;
                                }
                                var type = user.accessLevel;
                                crachas += Utils.sprintf(`<div class="cracha border">
                                                            <div class="circle left"></div>
                                                            <div class="circle right"></div>
                                                            <div id="logo">
                                                                <p><img style=" width: 40px; height: 40px;" src="http://localhost:5555/bookeve-api/events_content/logo.png" /></p>
                                                                <p class="logoname">Bookeve</p>
                                                            </div>
                                                            <div class="info">
                                                                <h2 class="title">%s</h2>
                                                                <h3 class="user-type %s">%s</h3>
                                                                <h4 class="user-name">%s</h4>
                                                                <p class="footer">Bookeve - Tudo em eventos</p>
                                                            </div>
                                                        </div>`, evento.name, type, type, user.name);
                            });
                            data_vars.crachas = crachas;
                            template = Utils.replaceVars(template, data_vars);
                            Utils.generateHtml(template, destination, function (err) {
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
        getEventUsersCertificates: function (req, res) {
            var params = req.params;
            var queryString = req.query;
            var options = {
                where: {
                    id: params.id
                }
            };
            var through = {};
            through.where = {
                deleted: 0,
                participated: 1
            }
            if(queryString.userId){
                through.where.userId = queryString.userId;
            }
            models.Events.findOne(options).then(function (evento) {
                if (evento) {
                    evento = evento.dataValues;
                    var options = {
                        include: {
                            model: models.Events,
                            where: {
                                id: evento.id
                            },
                            through: through,
                            order: [
                                ['name', 'ASC']
                            ]
                        }
                    }
                    models.Users.findAll(options).then(function (users) {
                        if (users.length) {
                            // obtem o template do email de comunicados.
                            var template = Utils.getMailTemplate(Mails.EVENTO_PARTICIPANTES_CERTIFICADOS);
                            var filename = 'certificados.html';
                            var destination = Utils.sprintf('./events_content/%s/%s', evento.id, filename);
                            var data_vars = {};
                            var date = Utils.getDateFormat(evento.dateIni).split(' ')[0];
                            var city = Utils.sprintf('%s-%s', evento.city, evento.state);
                            var certificados = '';
                            users.forEach(function (user, i) {
                                certificados += Utils.sprintf(`<div class="certificado">
                                                                <p class="title-g">CERTIFICADO</p>
                                                                <h1 class="title">%s</h1>
                                                                <div class="content">
                                                                    Certificamos que o(a) participante <strong>%s</strong> esteve presente no evento
                                                                    "%s".
                                                                </div>
                                                                <p class="date">%s, %s</p>
                                                            </div>
                                                            <div style="page-break-after: always;"></div>`, evento.name, user.name, evento.name, city, date);
                            });
                            data_vars.certificates = certificados;
                            template = Utils.replaceVars(template, data_vars);
                            Utils.generateHtml(template, destination, function (err) {
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
                        } else {
                            throw 'Não há nenhum certificado para emitir!';
                        }
                    }).catch(function (err) {
                        res.send(Utils.setResponse(err));
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
