const request = require("supertest");
const {expect, afterEach} = require('@jest/globals');
const { createTestScheduler } = require("@jest/core");

let req = request('http://localhost:3000');
let tempId;
let res;
afterEach(function () {
    res = null;
});

describe("3 scripts", () => {
    test('should POST new person and return new created in db', async () => {
        res = await req
        .post('/person')
        .set('Accept', 'application/json')
        .send({ name: "David", age: 21, hobbies: []});
        expect(res.statusCode).toBe(201);
        tempId = JSON.parse(res.text).id;
        expect(JSON.parse(res.text).id).toBeDefined();
        expect(JSON.parse(res.text).name).toBe("David");
    });
    test('should DELETE new person and return 204', async () => {
        res = await req
        .delete(`/person/${tempId}`);
        expect(res.statusCode).toBe(204);
    });
    test('Try PUT deleted person, should return 404 and not found', async () => {
        res = await req
        .get(`/person/${tempId}`);
        expect(res.statusCode).toBe(404);
        expect(res.text).toBe('PersonId not found');
    });

});
