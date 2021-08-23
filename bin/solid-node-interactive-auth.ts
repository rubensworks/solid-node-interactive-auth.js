#!/usr/bin/env node
/* eslint-disable no-console */
import { interactiveLogin } from '../lib/Util';

const idp = process.argv.length > 2 ? process.argv[2] : 'https://solidcommunity.net/';

interactiveLogin({ oidcIssuer: idp })
  .then(session => {
    console.log(`Logged in as ${session.info.webId}`);
    return session.logout();
  })
  .catch(error => {
    console.log(error);
  });
