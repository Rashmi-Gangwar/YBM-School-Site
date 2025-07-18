class ErrorHandler extends Error {
    constructor(message, statusCode){
        super(message);
        this.statusCode = statusCode;
    }
}

export const errorMiddleware = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
console.log(err);
    if(err.name === "CastError") {
        const message = `Invalid ${err.path}`;
        err = new ErrorHandler(message, 400);
    }
    if (err.name === "JsonWebTokenError") {
        const message = `Json Web Token is Invalid, Try Again.`;
        err = new ErrorHandler(message, 400);
    }
    if (err.name === "TokenExpireError") {
        const message = `Json Web Token is Expired, Try Again.`;
        err = new ErrorHandler(message, 400);
    }
    if (err.name === 11000) {
        const message = `Duplicate ${Object.keys(err.keyValue)} Entered`;
        err = new ErrorHandler(message, 400);
    }
    return res.status(err.statusCode).json ({
        success: false,
        message: err.message,
    });
};

export default ErrorHandler;