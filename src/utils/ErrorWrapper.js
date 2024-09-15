const ErrorWrapper = function (cb) {
    return async function (req, res, next) {
        try {
            await cb(req, res, next);
        } catch (error) {
            const statusCode = error.statusCode || 500; // Fallback to 500 if statusCode is undefined
            res.status(statusCode).json({
                status: statusCode,
                message: error.message || 'An unexpected error occurred',
                success: false
            });
        }
    };
};

export default ErrorWrapper;
