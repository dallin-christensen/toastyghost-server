import express from 'express'
import connectDB from './config/db'
import books from './routes/api/books'
import bodyParser from 'body-parser'
import cors from 'cors'

connectDB();

const app = express()

app.use(cors({ origin: true, credentials: true }));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())


const port = process.env.PORT || 8082;

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

app.use('/api/books', books)
