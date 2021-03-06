import http from 'http'
import debug from 'debug'
import mongoose from 'mongoose'
import {MongoMemoryServer} from 'mongodb-memory-server'
import app from '../app.js'

// connect to the in-memory mongodb instance
const mongod = await MongoMemoryServer.create()
await mongoose.connect(mongod.getUri())

/**
 * Normalize a port into a number, string, or false.
 * @param {String} port  - port to normalize
 * @return {Boolean|Number|*} normalized port number on success or false on failure
 */
function normalizePort(port) {
    const p = parseInt(port, 10);

    // named pipe
    if (Number.isNaN(p))
        return port

    // port number
    if (p >= 0)
        return p

    return false
}

// Get port from environment and store in Express.
const port = normalizePort(process.env.PORT || '3000')
app.set('port', port);

// Create HTTP server
const server = http.createServer(app);

// Listen on provided port, on all network interfaces
server.listen(port)

// disconnect the DB when the server closes
server.on('close', async () => mongoose.disconnect())

// let the user know we're serving
server.on('listening', () => {
    const addr = server.address();
    const bind = typeof addr === 'string'
        ? `pipe ${addr}`
        : `http://localhost:${addr.port}`;
    debug('SRA:server')(`Listening on ${bind}`)
});

// disconnect from the DB on error
server.on('error', async (error) => {
    await mongoose.disconnect()

    if (error.syscall !== 'listen')
        throw error;


    const bind = typeof port === 'string'
        ? `Pipe ${port}`
        : `Port ${port}`;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            /* eslint-disable-next-line no-console */
            console.error(`${bind} requires elevated privileges`)
            process.exit(1)
            break;
        case 'EADDRINUSE':
            /* eslint-disable-next-line no-console */
            console.error(`${bind} is already in use`)
            process.exit(1)
            break;
        default:
            throw error;
    }
});

export default app
