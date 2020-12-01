require('dotenv').config()
global.database = require('./database')
const express = require('express')
const path = require('path')
const cors = require('cors')
const fileUpload = require('express-fileupload')
const swaggerUi = require('swagger-ui-express')
const swaggerDocument = require('./swagger.json')

const authRouter = require('./components/auth/authRoutesConfig')
const usersRouter = require('./components/users/userRoutesConfig')

const app = express()

const i18n = require('i18n')
i18n.configure({
  locales: ['en', 'fr'],
  directory: path.join(__dirname, '/common/locales')
})
app.use(i18n.init)

app.use(cors())
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/'
}))

if (process.env.NODE_ENV === 'dev') {
  swaggerDocument.host = 'localhost:' + process.env.port
  swaggerDocument.schemes = ['http']
}

const swaggerURL = '/api-docs'
app.use(swaggerURL, swaggerUi.serve, swaggerUi.setup(swaggerDocument))
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))
app.use(express.static(path.join(__dirname, 'public')))

// SQL logger
// app.use(knexLogger);

// adding Helmet to enhance your API's security
// app.use(helmet());
// app.use('/api', headerMiddleware);
app.use('/api', usersRouter)
app.use('/api', authRouter)

app.listen(process.env.port, () => console.info(`Server listening on port ${process.env.port}!`))

if (process.env.NODE_ENV === 'dev' || process.env.NODE_ENV === 'test') {
  module.exports = app
} else {
  module.exports = { app }
}
