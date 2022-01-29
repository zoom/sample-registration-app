import axios from 'axios'
import express from 'express'
import createError from 'http-errors'
import {param, body, validationResult} from 'express-validator'

import Registrant from '../models/registrant.js'

const router = express.Router()

/**
 * Calls the Zoom Get a Webinar API with the provided ID
 * @see Get a Webinar API https://marketplace.zoom.us/docs/api-reference/zoom-api/webinars/webinar
 * @param {string} id - ID of the webinar to get
 * @returns {Promise<any>}
 */
function getWebinar(id) {
    return axios.get(`/webinars/${id}`)
        .then(({data}) => Promise.resolve(data))
}

/**
 * Calls the Zoom Add Webinar Registrant API with the provided ID and Registrant
 * @see https://marketplace.zoom.us/docs/api-reference/zoom-api/webinars/webinarregistrantcreate
 * @param {string} id - ID of the webinar
 * @param {Object} reg - registrant object to POST
 * @returns {Promise}
 */

function addWebinarRegistrant(id, reg) {
    return axios.post(`/webinars/${id}/registrants`, reg)
        .then(({data}) => Promise.resolve(data))
}

/**
 * Passes errors to the error handler route
 * @param {Error} e - error object can be from axios or created manually using e.code and e.message
 */
function handleError(e) {
    const res = e.response
    let status = e.code
    let data = e.message

    if (res) {
        if (res.status)
            status = res.status
        if (res.data)
            data = res.data
    }

    return createError(status, data)
}

/**
 * sanitize returns an error if the request did not pass validation
 * @param {Request} req - HTTP request to operate on
 */
function sanitize(req) {
    return new Promise((resolve, reject) => {
        const errors = validationResult(req)

        if (errors.isEmpty())
            resolve()

        const {msg} = errors.array({onlyFirstError: true})[0]
        const e = new Error(msg)
        e.code = 400

        reject(e)
    })
}

// Validate the webinar id provided
const validateID = param('id')
    .isLength({min: 11, max: 11})
    .withMessage('Webinar ID must be 11 digits long')
    .isNumeric()
    .withMessage('Webinar ID must be numeric')


/*
 * POST registrant data
 * ---- Call the Zoom Get a Webinar API to fetch details about the provided Webinar ID
 */
router.get('/:id', validateID, async (req, res, next) => {
    try {
        // validate id parameter
        await sanitize(req)
        const {id} = req.params

        // generate a new JWT token and apply it to the auth header
        req.app.locals.configureAuth()

        // make a request to the Get a Webinar API
        const webinar = await getWebinar(id)
        const {topic, settings, start_time: startTime} = webinar

        // if approval_type is 2 registration is not required
        if (settings.approval_type === 2) {
            const e = new Error(`Webinar ${id} does not require registration (approval_type=2)`)
            e.code = 400
            return next(handleError(e))
        }

        // render data in the registration page
        return res.render('registration', {
            id,
            topic,
            cardTitle: topic,
            startTime,
            title: `Register for ${topic}`,
        })
    } catch (e) {
        return next(handleError(e))
    }
})

// Validate the input used to register a user
const validateRegistration = [
    validateID,
    body('fname')
        .isLength({min: 1, max: 64})
        .withMessage('First Name cannot be blank and must have <= 64 characters')
        .trim(),
    body('lname')
        .isLength({max: 64})
        .withMessage('Last Name must have <= 64 characters')
        .trim(),
    body('email')
        .isEmail()
        .withMessage('Email is not a valid email address')
        .isLength({min: 6, max: 128})
        .withMessage('Email must be >= 6 characters and <= 128 characters')
]

/*
 * POST registrant data
 * ---- Call the Zoom Add Webinar Registrant API to create a new user
 */
router.post('/:id', validateRegistration, async (req, res, next) => {
    try {
        let registrant

        // validate URL param and request body
        await sanitize(req)

        const {id} = req.params
        const {fname, lname, email} = req.body

        const query = {
            id,
            fname,
            lname,
            email
        }

        // if this registrant exists, return the cached data from our DB
        const exists = await Registrant.exists(query)

        if (exists) {
            registrant = await Registrant.findOne(query)
        } else {
            // generate a new JWT token and apply it to the auth header
            req.app.locals.configureAuth()

            // make a request to the Add a Webinar Registrant API
            const data = await addWebinarRegistrant(id, {
                email,
                first_name: fname,
                last_name: lname,
            })

            registrant = new Registrant({
                ...query,
                topic: data.topic,
                joinURL: data.join_url,
                startTime: data.start_time,
                registrantId: data.registrant_id,
            })

            // save the new registrant in our DB
            await registrant.save()
        }

        const {topic, startTime, joinURL} = registrant

        // 🎉 success! 🎉 let the user know they're registered
        return res.render('success', {
            id,
            topic,
            startTime,
            joinURL,
            cardTitle: topic,
            title: "You're Registered!",
        })
    } catch (e) {
        return next(handleError(e))
    }
})

export default router
