#!/usr/bin/env node
/* eslint-disable no-console */
import { login } from '../lib/Util';

login({ oidcIssuer: 'https://solidcommunity.net/', tokenType: 'Bearer' })
  .then(session => {
    console.log(`Logged in as ${session.info.webId}`);
  })
  .catch(error => {
    console.log(error);
  });
