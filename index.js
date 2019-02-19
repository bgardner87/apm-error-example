const ElasticAPM = require('elastic-apm-node');
const config = require('./config');

const apm = ElasticAPM.start({
    serviceName: config.apmService,
  
    secretToken: config.apmToken,
  
    serverUrl: config.apmUrl,
    captureBody: 'all',
    logLevel: 'info',
    active: config.apmEnabled
});

const Elasticsearch = require('elasticsearch');
const Hapi = require('hapi');

const elasticConfig = {
    host: [
        {
            host: config.elasticHost,
            auth: config.elasticAuth,
            protocol: config.elasticProtocol,
            port: config.elasticPort
        }
    ],
    log: 'error',
    requestTimeout: 60000
};

const server=Hapi.server({
    host: 'localhost',
    port: 3000
});

server.route({
    method:'GET',
    path:'/',
    handler: async function(request,h) {
        console.log('creating client');
        const client = new Elasticsearch.Client({...elasticConfig});

        try {
            console.log('querying');
            const queryResult = await client.get({
                index: 'apm_test',
                type: '_doc',
                id: '12'
            });

            console.log('returning');
            console.log(queryResult);

            return queryResult._source;
        } catch (err) {
            console.log('error');
            console.log(err);
            return 'failed';
        }
    }
});

const start = async function() {

    try {
        console.log('starting');
        await server.start();
    }
    catch (err) {
        console.log(err);
        process.exit(1);
    }

    console.log('Server running at:', server.info.uri);
};

start();
