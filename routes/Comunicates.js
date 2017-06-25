module.exports = function (sequelize, models, Utils, async, Mails) {
    var Comunicates = {
        send: function (req, res) {
            var comunicado = req.body.comunicado;
            var options = {
                where: {
                    id: req.body.eventId
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
                                where: {
                                    deleted: 0
                                }
                            }
                        },
                    }
                    models.Users.findAll(options).then(function (users) {
                        if (users) {
                            var subject = 'Comunicado sobre o evento "event_name"';
                            var to = '';
                            var data_vars = {};

                            // obtem o template do email de comunicados.
                            var message = Utils.getMailTemplate(Mails.EVENTO_COMUNICADO);

                            // seta o comunicado informado pelo organizador.
                            data_vars.event_comunicate = comunicado;

                            // busca os dados do evento.
                            data_vars.event_name = evento.name;

                            // envia o email com o comunicado para cada participante.
                            users.forEach(function (user) {
                                data_vars.user_name = user.name;
                                to = user.email;
                                Utils.sendMail(to, subject, message, null, null, data_vars);
                            });
                            res.send(Utils.setResponse(200, []));
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
    return Comunicates;
};
