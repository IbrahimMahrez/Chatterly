
function asyncWrapper(handler) {
    return function (req, res, next) {
        Promise.resolve(handler(req, res, next)).catch(next);
    };
}

module.exports = asyncWrapper;

