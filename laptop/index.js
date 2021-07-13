'use strict';

const MAX_CONFIDENCE = 0.7;
const request = require('request');

const extractEntity = (nlp, entity) => {
    let obj = nlp[entity] && nlp[entity][0];
    if (obj && obj.confidence > MAX_CONFIDENCE) {
        return obj.value;
    } else {
        return null;
    }
}

const getLaptopData = (laptop) => {
    let qs = {
        ...laptop.name && { "name": { $regex: laptop.name, $options: "i" } },
        ...laptop.price && { "price": laptop.price },
        ...laptop.cpu && { "cpu": { $regex: laptop.cpu, $options: "i" } },
        ...laptop.gpu && { "gpu": { $regex: laptop.gpu, $options: "i" } },
        ...laptop.ram && { "ram": laptop.ram.toString() },
        ...laptop.memory && { "memory": laptop.memory.toString() },
    }

    return new Promise((resolve, reject) => {
        request({
            uri: "http://localhost:3000/laptop",
            qs
        }), (error, response, body) => {
            if (!error && response.code === 200) {
                let data = JSON.parse(body);
                resolve(data.result[0]);
            } else {
                reject(error);
            }
        }
    })
}

module.exports = nlpData => {
    return new Promise((resolve, reject) => {
        let intent = extractEntity(nlpData, 'intent');
        resolve(intent);

        if (intent) {
            // let name = extractEntity(nlpData, 'name:name');
            let ram = extractEntity(nlpData, 'laptopRam');
        }
    })
}