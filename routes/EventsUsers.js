module.exports = function (sequelize, models, Utils, Mails) {
    var EventsUsers = {
        insert: function (req, res) {
            var event = req.body.event;
            var user = req.body.user;
            var data = {
                eventId: event.id,
                userId: user.id
            };
            var where = {
                where: data
            };
            models.EventsUsers.findOne(where).then(function (inscricao) {
                var message = Utils.getMailTemplate(Mails.EVENTO_INSCRICAO_CONFIRMACAO);
                var subject = 'Inscrição confirmada no evento "event_name"';
                var to = 'felipejorgeas@gmail.com';
                var data_mail = {};
                data_mail.event_name = 'Evento de Teste';
                data_mail.user_name = 'Felipe Jorge';
                if (inscricao) {
                    var update = {
                        deleted: 0
                    };
                    models.EventsUsers.update(update, where).then(function (result) {
                        if (result) {
                            models.EventsUsers.findOne(where).then(function (inscricao) {
                                Utils.sendMail(to, subject, message, null, null, data_mail);
                                res.send(Utils.setResponse(200, inscricao));
                            });
                        } else {
                            throw 'Não foi possível cancelar sua inscrição no evento!';
                        }
                    });
                } else {
                    models.EventsUsers.create(data).then(function (result) {
                        var data = result.dataValues;
                        if (data) {
                            Utils.sendMail(to, subject, message, null, null, data_mail);
                            res.send(Utils.setResponse(200, data));
                        } else {
                            throw 'Não foi possível se inscrever neste evento';
                        }
                    });
                }
            }).catch(function (err) {
                res.send(Utils.setResponse(err));
            });
        },
        remove: function (req, res) {
            var params = req.params;
            var data = {
                id: params.id
            };
            var where = {
                where: data
            };
            var update = {
                deleted: 1
            };
            models.EventsUsers.findOne(where).then(function (inscricao) {
                if (inscricao) {
                    models.EventsUsers.update(update, where).then(function (result) {
                        if (result) {
                            models.EventsUsers.findOne(where).then(function (inscricao) {
                                var message = Utils.getMailTemplate(Mails.EVENTO_INSCRICAO_CANCELAMENTO);
                                var subject = 'Inscrição cancelada para o evento "event_name"';
                                var to = 'felipejorgeas@gmail.com';
                                var data_mail = {};
                                data_mail.event_name = 'Evento de Teste';
                                data_mail.user_name = 'Felipe Jorge';
                                Utils.sendMail(to, subject, message, null, null, data_mail);
                                res.send(Utils.setResponse(200, inscricao));
                            });
                        } else {
                            throw 'Não foi possível cancelar sua inscrição no evento!';
                        }
                    });
                } else {
                    throw 'Inscrição não encontrada!';
                }
            }).catch(function (err) {
                res.send(Utils.setResponse(err));
            });
        },
        getAll: function (req, res) {
        },
        getOne: function (req, res) {
        },
        find: function (req, res) {
            var params = req.params;
            var data = {
                eventId: params.eventId,
                userId: params.userId
            };
            models.EventsUsers.findOne({
                where: data
            }).then(function (result) {
                if (result) {
                    var data = result.dataValues;
                    res.send(Utils.setResponse(200, data));
                } else {
                    throw 'Inscrição não encontrada!';
                }
            }).catch(function (err) {
                res.send(Utils.setResponse(err));
            });
        },
    };
    return EventsUsers;
};
