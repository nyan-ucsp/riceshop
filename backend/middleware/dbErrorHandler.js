const { sequelize } = require('../models/index');

// Database error handler middleware
function handleDatabaseError(error, req, res, next) {
    console.error('Database Error:', error);
    
    // Check if it's a database connection error
    if (error.name === 'SequelizeConnectionError' || 
        error.name === 'SequelizeConnectionRefusedError' ||
        error.name === 'SequelizeHostNotFoundError' ||
        error.name === 'SequelizeHostNotReachableError' ||
        error.name === 'SequelizeInvalidConnectionError' ||
        error.name === 'SequelizeConnectionTimedOutError') {
        
        return res.status(503).json({
            error: 'Database service temporarily unavailable',
            message: 'Please try again later',
            code: 'DB_CONNECTION_ERROR'
        });
    }
    
    // Check for validation errors
    if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
            error: 'Validation Error',
            message: error.errors.map(e => e.message).join(', '),
            code: 'VALIDATION_ERROR'
        });
    }
    
    // Check for unique constraint errors
    if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({
            error: 'Duplicate Entry',
            message: 'This record already exists',
            code: 'DUPLICATE_ERROR'
        });
    }
    
    // Check for foreign key constraint errors
    if (error.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(400).json({
            error: 'Invalid Reference',
            message: 'Referenced record does not exist',
            code: 'FOREIGN_KEY_ERROR'
        });
    }
    
    // Generic database error
    if (error.name && error.name.startsWith('Sequelize')) {
        return res.status(500).json({
            error: 'Database Error',
            message: 'An error occurred while processing your request',
            code: 'DATABASE_ERROR'
        });
    }
    
    // Pass to next error handler if not a database error
    next(error);
}

// Database connection health check
async function checkDatabaseHealth() {
    try {
        await sequelize.authenticate();
        return { status: 'healthy', message: 'Database connection is active' };
    } catch (error) {
        return { 
            status: 'unhealthy', 
            message: 'Database connection failed',
            error: error.message 
        };
    }
}

// Wrapper for database operations with error handling
async function safeDbOperation(operation, errorMessage = 'Database operation failed') {
    try {
        return await operation();
    } catch (error) {
        console.error('Database operation error:', error);
        throw new Error(`${errorMessage}: ${error.message}`);
    }
}

module.exports = {
    handleDatabaseError,
    checkDatabaseHealth,
    safeDbOperation
};
