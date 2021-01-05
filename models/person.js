const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

// eslint-disable-next-line no-undef
const url = process.env.MONGODB_URI

// eslint-disable-next-line no-console
console.log('connecting to', url)

// eslint-disable-next-line max-len
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
    .then(() => {
        // eslint-disable-next-line no-console
        console.log('connected to MongoDB')
    })
    .catch((error) => {
        // eslint-disable-next-line no-console
        console.log('error connecting to MongoDB:', error.message)
    })

const personSchema = new mongoose.Schema({
    name: {
        type: String,
        minlength: 3,
        required: true,
        unique: true,
    },
    number: {
        type: String,
        minlength: 8,
        required: true,
    },
})
personSchema.plugin(uniqueValidator, { message: '{VALUE} is already on the list.' })

personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = mongoose.model('Person', personSchema)