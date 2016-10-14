// ЕСИА
var fs 		= require('fs');
var saml2 	= require('saml2-js');
var User 	= require('./models/User.js');
//========================================================
// Create service provider
var sp_options = {
        entity_id: "https://test.control26.ru",
        private_key: fs.readFileSync("ssl/server.key").toString(),
        certificate: fs.readFileSync("ssl/server.crt").toString(),
        assert_endpoint: "https://test.control26.ru/assert",
        force_authn: true,
        sign_get_request: true,
        allow_unencrypted_assertion: false
    };
    // Call service provider constructor with options
var sp = new saml2.ServiceProvider(sp_options);
// Example use of service provider.
// Call metadata to get XML metatadata used in configuration.
var metadata = sp.create_metadata();
// Create identity provider
var idp_options = {
    sso_login_url: "https://esia.gosuslugi.ru/idp/profile/SAML2/Redirect/SSO",
    sso_logout_url: "https://esia.gosuslugi.ru/idp/profile/SAML2/Redirect/SLO",
    certificates: [fs.readFileSync("ssl/esia.crt").toString()]
};

var idp = new saml2.IdentityProvider(idp_options);

// Endpoint to retrieve metadata
exports.getMetadata = function(req, res) {
    res.type('application/xml');
    var metadata = fs.readFileSync('metadata.xml');
    res.send(metadata);
};
exports.logout = function(req, res) {
  console.log('---------------------------------------');
  console.log('---     logout from server          ---');
  console.log('---------------------------------------');
  req.session.destroy();
  res.redirect("/");
};

// Starting point for login
exports.login = function(req, res) {
  console.log('---------------------------------------');
  console.log('---     login on server             ---');
  console.log('---------------------------------------');
  var user = {
    _id: "57d26e026e4edc261c01573d",
    // _id: "57a98bfc9204b1760f00005f",
    group: 3,
    email: "achiduzu@gmail.com",
    name: "Сигизмунд Петрович Кац",
    firstName: "Сигизмунд",
    middleName: "Петрович",
    lastName: "Кац"
  };
  req.session.isadmin = false;
  req.session.ismoderator = false;
  // req.session.id = "klj657675kjbnk45b67v5h3c5f353c6g346b5h3";
  if (user.group === 3 ) {
    req.session.isadmin = true;
  }
  if (user.group === 2 ) {
    req.session.ismoderator = true;
  }
  req.session.currentUser = user;
  req.session.authorized = true;
  res.redirect("/");

    // sp.create_login_request_url(idp, {}, function(err, login_url, request_id) {
    //     if (err !== null)
    //         return res.send(500);
    //     console.log(login_url);
    //     res.redirect(login_url);
    // });
};
// Assert endpoint for when login completes
exports.assert = function(req, res, next) {
  // console.dir(JSON.stringify(req.body));
  var options = { request_body: req.body, allow_unencrypted_assertion: true };
  sp.post_assert(idp, options, function(err, saml_response) {
    if (err !== null) {
        console.log("LOIIII = " + err);
        return res.status(500).send('err');
    }
    // console.log(saml_response.user.attributes);
    // Save name_id and session_index for logout
    // Note:  In practice these should be saved in the user session, not globally.
    // res.session.message = name_id = saml_response.user.name_id;
    req.session.index = saml_response.user.session_index;
    req.session.name_id = saml_response.user.name_id;
    req.session.isadmin = false;
    var attr = saml_response.user.attributes;
    var uin = {};
    // получим данные из ЕСИА
    uin.email = attr['urn:esia:personEMail'];
    uin.uid = attr['urn:esia:userName'];
    uin.middleName = attr['urn:mace:dir:attribute:middleName'];
    uin.firstName = attr['urn:mace:dir:attribute:firstName'];
    uin.lastName = attr['urn:mace:dir:attribute:lastName'];

    // req.session.user_id = 0;
    // поищем пользователя
    User.findOne({ 'uid': uin.uid }, { id: 1, group: 1, name: 1, email: 1 }, function(err, user) {
      if (user) {
          //   req.currentUser = user;
          req.session.user_id = user.id;
          req.session.email = user.email;
          console.log('user found', user.id);
      } else {
          user = new User();
          req.session.user_id = user.id;
          req.session.email = user.email;
          user.name = uin.lastName + ' ' + uin.firstName + ' ' + uin.middleName;
          user.email = uin.email;
          user.uid = uin.uid;
          user.middleName = uin.middleName;
          user.firstName = uin.firstName;
          user.lastName = uin.lastName;
          user.group = 1;
          user.save();
      }
      // console.dir(user);
      req.session.name = user.name;
      req.session.currentUser = user;
      if(user.group == 3) {
          req.session.isadmin = true;
      }
      req.session.authorized = true;
      res.redirect('/');
    });
  });
};
