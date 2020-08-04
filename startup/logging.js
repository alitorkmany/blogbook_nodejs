const winston = require('winston');

module.exports = function(){
    // logging the express route exceptions
    winston.add(new winston.transports.File({filename: 'logfile.log'}));

    // Logging unhandled promise rejection outside of express
    process.on('unhandledRejection', (ex) => {
        throw ex;
    });
}
