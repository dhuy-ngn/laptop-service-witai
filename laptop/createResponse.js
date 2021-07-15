'use strict';

module.exports = (intent, laptop) => {
    if (!laptop) {
        return {
            txt: `I couldn't find any laptop that suits your criteria. Please try with another one instead.`
        }
    }

    switch (intent) {
        case "laptopAvailability": {
            let str = `I have a suggestion for you, ${laptop.name}. Here is some info:
            ROM: ${laptop.memory}GB
            RAM: ${laptop.ram}GB
            CPU: ${laptop.cpu}
            GPU: ${laptop.gpu}
            Price: $${laptop.price}`.substring(0, 640);
            return {
                txt: str
            }
        }

        case "laptopRam": {
            let str = `If you are talking about ${laptop.name}, it has ${laptop.ram}GB RAM`;
            return {
                txt: str
            }
        }

        case "laptopRam": {
            let str = `If you are talking about ${laptop.name}, it has ${laptop.memory}GB ROM`;
            return {
                txt: str
            }
        }

        case "laptopCpu": {
            let str = `If you are talking about ${laptop.name}, its CPU name is ${laptop.cpu}`;
            return {
                txt: str
            }
        }

        case "laptopGpu": {
            let str = `If you are talking about ${laptop.name}, its GPU name is ${laptop.gpu}`;
            return {
                txt: str
            }
        }

        
        case "laptopPrice": {
            let str = `If you are talking about ${laptop.name}, it costs $${laptop.ram}`;
            return {
                txt: str
            }
        }

        case "laptopBuy" : {
            let str = `If I'm correct, you are making an order, right? Your order is: `;
            let sum = 0;
            laptop.forEach(_laptop => {
                sum += _laptop.quantity*_laptop.price;
                str += `\n${_laptop.quantity} x ${_laptop.name} = ${_laptop.quantity} x ${_laptop.price} = ${_laptop.quantity*_laptop.price}`
            });
            str += `\nTotal price: ${sum}`;
            return {
                txt: str
            };
        }
    }
}