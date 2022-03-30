const { Router } = require('express');
const jwt = require('jsonwebtoken');
const authenticate = require('../middleware/authenticate');
const GithubUser = require('../models/GithubUser');
const { exchangeCodeForToken, getGithubProfile } = require('../utils/github');
// const fetch = require('cross-fetch');

const ONE_DAY_IN_MS = 1000 * 60 * 60 * 24;

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

    //exchange code for token
    const accessToken = await exchangeCodeForToken(code);

    //get user info from github with token
    const profile = await getGithubProfile(accessToken);

    // console.log('PROFILE', profile);

    //  * get existing user if there is one
    let user = await GithubUser.findByUsername(profile.username);
    
    
    //  * if not, create one
    if (!user) {
      user = await GithubUser.insert(profile);
    }
    
    // console.log('USER', user);
    
    //  * create jwt
    //  * set cookie
    res.cookie(process.env.COOKIE_NAME, jwt.sign({ ...user }, process.env.JWT_SECRET, { expiresIn: '1 day' }), {
      httpOnly: true,
      maxAge: ONE_DAY_IN_MS
    });

    // redirect
    res.redirect('/api/v1/github/dashboard');
    // res.send(user);
    
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
