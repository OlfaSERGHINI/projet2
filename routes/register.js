const okta = require('@okta/okta-sdk-nodejs');
const express = require('express');
const router = express.Router();
const winston = require('winston');
const moment = require('moment');
const fetch = require('node-fetch');
const staticUrl = 'http://static.canal-plus.net/apps/mycanal/prod/api/pass-zone-parameters.json';
const location = require("underscore");
const client = new okta.Client({
  orgUrl: process.env.ORG_URL,
  token: process.env.REGISTRATION_TOKEN
});
let settings = { method: "Get" };
  var options = {
    file: {
      level: 'info',
      name: 'file.info',
      filename: `${__dirname}/logs/history.log`,
      handleExceptions: true,
      json: true,
      maxsize: 5242880, // 5MB
      maxFiles: 100,
      colorize: true,
    },
    errorFile: {
      level: 'error',
      name: 'file.error',
      filename: `${__dirname }/logs/error.log`,
      handleExceptions: true,
      json: true,
      maxsize: 5242880, // 5MB
      maxFiles: 100,
      colorize: true,
    },
    console: {
      level: 'debug',
      handleExceptions: true,
      json: false,
      colorize: true,
    }
  };
let logFile = winston.createLogger({
  transports: [
    new (winston.transports.Console)(options.console),
    new (winston.transports.File)(options.errorFile),
    new (winston.transports.File)(options.file),
  ],
  exitOnError: false, // do not exit on handled exceptions
})
let web_json_data;
let app_locationData={
  form:{}
}
fetch(staticUrl, settings)
  .then(res => res.json())
  .then((json) => {
    web_json_data=json
  });
router.post('/', async (req, res, next) => {
  try {
    await client.createUser({
      profile: {
        firstName: req.body.prenom,
        lastName: req.body.nom,
        email: req.body.email,
        login: req.body.email,
        gender:req.body.genre,
        zipCode:req.body.cp,
        customerNumber:req.body.numcli,
        TrackPubNameAPI:'true',
        suscriberId:req.body.numcli,
      },
      credentials: {
        password: {
          value: req.body.mdp,
        },
      },
    }).then(user => {
      logFile.info(moment().format('YYYY-MM-DD-HH-mm-ss-ms'));
      console.log('Created', app_locationData);
      res.status(200).send({
        result: 'return',
        message: '200',
      });
    })
  } catch ({ errorCauses }) {
    logFile.info(moment().format('YYYY-MM-DD-HH-mm-ss-ms'));
    const errors = errorCauses.reduce((summary, { errorSummary }) => {
      if (/Password/.test(errorSummary)) {
        return Object.assign({ password: errorSummary })
      }
      const [ field, error ] = /^(.+?): (.+)$/.exec(errorSummary)
      return Object.assign({ [field]: error }, summary)
    }, {})

    console.log(errors)
    res.status(400).send({
      result: 'return',
      message: '400',
      data:errors
    });
  }
});
module.exports = router
