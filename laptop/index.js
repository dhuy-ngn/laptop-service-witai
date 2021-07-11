'use strict';

const MAX_CONFIDENCE = 0.7;
const request = require('request');

const extractEntity = (nlp, entity) => {
    let obj = nlp[entity] && nlp[entity][0];
    console.log(obj);
    if (obj && obj.confidence > MAX_CONFIDENCE) {
        return obj;
    } else {
        console.log("Cannot extract entities.")
    }
}

module.exports = nlpEntities => {
    return new Promise((resolve, reject) => {
        let intent = extractEntity(nlpEntities, 'intent');
        resolve(intent);
    })
}