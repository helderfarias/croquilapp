'use strict';

import { EventEmitter } from 'events';
import Dispatcher from '../Dispatcher';
import Eventos from '../configs/Eventos';
import MarkupService from '../services/MarkupService';

class MarkupStore extends EventEmitter {

    constructor(props) {
        super(props);
        this.erros = null;
        this.markups = [];
        this.markup = { incidentes: [] };
    }

    emitChange() {
        this.emit('change');
    }

    addChangeListener(callback) {
        this.on('change', callback);
    }

    removeChangeListener(callback) {
        this.removeListener('change', callback);
    }

    getErros() {
        return this.erros;
    }

    getMarkups() {
        return this.markups;
    }

    getMarkup() {
        return this.markup;
    }

    consultar(callback) {
        const that = this;

        MarkupService.consultar().then((markups) => {
            that.markups = markups;
            callback();
        });
    }

    incluirIncidente(markup, incidente, callback) {
        const that = this;
        this.markup = markup;
        this.erros = null;

        if (isNaN(incidente.valor)) {
            that.erros = 'Percentual inválido';
            callback();
            return;            
        }

        let somatorio = parseFloat(incidente.valor);
        this.markup.incidentes.filter((i) => somatorio = somatorio + parseFloat(i.valor));
        if (somatorio > 100) {
            that.erros = 'Percentual ultrapassou 100%';
            callback();
            return;
        }

        let duplicacao = this.markup.incidentes.filter((i) => (i.nome === incidente.nome && i.valor === incidente.valor));
        if (duplicacao.length) {
            that.erros = 'Item duplicado';
            callback();
            return;
        }

        this.markup.incidentes.push(incidente);
        callback();
    }

}

var store = new MarkupStore();

Dispatcher.register(function(action) {
    switch (action.actionType) {
        case Eventos.Markup.LISTAR:
            store.consultar(() => store.emitChange());
            break;

        case Eventos.Markup.INCLUIR_INCIDENTE:
            store.incluirIncidente(action.markup, action.incidente, () => store.emitChange());
            break;

        default:
            return true;
    }
});

module.exports = store;
