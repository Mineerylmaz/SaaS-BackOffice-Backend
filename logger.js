const { createLogger, format, transports } = require('winston');
const chalk = require('chalk');

const customFormat = format.printf(({ level, message, timestamp }) => {
    let levelColor;

    switch (level) {
        case 'info':
            levelColor = chalk.magenta(level);
            break;
        case 'warn':
            levelColor = chalk.red(level);
            break;
        case 'error':
            levelColor = chalk.magentaBright(level);
            break;
        default:
            levelColor = chalk.white(level);
    }

    return `${chalk.gray(timestamp)} [${levelColor}] ${message}`;
});

const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        customFormat
    ),
    transports: [
        new transports.Console(),
        new transports.File({ filename: 'logs/error.log', level: 'error' }),
        new transports.File({ filename: 'logs/combined.log' })
    ]
});

module.exports = logger;
