import path from 'path'
import express from 'express'
import webpack from 'webpack'
import webpackDevMiddleware from 'webpack-dev-middleware'
import webpackHotMiddleware from 'webpack-hot-middleware'
import config from '../../webpack.config.js'

import bodyParser from 'body-parser'
import { decode } from 'clarity-decode'
const pgp = require('pg-promise')()
const db = pgp(`postgres://${process.env.USER}:@localhost:5432/${process.env.CLARITY_SERVER_DB_NAME}`)
import  cors from 'cors'
const app = express(),
            DIST_DIR = __dirname,
            HTML_FILE = path.join(DIST_DIR, 'index.html'),
            compiler = webpack(config)

app.use(webpackHotMiddleware(compiler))
app.use(webpackDevMiddleware(compiler, {
  publicPath: config.output.publicPath
}))

const port = 3456

const corsOptions = { credentials: true }
app.use(cors(corsOptions));

app.use(bodyParser.text())
app.use(express.static(DIST_DIR))

app.get('/', (req, res, next) => {
  compiler.outputFileSystem.readFile(HTML_FILE, (err, result) => {
    if (err) {
      return next(err)
    }
    res.set('content-type', 'text/html')
    res.send(result)
    res.end()
  })
})

app.get('/tracking_code', (_req, res) => {
  res.send('!function(c,l,a,r,i,t,y){if(a[c].v||a[c].t)return a[c]("event",c,"dup."+i.projectId);a[c].t=!0,(t=l.createElement(r)).async=!0,t.src="https://www.clarity.ms/eus-b/s/0.7.1/clarity.js",(y=l.getElementsByTagName(r)[0]).parentNode.insertBefore(t,y),a[c]("start",i),a[c].q.unshift(a[c].q.pop())}("clarity",document,window,"script",{"projectId":"f579s7kgqn","upload":"http://localhost:3456/clarity_upload","expire":365,"cookies":["_uetmsclkid","_uetvid"],"track":true,"lean":false,"content":true,"extract":[3,1,["4f509md79","zjy56jaz","4s4zm72hj"]]});')
})


app.post('/clarity_upload', cors({ origin: true}), (req, res) => {
  if(req.body.constructor === Object && Object.keys(req.body).length === 0) {
    console.log('not uploading')
    res.sendStatus(200);
  } else {
    const rawEvent = req.body;
    const decodedEvent = decode(rawEvent);
    console.log(decodedEvent)

    const cs = new pgp.helpers.ColumnSet(['timestamp', 'raw_event', 'decoded_event', 'user_id'], { table: 'clarity_events' });
    const values = [{
      timestamp: decodedEvent.timestamp,
      raw_event: JSON.stringify(rawEvent),
      decoded_event: JSON.stringify(decodedEvent),
      user_id: decodedEvent.envelope.userId
    }]
    const query = pgp.helpers.insert(values, cs);
    db.none(query);

    res.sendStatus(200);
  }
})

app.get('/db_fetch', (_req, res) => {
  db.any("SELECT * FROM clarity_events;")
  .then((data) => {
    console.log('DATA:', data)
    res.send(data)
  })
  .catch((error) => {
    console.log('ERROR:', error)
    res.sendStatus(500)
  })
})

app.get('/visualize', (_req, res, next) => {
  compiler.outputFileSystem.readFile(path.join(DIST_DIR, 'visualize.html'), (err, result) => {
    if (err) {
      return next(err)
    }
    res.set('content-type', 'text/html')
    res.send(result)
    res.end()
  })
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
