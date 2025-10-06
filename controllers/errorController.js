const AppError = require('./../utils/appError.js')

const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}.`
    return new AppError(message, 400);
}

const handleDuplicateFieldsDB = err => {
    // const value = err.errmsg.match(/(["'])(\\?.)*?\1/);
    
    const value = err.keyValue.name
    console.log('err.keyValue.name  ', value);

    const message = `Duplicate field value: ${value}. please use another value`
    return new AppError(message, 400);
}  

const handleValidationErrorDB = err => {
const errors = Object.values(err.errors).map(el => el.message);
const message = `Invalid input data. ${errors.join('. ')}`;
return new AppError(message, 400);
}

const handleJWTError = error => new AppError('Invalid token. please log in again!', 401)

const handleJWTExpiredError = error => new AppError('Your token has expired! Please log in again', 401);

const sendErrorDev = (err, req, res) => {
    //A) API
    if(req.originalUrl.startsWith('/api')) {
        return res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
    });
    }

    //B) RENDERED WEBSITE
    console.log('ERROR', err);
        return res.status(err.statusCode).render('error', {
            title: 'Something went wrong!',
            msg: err.message
        });
};

const sendErrorProd = (err, req, res) => {
    // A) API
    if(req.originalUrl.startsWith('/api')) {
        // A) Operational, trusted error: send message to client
            if (err.isOperational) {
                return res.status(err.statusCode).json({
                    status: err.status,
                    // error: err,
                    message: err.message
                });
            }
            // B) Programming or other unknown error: don't leak error details
                //1) Log error
                console.log(err);

                //2) Send generic message
                return res.status(500).json({
                    status: 'error',
                    // error: err,
                    message: 'Something went very wrong!'
                });
     }
        // B) RENDERED WEBSITE
        // A) Operational, trusted error: send message to client
         if (err.isOperational) {
            return res.status(err.statusCode).render('error', {
            title: 'Something went wrong!',
            msg: err.message
        });
            }
                // B) Programming or other unknown error: don't leak error details
                //1) Log error
                console.log('ERROR', err);

                //2) Send generic message
                return res.status(err.statusCode).render('error', {
                title: 'Something went wrong!',
                msg: 'Please try again later.'
        });
};

module.exports = (err, req, res, next) => {

    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    
    
    if(process.env.NODE_ENV === 'development'){
       
        sendErrorDev(err, req, res);

    } else if(process.env.NODE_ENV === 'production'){
        // let error = { ...err }
        // console.log(error);
        if(err.name === 'CastError') err = handleCastErrorDB(err);
        if(err.code === 11000) err = handleDuplicateFieldsDB(err);
        if(err.name === 'ValidationError') err = handleValidationErrorDB(err);
        if(err.name === "JsonWebTokenError") err = handleJWTError(err);
        if(err.name === "TokenExpiredError") err = handleJWTExpiredError(err);
        sendErrorProd(err, req, res);
    }
}
