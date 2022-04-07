import express from 'express'
import exphbs from 'express-handlebars'
import compression from 'compression'
import createError from 'http-errors'
import {URL} from 'url'

import moment from 'moment'
import cookieParser from 'cookie-parser'
import logger from 'morgan'
import debug from 'debug'

import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

import axios from 'axios'
import axiosThrottle from 'axios-request-throttle'

import indexRouter from './server/routes/index.js'
import registrationRouter from './server/routes/registration.js'

const dbg = debug('SRA:app')
const errs = debug('SRA:errors')

dotenv.config()
const {ZM_KEY, ZM_SECRET} = process.env

/**
 * Generates a JWT token for the Zoom API
 * @see https://github.com/zoom/zoom-api-jwt
 * @see https://github.com/brandonabajelo-zoom/jwt-gen/
 * @see https://marketplace.zoom.us/docs/guides/build/jwt-app/
 * @param exp - seconds until the token expires
 * @return {string} a JWT token
 */
function generateJWT(exp = 5) {
    if (typeof exp !== 'number' || exp <= 0)
        throw createError(500, 'generateJWT(): exp parameter expected to be a number greater than 0')

    return jwt.sign({iss: ZM_KEY}, ZM_SECRET, {expiresIn: exp})
}

/**
 * Adds the provided jwt to axios auth header
 * @param {string} token - JWT that will be set in the header
 */
function setAuthHeader(token) {
    axios.defaults.headers.common.Authorization = `Bearer ${token}`
}

/* App Config */
const app = express()

axios.defaults.baseURL = 'https://api.zoom.us/v2'

// log Axios requests and responses
const logFunc = (r) => {
    if (process.env.NODE_ENV !== 'production') {
        const { method, status, url, baseURL, config } = r;

        const endp = url || config?.url;
        const base = baseURL || config?.baseURL;
        let str = new URL(endp, base).href;

        if (method) str = `${method.toUpperCase()} ${str}`;
        if (status) str = `${status} ${str}`;

        debug(`SRA:axios`)(str);
    }

    return r;
};

axios.interceptors.request.use(logFunc);
axios.interceptors.response.use(logFunc);

// throttle requests to the Zoom API so they fit within the light rate limits
axiosThrottle.use(axios, {requestsPerSecond: 30})



app.locals.generateJWT = generateJWT
app.locals.setAuthHeader = setAuthHeader
app.locals.configureAuth = () => {
    setAuthHeader(generateJWT())
}

/* View Engine Setup */
const layoutsDir = new URL('server/views', import.meta.url).pathname

const hbs = exphbs.create({
    layoutsDir,
    extname: '.hbs',
    defaultLayout: 'layout',
    helpers: {
        calendar: t => moment(t).calendar(null, {
            sameElse: 'LLL'
        })
    },
})

app.engine('.hbs', hbs.engine)
app.set('view engine', 'hbs')
app.set('views', layoutsDir);

/* Middleware */
app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(cookieParser())
app.use(logger('dev', {stream: {write: msg => dbg(msg)}}))
app.use(compression())
app.use(express.static(new URL('public', import.meta.url).pathname))

/* Routing */
app.use('/', indexRouter)
app.use('/r', registrationRouter)

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    const status = err.status || 500
    const title = `Error ${err.status}`

    // set locals, only providing error in development
    res.locals.message = err.message
    res.locals.error = req.app.get('env') === 'development' ? err : {}

    if (res.locals.error)
        errs(`${title} %s`, err.stack)

    // render the error page
    res.status(status)
    res.render('error', {
        title,
        cardTitle: title,
        cardText: err.message,
        cardClass: 'has-background-danger',
        textClass: 'has-text-white',
    })
})

// redirect users to the home page if they get a 404 route
app.get('*', (req, res) => {
    res.redirect('/')
})


export default app
