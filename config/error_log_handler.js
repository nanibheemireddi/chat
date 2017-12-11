/*access logs using morgan*/
global.morgan = require('morgan')
var accessLogStream = fs.createWriteStream('./logs/access.log', {flags: 'a'})
// var errorLogStream = fs.createWriteStream('./logs/error.log', {flags: 'a'})
app.use(morgan('combined', {stream: accessLogStream}))
if(process.env.CONSOLE_ERROR_LOG == "true"){
    app.use(morgan('dev'));
}
var logger = morgan(':id :method :url :response-time')

if(process.env.WINSON_ERROR_LOG == "true"){
    /*error logs using winston*/
    global.winston = require('winston');
     winston.configure({
        transports: [
          new (winston.transports.File)({ 
                filename: './logs/error.log',
                // formatter: errorLogFormatter,
                timestamp: true,
                json: false 
            })
        ],
        exceptionHandlers: [
            new winston.transports.File({ 
                prettyPrint: true,
                // level: 'error',
                humanReadableUnhandledException: true,
                // handleExceptions: true,
                timestamp: false,
                filename: './logs/error.log',
                formatter: errorLogFormatter,
                json: false
            })
        ]
      });
    function errorLogFormatter(args) {
        var timeStamp = new Date();
        
        // app.use(morgan('combined', {stream: errorLogStream}))

        var formattedArgs = JSON.stringify(args.meta)+'\ntimeStamp : '+timeStamp+'\n-----------------------------\n';
        return formattedArgs;
    }
}


