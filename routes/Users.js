module.exports = function (sequelize, models, Utils) {
    var Users = {
        register: function (req, res) {
            var data = req.body;
            var user = {
                name: data.nome,
                email: data.email,
                pswd: Utils.md5(data.senha)
            };
            models.Users.findOne({
                where: {email: user.email}
            }).then(function (result) {
                if (result) {
                    throw 'Já existe um cadastro com este email!';
                } else {
                    sequelize.transaction(function (t) {
                        return models.Users.create(user).then(function (result) {
                            var data = result.dataValues;
                            return data;
                        });
                    }).then(function (data) {
                        if (data) {
                            delete data.pswd;
                            res.send(Utils.setResponse(200, data));
                        } else {
                            throw 'Não foi possível realizar o cadastro!';
                        }
                    }).catch(function (err) {
                        res.send(Utils.setResponse(err));
                    });
                }
            }).catch(function (err) {
                res.send(Utils.setResponse(err));
            });
        },
        getOne: function (req, res) {
            var params = req.params;
            var user = {
                id: params.id
            };
            models.Users.scope('usersOk').findOne({
                where: user
            }).then(function (result) {
                if (result) {
                    var data = result.dataValues;
                    res.send(Utils.setResponse(200, data));
                } else {
                    throw 'Usuário não encontrado!';
                }
            }).catch(function (err) {
                res.send(Utils.setResponse(err));
            });
        },
        login: function (req, res) {
            var params = req.params;
            var user = {
                email: params.email
            };
            models.Users.scope('usersOk').findOne({
                where: user
            }).then(function (result) {
                if (result) {
                    var data = result.dataValues;
                    if (data.pswd !== Utils.md5(params.pswd)) {
                        throw 'Senha incorreta!';
                    } else if (!data.active) {
                        throw 'Usuário inativo!';
                    } else {
                        delete data.pswd;
                        res.send(Utils.setResponse(200, data));
                    }
                } else {
                    throw 'Usuário não encontrado!';
                }
            }).catch(function (err) {
                res.send(Utils.setResponse(err));
            });
        },
        getAll: function (req, res) {
            var queryString = req.query;
            console.log(queryString);
            var where = {
                where: (queryString ? queryString : {})
            };
            models.Users.findAll(where).then(function (result) {
                if (result) {
                    var data = result;
                    data.map(function (item) {
                        var aux = item.dataValues;
                        delete aux.pswd;
                        return aux;
                    });
                    res.send(Utils.setResponse(200, data));
                } else {
                    res.send(Utils.setResponse(201));
                }
            }).catch(function (err) {
                res.send(Utils.setResponse(err));
            });
        },
        update: function (req, res) {
            var dataUpdate = req.body;
            var params = req.params;
            var user = {
                id: params.id
            };
            var where = {
                where: user
            };
            var update = dataUpdate;

            models.Users.scope('usersOk').findOne(where).then(function (data) {
                if (data) {
                    data = data.dataValues;
                    delete data.pswd;
                    models.Users.update(update, where).then(function (result) {
                        if (result) {
                            models.Users.findOne(where).then(function (data) {
                                res.send(Utils.setResponse(200, data));
                            });
                        } else {
                            throw 'Não foi possível atualizar os dados do usuário!';
                        }
                    });
                } else {
                    throw 'Usuário não encontrado!';
                }
            }).catch(function (err) {
                res.send(Utils.setResponse(err));
            });
        },
        remove: function (req, res) {
            var params = req.params;
            var user = {
                id: params.id
            };
            var where = {
                where: user
            };
            var update = {
                deleted: 1
            };
            models.Users.scope('usersOk').findOne(where).then(function (data) {
                if (data) {
                    data = data.dataValues;
                    delete data.pswd;
                    models.Users.update(update, where).then(function (result) {
                        if (result) {
                            models.Users.findOne(where).then(function (data) {
                                res.send(Utils.setResponse(200, data));
                            });
                        } else {
                            throw 'Não foi possível excluir o usuário!';
                        }
                    });
                } else {
                    throw 'Usuário não encontrado!';
                }
            }).catch(function (err) {
                res.send(Utils.setResponse(err));
            });
        }
    };
    return Users;
};
;