require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const bodyParser = require('body-parser')
const Person = require('./models/person')

const app = express()

morgan.token('body', function (req) {
    return JSON.stringify(req.body)
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))
app.use(cors())
app.use(express.json())
app.use(bodyParser.json())
app.use(express.static('build'))

/*
app.use(morgan(function (tokens, req, res) {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'), '-',
      tokens['response-time'](req, res), 'ms',
      JSON.stringify(req.body)
    ].join(' ')
  })
)
*/

let persons = [
    { 
        'name': 'Arto Hellas', 
        'number': '040-123456',
        'id': 1
    },
    { 
        'name': 'Ada Lovelace', 
        'number': '39-44-5323523',
        'id': 2
    },
    { 
        'name': 'Dan Abramov', 
        'number': '12-43-234345',
        'id': 3
    },
    { 
        'name': 'Mary Poppendieck', 
        'number': '39-23-6423122',
        'id': 4
    }
]

app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons.map(person => person.toJSON()))
    })
})

app.get('/info', (request, response) => {
    const count = persons.length
    response.send(
        `<p>Phonebook has info for ${count} people</p><p>${Date()}</p>`
    )
})

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
        .then(person => {
            if (person) {
                response.json(person.toJSON())
            } else {
                response.status(404).end()
            }
        })
        .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndRemove(request.params.id)
        .then(() => {
            response.status(204).end()
        })
        .catch(error => next(error))
})

  
app.post('/api/persons', (request, response, next) => {
    const body = request.body
    if (!body.name) {
        return response.status(400).json({
            error: 'Name is missing.',
        })
    } else if (!body.number) {
        return response.status(400).json({
            error: 'Number is missing.',
        })
    }

    const person = new Person({
        name: body.name,
        number: body.number
    })

    person
        .save()
        .then(savedPerson => savedPerson.toJSON())
        .then(savedAndFormattedNote => {
            response.json(savedAndFormattedNote)
        })
        .catch(error => next(error))
})

app.put('/api/persons/:id', function (request, response, next) {
    const body = request.body
    const person = {
        name: body.name,
        number: body.number
    }

    Person.schema.path('name').validate(function (value) {
        return value.length > 2
    }, 'Invalid length')

    Person.schema.path('number').validate(function (value) {
        return value.length > 7
    }, 'Invalid length')

    Person.findByIdAndUpdate(request.params.id, person, { 
        new: true,
        runValidators: true,
        context: 'query'})
        .then(updatedPerson => {
            response.json(updatedPerson.toJSON())
        })
        .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.log(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }

    next(error)
}

app.use(errorHandler)

// eslint-disable-next-line no-undef
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})