const { Router } = require('express');
const jwt = require('jsonwebtoken');
const authenticate = require('../middleware/authenticate');
const GithubUser = require('../models/GithubUser');
const GithubUserService = require('../services/GithubUserService');
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
    //get user info from github with token
    //  * get existing user if there is on
    //  * if not, create one
    const user = await GithubUserService.create(code);
    
    // console.log('USER', user);
    
    //  * create jwt
    //sign wants user object, jwt secret, and expires in object
    const token = jwt.sign(
      { ...user }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1 day' });


    //  * set 
    //cookie wants cookie name, jwt, and object with httpOnly and maxAge props
    res.cookie(
      process.env.COOKIE_NAME, 
      token, 
      {
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
