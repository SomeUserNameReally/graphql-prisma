const { Server } = require("../../src/Server");

module.exports = async () => {
    if (Server.isRunning()) return;

    Object.defineProperty(global, "__closeServer__", {
        value: Server.close
    });
    await Server.init();
};
