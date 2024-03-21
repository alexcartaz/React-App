'use strict';

// load modules
const express = require('express');
const morgan = require('morgan');

// load routes
const routes = require('./routes');
const { sequelize } = require('./models');

// variable to enable global error logging
const enableGlobalErrorLogging = process.env.ENABLE_GLOBAL_ERROR_LOGGING === 'true';

// create the Express app
const app = express();

// setup morgan which gives us http request logging
app.use(morgan('dev'));

// friendly 'test welcome' message on app load (note: this is just a backend)
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the REST API project!',
  });
});

// this is express middleware, when a request comes in, it will be sent through this function before it hits one of our route handlers
// this middleware tells express we are expecting requests to come in as json
app.use(express.json());

// all our backend routes are setup as part of the API and stem from that root
app.use('/api', routes);

// send 404 if no other route matched
app.use((req, res) => {
  res.status(404).json({
    message: 'Page Not Found',
  });
});

// setup a global error handler
app.use((err, req, res, next) => {
  if (enableGlobalErrorLogging) {
    console.error(`Global error handler: ${JSON.stringify(err.stack)}`);
  }
  res.status(err.status || 500).json({
    message: err.message,
    error: {},
  });
});

// set our port
app.set('port', process.env.PORT || 5000);

// test the database connection
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully');
  } catch (error) {
    console.error('Unable to connect to the database: ', error);
  }
})();

// sequelize model synchronization, then start app
sequelize.sync()
  .then(() => {
    const server = app.listen(app.get('port'), () => {
      console.log(`Express server is listening on port ${server.address().port}`);
    });
});