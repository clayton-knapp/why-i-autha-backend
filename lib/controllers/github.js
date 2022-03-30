const { Router } = require('express');
const jwt = require('jsonwebtoken');
const authenticate = require('../middleware/authenticate');
const GithubUser = require('../models/GithubUser');
const { exchangeCodeForToken, getGithubProfile } = require('../utils/github');
const fetch = require('cross-fetch');

module.exports = Router()
  .get('/login', async (req, res) => {
    // TODO: Kick-off the github oauth flow
    //redirect to github's authorization endpoint
    //order of params matters for test: client_id, scopes, redirect_uri
    res.redirect(
      `https://github.com/login/oauth/authorize?client_id=${process.env.CLIENT_ID}&scope=user&redirect_uri=http://localhost:7890/api/v1/github/login/callback`
    );
  })




  .get('/login/callback', async (req, res) => {
    
    //   TODO:
    //  * get code from the query params
    const { code } = req.query;
    console.log('CODE', code);

    //  * exchange code for token - make a fetch request
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        code,
      })
    });
    //need to parse the response
    const tokenResponse = await response.json();

    console.log('TOKEN', tokenResponse);


    //  * get info from github about user with token
    //  * get existing user if there is one
    //  * if not, create one
    //  * create jwt
    //  * set cookie and redirect
     
  })
  .get('/dashboard', authenticate, async (req, res) => {
    // require req.user
    // get data about user and send it as json
    res.json(req.user);
  })
  .delete('/sessions', (req, res) => {
    res
      .clearCookie(process.env.COOKIE_NAME)
      .json({ success: true, message: 'Signed out successfully!' });
  });
