import {describe, expect, test} from "@jest/globals";

import {parse} from "../../src/main";
import {yml} from '../utils'

describe('Contract Declaration', () => {
    test('should be linked to participant', () => {
        for (let file of ['with-participants', 'with-participants-map', 'with-participants-list-map']) {
            let result = parse(yml(`contract/participants/${file}`));

            expect(result.relationships.length).toBe(1);
            expect(result.relationships[0].source).toBe('Order');
            expect(result.relationships[0].target).toBe('Shop');
            expect(result.relationships[0].type).toBe('participant');
        }
    });

    test('should throw exception if malformed participant declaration', () => {
        expect(() => parse(yml('contract/participants/with-malformed'))).toThrow('Order has malformed participants declaration');
    });

    test('should create participants along the way', () => {
        for (let file of ['with-participants', 'with-participants-map', 'with-participants-list-map']) {
            let result = parse(yml(`contract/participants/${file}`));

            expect(result.models.length).toBe(2);

            expect(result.models[1].id).toBe('Shop');
            expect(result.models[1].archetype).toBe('participant');
        }
    });

    test('should create role along the way', ()=>{
        let result = parse(yml(`contract/participants/with-role`));

        expect(result.models.length).toBe(2);

        expect(result.models[1].id).toBe('Buyer');
        expect(result.models[1].archetype).toBe('role');

    });
});
