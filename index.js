const { ApolloServer } = require('apollo-server');
const typeDefs = require('./db/schema');
const resolvers = require('./db/resolvers');
const connectDB = require('./config/db');
const jsonwebtoken = require('jsonwebtoken');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: 'variables.env' });

// conectar base de datos
connectDB();

// server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    const token = req.headers['authorization'] || '';
    if (token) {
      try {
        const usuario = jwt.verify(token.replace('Bearer ', ''), process.env.SECRETA);
        return {usuario};
      } catch (error) {
        console.log(error)
      }
    }
  }
});

// arrancar el server
server.listen().then(({ url }) => {
  console.log(`Servidor listo en la url ${url}`);
});