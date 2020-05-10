const okta = require('@okta/okta-sdk-nodejs');
const express = require('express');
const router = express.Router();
const winston = require('winston');
const moment = require('moment');
const fetch = require('node-fetch');
const staticUrl = 'http://static.canal-plus.net/apps/mycanal/prod/api/pass-zone-parameters.json';
let settings = { method: "Get" };
let web_json_data;
fetch(staticUrl, settings)
  .then(res => res.json())
  .then((json) => {
    web_json_data=json
  });
router.post('/', async (req, res, next) => {
  let json_data=web_json_data.zones;
  res.status(200).send({
    zones:json_data
  });
});
module.exports = router
