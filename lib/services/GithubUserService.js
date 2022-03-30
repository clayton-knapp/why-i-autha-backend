const GithubUser = require('../models/GithubUser');
const { exchangeCodeForToken, getGithubProfile } = require('../utils/github');

module.exports = class GithubUserService {
  static async create(code) {

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

    return user;

  }


};
