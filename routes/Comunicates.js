module.exports = function (sequelize, models, Utils, async, Mails) {
    var Comunicates = {
        eventoId: 0,
        comunicado: '',
        send: function (req, res) {
            Comunicates.eventoId = req.body.eventId;
            Comunicates.comunicado = req.body.comunicado;

            async.parallel({
                event: Comunicates.getEvent,
                users: Comunicates.getEventUsers,
            }, function (err, result) {
                var event = result.event;
                var users = result.users;

                var subject = 'Comunicado sobre o evento "event_name"';
                var to = '';
                var data_mail = {};

                // obtem o template do email de comunicados.
                var message = Utils.getMailTemplate(Mails.EVENTO_COMUNICADO);

                // seta o comunicado informado pelo organizador.
                data_mail.event_comunicate = Comunicates.comunicado;

                // busca os dados do evento.
                data_mail.event_name = event.name;

                // envia o email com o comunicado para cada participante.
                users.forEach(function (user) {
                    data_mail.user_name = user.name;
                    to = user.email;
                    Utils.sendMail(to, subject, message, null, null, data_mail);
                });
                res.send(Utils.setResponse(200, []));
            });
        },
        getEvent: function (callback) {
            var where = {
                where: {
                    id: Comunicates.eventoId
                }
            };
            models.Events.findOne(where).then(function (evento) {
                if (evento) {
                    evento = evento.dataValues;
                    callback(null, evento);
                } else {
                    callback(err);
                }
            });
        },
        getEventUsers: function (callback) {
            var options = {
                include: { model: models.Events, where: { id: Comunicates.eventoId } },
            }
            models.Users.findAll(options).then(function (users) {
                if (users) {
                    callback(null, users);
                } else {
                    callback(err);
                }
            });
        }
    };
    return Comunicates;
};
