import mongoose  from 'mongoose'

const {Schema} = mongoose;
const registrantSchema = new Schema({
    id: String,
    fname: String,
    lname: String,
    email: String,
    topic: String,
    joinURL: String,
    startTime: Date,
    registrantId: String
})

const Registrant = mongoose.model('Registrant', registrantSchema)

export default Registrant
