const fetch = require('cross-fetch');

const exchangeCodeForToken = async (code) => {
  // TODO: Implement me!
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
  const { accessToken } = await response.json();
  return accessToken;
};

const getGithubProfile = async (accessToken) => {
  // TODO: Implement me!
  const profileResponse = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `token ${accessToken}`,
    }
  });

  const { login, email, avatar_url } = await profileResponse.json();

  const newObj = {
    username: login,
    email,
    avatar: avatar_url

  };
  console.log('NEWOBJ!!!!!', newObj);
  return newObj;
};

module.exports = { exchangeCodeForToken, getGithubProfile };
