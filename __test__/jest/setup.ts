const { Server } = require("../../src/Server");

module.exports = async () => {
    Object.defineProperty(global, "__closeServer__", {
        value: Server.close
    });
    await Server.init();
};
