module.exports = async () => {
    // We could try to create definition
    // files, but I won't do that here.
    await (global as any).__closeServer__();
};
