const { Client } = require('@elastic/elasticsearch')
const dotenv = require('dotenv');
const fs = require('fs');
dotenv.config();

class ElasticClient {

    #client;

    constructor() {
        this.client = new Client({
            node: 'https://localhost:9200',
            auth: {
                username: 'elastic',
                password: process.env.ELASTIC_PASSWORD
            },
            tls: {
                rejectUnauthorized: false,
                ca: fs.readFileSync('./http_ca.crt'),
            }
        })
    }

    async indexDocument(index, id, doc) {
        await this.client.index({
            index: index,
            id: id,
            document: doc,
        })
    }
}

module.exports = ElasticClient;