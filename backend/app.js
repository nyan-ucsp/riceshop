// Load error handlers first
require('./errorHandler');

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const apiRouter = require('./routes/api');
const { handleDatabaseError } = require('./middleware/dbErrorHandler');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());

// Handle favicon.ico requests
app.get('/favicon.ico', (req, res) => {
    res.status(204).end();
});

// Health check endpoint
app.get('/health', async (req, res) => {
    const { checkDatabaseHealth } = require('./middleware/dbErrorHandler');
    const dbHealth = await checkDatabaseHealth();
    
    const status = dbHealth.status === 'healthy' ? 200 : 503;
    res.status(status).json({
        status: dbHealth.status === 'healthy' ? 'ok' : 'error',
        timestamp: new Date().toISOString(),
        database: dbHealth,
        uptime: process.uptime()
    });
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api', apiRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    res.status(404).json({ error: 'Not Found' });
});

// Database error handler (must be before general error handler)
app.use(handleDatabaseError);

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // return JSON error response
    res.status(err.status || 500);
    res.json({ 
        error: err.message || 'Internal Server Error',
        ...(req.app.get('env') === 'development' && { stack: err.stack })
    });
});

module.exports = app;
