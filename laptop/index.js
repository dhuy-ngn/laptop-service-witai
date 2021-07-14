'use strict';

const MAX_CONFIDENCE = 0.8;
const request = require('request');
const createResponse = require('./createResponse');

const extractIntent = nlp => {
    let intent = nlp.intents && nlp.intents[0];
    if (intent && intent.confidence > MAX_CONFIDENCE) {
        return intent.name;
    } else {
        return null;
    }
}

const extractEntity = (nlp, entityValue) => {
    let entity = nlp.entities[entityValue] && nlp.entities[entityValue][0];
    if (entity && entity.confidence > MAX_CONFIDENCE) {
        return entity.value;
    } else {
        return null;
    }
}

const extractPriceEntity = nlp => {
    let entity = nlp.entities['wit$amount_of_money:amount_of_money'] && nlp.entities['wit$amount_of_money:amount_of_money'][0];
    if (entity && entity.confidence > MAX_CONFIDENCE) {
        if (entity.type === 'value') {
            return entity.value;
        } else if (entity.type === 'interval') {
            let from = !entity.from ? 0 : entity.from.value;
            let to = !entity.to ? 9999 : entity.to.value;

            return [from, to];
        }
    }
    return null;
}

const getLaptopData = (laptopQuery) => {
    let qs = laptopQuery;
    console.log(qs);

    return new Promise((resolve, reject) => {
        request({
            uri: 'http://localhost:3000/laptop',
            qs,
        }, (error, response, body) => {
            if (!error && response.statusCode === 200) {
                let data = JSON.parse(body);
                resolve(data[0]);
            } else {
                reject(error);
            }
        })
    })

}



module.exports = nlpData => {
    return new Promise(async (resolve, reject) => {
        let intent = extractIntent(nlpData);

        if (intent) {
            let name = extractEntity(nlpData, 'name:name');
            let ram = extractEntity(nlpData, 'ram:ram');
            let memory = extractEntity(nlpData, 'memory:memory');
            let cpu = extractEntity(nlpData, 'cpu:cpu');
            let gpu = extractEntity(nlpData, 'gpu:gpu');
            let price = extractPriceEntity(nlpData);

            let laptop = {
                ...name && { "name": name },
                ...ram && { "ram": ram },
                ...memory && { "memory": memory },
                ...cpu && { "cpu": cpu },
                ...gpu && { "gpu": gpu },
                ...price && { "price": price }
            }

            try {
                let laptopData = await getLaptopData(laptop);
                laptopData ? console.log("Laptop data: \n", laptopData) : console.log("No laptop found");
                let response = createResponse(intent, laptopData);
                resolve(response);
            } catch (error) {
                reject(error);
            }
        } else {
            resolve({
                txt: "I'm not sure what you meant. Can you rephrase it for me?"
            })
        }
        resolve(intent);
    })
}