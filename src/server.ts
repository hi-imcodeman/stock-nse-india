/* eslint-disable no-console */
import express from 'express'
import http from 'http';
import swaggerUi from 'swagger-ui-express'
import { ApolloServer } from 'apollo-server-express';
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import { print } from 'graphql'
import { loadSchemaSync } from '@graphql-tools/load'
import { loadFilesSync } from '@graphql-tools/load-files'
import { mergeTypeDefs, mergeResolvers } from '@graphql-tools/merge'
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader'
import { openapiSpecification } from './swaggerDocOptions'
import path from 'path';
import { mainRouter } from './routes'
import cors from 'cors';

const app = express()
const port = process.env.PORT || 3000
const hostUrl = process.env.HOST_URL || `http://localhost:${port}`

// CORS Configuration from environment variables
// CORS_ORIGINS: Comma-separated list of allowed origins
// CORS_METHODS: Comma-separated list of allowed HTTP methods  
// CORS_HEADERS: Comma-separated list of allowed headers
// CORS_CREDENTIALS: Enable/disable credentials (default: true)

// Enable CORS for all routes
const corsOrigins = process.env.CORS_ORIGINS ? 
  process.env.CORS_ORIGINS.split(',').map(origin => origin.trim()) : 
  [];

const corsMethods = process.env.CORS_METHODS ? 
  process.env.CORS_METHODS.split(',').map(method => method.trim()) : 
  ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'];

const corsHeaders = process.env.CORS_HEADERS ? 
  process.env.CORS_HEADERS.split(',').map(header => header.trim()) : 
  ['Content-Type', 'Authorization'];

app.use(cors({
  origin: [
    ...corsOrigins,
    /^http:\/\/localhost:\d+$/,  // Allow any localhost port
    /^http:\/\/127\.0\.0\.1:\d+$/ // Allow any 127.0.0.1 port
  ],
  methods: corsMethods,
  allowedHeaders: corsHeaders,
  credentials: process.env.CORS_CREDENTIALS !== 'false'
}));

app.use(mainRouter)
app.use('/api-docs', swaggerUi.serve as any);
app.use('/api-docs', swaggerUi.setup(openapiSpecification) as any);

const loadedTypeDefs = loadSchemaSync(path.join(__dirname, './**/*.graphql'), { loaders: [new GraphQLFileLoader()] })
const loadedResolvers = loadFilesSync(path.join(__dirname, './**/*.resolver.{ts,js}'))

const typeDefs = mergeTypeDefs(loadedTypeDefs)

if (process.env.NODE_ENV === 'development') {
    console.log('\n=== GraphQL Schema Start ===\n')
    const printedTypeDefs = print(typeDefs)
    console.log(printedTypeDefs)
    console.log('\n=== GraphQL Schema End ===\n')
    
}

const resolvers = mergeResolvers(loadedResolvers)

const httpServer = http.createServer(app);

const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })]
});

server.start().then(() => {
    server.applyMiddleware({ app });
    app.listen(port, () => {
        console.log(`NseIndia App started in port ${port}`);
        console.log(`For API docs: ${hostUrl}/api-docs`);
        console.log(`Open ${hostUrl} in browser.`);
        console.log(`For graphql: ${hostUrl}${server.graphqlPath}`);
        
        // Log CORS configuration
        if (corsOrigins.length > 0) {
            console.log(`CORS Origins: ${corsOrigins.join(', ')}`);
        }
        console.log(`CORS Methods: ${corsMethods.join(', ')}`);
        console.log(`CORS Headers: ${corsHeaders.join(', ')}`);
        console.log(`CORS Credentials: ${process.env.CORS_CREDENTIALS !== 'false'}`);
    })
})
