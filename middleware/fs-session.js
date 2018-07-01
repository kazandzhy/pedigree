/**
 * Middleware that ensures a user is authenticated with FS and that the current
 * user has been loaded and saved in the session. If everything is fine with
 * the user's credentials, they can remain on the page; otherwise, they are
 * redirected back to sign-in page. So if a person wants to hack in the system
 * by typing /pedigree in the URL, it won't work because they'll be redirected
 * back to the home page.
 */
module.exports = function(req, res, next){
  if(req.session.fs_token){
    if(!req.session.user){
      req.fs.get('/platform/users/current', function(error, userResponse){
        if(userResponse.statusCode === 200){
          req.session.user = userResponse.data.users[0];
        } else {
          console.log(`Unexpected current user response: ${userResponse.statusCode} ${userResponse.statusText}`);
        }
        next();
      });
      return;
    }
    next();
  } else {
    res.redirect('/');
  }
};