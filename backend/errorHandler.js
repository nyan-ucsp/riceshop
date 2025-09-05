// Global error handlers for uncaught exceptions and unhandled rejections

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    
    // Check if it's a database connection error
    if (error.name && error.name.includes('Sequelize')) {
        console.error('Database connection error detected. Application will continue running.');
        // Don't exit the process for database errors
        return;
    }
    
    // For other critical errors, exit gracefully
    console.error('Critical error detected. Exiting process...');
    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    
    // Check if it's a database connection error
    if (reason && reason.name && reason.name.includes('Sequelize')) {
        console.error('Database connection error detected. Application will continue running.');
        // Don't exit the process for database errors
        return;
    }
    
    // For other critical errors, exit gracefully
    console.error('Critical promise rejection detected. Exiting process...');
    process.exit(1);
});

// Handle SIGTERM and SIGINT for graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully...');
    process.exit(0);
});

module.exports = {};
