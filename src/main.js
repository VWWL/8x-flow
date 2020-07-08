import jsyaml from 'js-yaml';
import {jsonContext} from './json';
import yaml from "./yaml";
import context from './context';
import {COMMA_SEPARATED, withId} from "./utils";

export function parse(script) {
    return parseModel(jsonContext(context()), jsyaml.load(script)).result;
}

function parseModel(context, model) {
    if (model.contract) parseContract(context, withId(model, model.contract))
    else parseEvidence(context, withId(model, model.evidence))

    return context;
}

function parseContract(context, contract) {
    parseMomentInterval(context, contract, context.model.contract);
    yaml.fulfillment(contract, createFulfillment(context));
}

function parseEvidence(context, evidence) {
    parseMomentInterval(context, evidence, context.model.evidence);
}

function parseMomentInterval(context, mi, type) {
    type(mi.id, yaml.desc(mi), attrs(yaml.required.timestamp(mi), yaml.data(mi)));

    yaml.details(mi, createDetails(context));
    yaml.participants(mi, createParticipant(context));
}

function createDetails(context) {
    return function (parent, declaration) {
        context.rel.details(parent, context.model.details(
            declaration.id,
            yaml.desc(declaration),
            attrs(yaml.timestamp(declaration), yaml.data(declaration))
        ));

        yaml.participants(declaration, createParticipant(context));
    }
}

function createParticipant(context) {
    return function (parent, declaration) {
        let participant = yaml.role.is(declaration.id) ?
            context.model.role(yaml.role.name(declaration.id)) : context.model.participant(declaration.id);

        context.rel.participant(parent, participant);
    }
}

function createFulfillment(context) {
    function name(fulfillment, postfix) {
        return fulfillment.split(COMMA_SEPARATED).concat(postfix).join(' ');
    }

    function override(declaration, name) {
        if (!declaration) return name;
        let customized = yaml.name(declaration);
        return !customized ? name : customized;
    }

    function attr(declaration) {
        if (!declaration) return [];
        return attrs(yaml.timestamp(declaration), (yaml.data(declaration)));
    }

    return function (parent, declaration) {
        let request = context.model.fulfillmentRequest(
            override(declaration.request, name(declaration.id, 'Request')),
            yaml.desc(declaration),
            attr(declaration.request));

        if (declaration.request)
            yaml.participants(withId(declaration.request, request.id), createParticipant(context));

        let confirmation = context.model.fulfillmentConfirmation(
            override(declaration.confirm, name(declaration.id, 'Confirmation')),
            declaration.confirm ? yaml.variform(declaration.confirm) : false,
            attr(declaration.confirm));

        if (declaration.confirm)
            yaml.participants(withId(declaration.confirm, confirmation.id), createParticipant(context));

        context.rel.fulfillment(parent, request);
        context.rel.confirmation(request, confirmation);
    }
}

function attrs(...attributes) {
    return attributes.reduce((acc, cur) => acc.concat(cur));
}



