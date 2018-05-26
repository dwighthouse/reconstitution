module.exports = (data) => {
    if (data != null && data.constructor != null && typeof data.constructor.isBuffer === 'function' && data.constructor.isBuffer(data)) {
        return String(data);
    }

    if (_.isPlainObject(data) || _.isArray(data)) {
        return JSON.stringify(data);
    }

    return String(data);
};
