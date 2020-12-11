const bodyParser = require('body-parser')
const app = require('express')()

app.use(bodyParser.json())
app.all('/data', (req, res) => {
  res.json({ data: 'data' })
})

/*** API Routes ***/
const routes = require('./routes')

app.use('/', routes)

module.exports = app