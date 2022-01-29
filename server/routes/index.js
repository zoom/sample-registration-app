import express from 'express'

const router = express.Router()

/* GET home page. */
router.get('/', (req, res) => {
    res.render('index', {
        title: 'Sample Registration App',
        cardTitle: 'Welcome to the Sample Registration App',
    })
})

export default router
