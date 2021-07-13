'use strict';
// create an API server
const Restify = require('restify');
const server = Restify.createServer({
	name: 'LaptopService'
});
const PORT = process.env.PORT || 3000;
const laptop = require('./laptop');

server.use(Restify.jsonp());

// MongoDB config
const mongoClient = require("mongodb").MongoClient;
const objectId = require("mongodb").ObjectID;
const CONNECTION_URL = "mongodb+srv://admin:admin@da1.1gkkk.mongodb.net/laptop_info.laptop?retryWrites=true&w=majority";
const DATABASE_NAME = "laptop_info";
var database, collection;

// Tokens
const config = require('./config');

// FBeamer
const FBeamer = require('./fbeamer');
const f = new FBeamer(config.FB);

// Register the webhooks
server.get('/', (req, res, next) => {
	f.registerHook(req, res);
	return next();
});

// Receive all incoming messages
server.post('/',
	(req, res, next) => f.verifySignature(req, res, next),
	Restify.bodyParser(),
	(req, res, next) => {
		f.incoming(req, res, msg => {
			// Process messages
			const {
				message,
				sender
			} = msg;
			console.log(msg);

			if (message.text && message.nlp.entities) {
				// If a text message is received, use f.txt or f.img to send text/image back.
				f.txt(sender, `You just said ${message.text}`);
				console.log("Intents: \n", message.nlp.intents);
				console.log("Entities: \n", message.nlp.entities);

				laptop(message.nlp)
					.then(response => {
						console.log(response);
					})
					.catch(err => {
						console.log(err);
						f.txt(sender, 'My servers are acting up. Do check back later...');
					})
			}
		});
		return next();
	});

// Subscribe
f.subscribe();

server.listen(PORT, () => {
	mongoClient.connect(CONNECTION_URL, { useNewUrlParser: true }, (error, client) => {
		if (error) {
			throw error;
		}
		database = client.db(DATABASE_NAME);
		collection = database.collection("laptop");
		console.log("Connected to `" + DATABASE_NAME + "`!");
	});
	console.log(`Laptop Service running on port ${PORT}`)
});

// Get all laptop info
server.use(Restify.plugins.queryParser());
server.get("/laptop/", (request, response) => {
	let query = request.query || {};
	console.log("Query: ", request.query);

	// querying
	collection.find({
		...query.name && { "name": { $regex: query.name, $options: "i" } },
		...query.price && { "price": query.price },
		...query.cpu && { "cpu": { $regex: query.cpu, $options: "i" } },
		...query.gpu && { "gpu": { $regex: query.gpu, $options: "i" } },
		...query.ram && { "ram": query.ram.toString() },
		...query.memory && { "memory": query.memory.toString() },
	}).toArray((error, result) => {
		if (error) {
			return response.status(500).send(error);
		}
		response.send(result);
	});
});

// Get laptop info by its ID
server.get("/laptop/:id", (request, response) => {
	collection.findOne({ "_id": new objectId(request.params.id) }, (error, result) => {
		if (error) {
			return response.status(500).send(error);
		}
		response.send(result);
	});
});