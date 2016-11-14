// ЕСИА
var fs 		= require('fs');
var saml2 	= require('saml2-js');
var User 	= require('./models/User.js');
var env = process.env.NODE_ENV || 'development';
//========================================================
// Create service provider
var sp_options = {
        entity_id: "https://control26.ru",
        private_key: fs.readFileSync("ssl/server.key").toString(),
        certificate: fs.readFileSync("ssl/server.crt").toString(),
        assert_endpoint: "https://control26.ru/assert",
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
  res.redirect(301, "/");
};

// Starting point for login
exports.login = function(req, res) {
  console.log('---------------------------------------');
  console.log('---     login on server             ---');
  console.log('---------------------------------------');
  console.log(res.rawHeaders);
  // development only

  if (env === 'development') {
    var user = {
      // _id: "57d26e026e4edc261c01573d",
      _id: "58049b9f4c5c5a08dfd58510",
      // _id: "57a98bfc9204b1760f00005f",
      group: 3,
      email: "achiduzu@gmail.com",
      name: "Сигизмунд Петрович Силин",
      firstName: "Сигизмунд",
      middleName: "Петрович",
      lastName: "Силин"
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
  }
  // production only
  if (env === 'production') {
    sp.create_login_request_url(idp, {}, function(err, login_url, request_id) {
        if (err !== null)
            return res.send(500);
        console.log(login_url);
        // res.header.Access-Control-Allow-Origin = 'https://gibdd.control26.ru';
        return res.redirect(301, login_url);
    });
  }
};
// // Starting point for logout
exports.singleLogout = function(req, res) {
  if (env === 'development') {
    req.session.destroy();
    res.redirect('/');
  };
  if (env === 'production') {
    var options = {
        name_id: req.session.name_id,
        session_index: req.session.index
    };
    // console.dir(options);
    sp.create_logout_request_url(idp, options, function(err, logout_url) {
        if (err !== null)
            return res.send(500);
        res.redirect(logout_url);
    });
  };
};

exports.singleLogoutResponse = function(req, res) {
    if (req.session) {
        // console.log(req.currentUser.email);
        // LoginToken.remove({ email: req.currentUser.email }, function() {});
        res.clearCookie('logintoken');
        // req.session.destroy(function() {});
    }
    console.log('-------------------------------------------------------------')
    console.log(req.session);

    req.session.destroy();
    // isLoginESIA = false;
    res.redirect('/');
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

    // -----------------------------------Full ESIA fields ----------------------------------------------------------------------------------------
        uin.userName = attr['urn:esia:userName'];      //-Логин пользователя
        uin.deviceType = attr['urn:esia:deviceType'];  //-Тип носителя СКП, используемого при авторизации по ЭП
        uin.personType = attr['urn:esia:personType'];  //-Категория пользователя-->
        uin.userId = attr['urn:mace:dir:attribute:userId'];    //-Уникальный идентификатор пользователя в рамках поставщика идентификации
        uin.authnMethod = attr['Name="urn:esia:authnMethod'];  //-Метод аутентификации с помощью которого пользователь прошел аутентификацию
        uin.globalRole = attr['urn:esia:globalRole'];  //-Роль под которой аутентифицировался пользователь-->
        uin.birthDate = attr['urn:esia:birthDate'];
        uin.lastName = attr['urn:mace:dir:attribute:lastName'];    //-Фамилия пользователя
        uin.firstName = attr['urn:mace:dir:attribute:firstName'];  //-Имя пользователя
        uin.gender = attr['urn:esia:gender'];
        uin.middleName = attr['urn:mace:dir:attribute:middleName'];//-Отчество пользователя
        uin.memberOfGroups = attr['urn:esia:memberOfGroups'];
        uin.personINN = attr['urn:esia:personINN'];      //-ИНН пользователя
        uin.personSNILS = attr['urn:esia:personSNILS'];  //-СНИЛС пользователя
        uin.personOGRN = attr['urn:esia:personOGRN'];    //-ОГРНИП пользователя
        uin.personEMail = attr['urn:esia:personEMail'];  //-Электронный адрес пользователя
        uin.systemAuthority = attr['urn:esia:systemAuthority'];  //-Полномочия пользователя в системе, которая запрашивает аутентификацию
        uin.orgType = attr['urn:esia:orgType'];          //-Тип организации пользователя
        uin.orgName = attr['urn:esia:orgName'];          //-Имя организации пользователя
        uin.orgOGRN = attr['urn:esia:orgOGRN'];          //-ОГРН организации пользователя
        uin.orgINN = attr['urn:esia:orgINN'];            //-ИНН организации пользователя
        uin.orgPosition = attr['urn:esia:orgPosition'];  //-Должность пользователя в организации




    // uin.orgAddresses = attr['urn:esia:orgAddresses'];
    // uin.orgBranchKPP = attr['urn:esia:orgBranchKPP'];
    // uin.orgBranchName = attr['urn:esia:orgBranchName'];
    // uin.orgContacts = attr['urn:esia:orgContacts'];
    // uin.orgOid = attr['urn:esia:orgOid'];
    // uin.orgKPP = attr['urn:esia:orgKPP'];
    // uin.orgLegalForm = attr['urn:esia:orgLegalForm'];
    // uin.orgShortName = attr['urn:esia:orgShortName'];
    // uin.personCitizenship = attr['urn:esia:personCitizenship'];
    // uin.personMobilePhone = attr['urn:esia:personMobilePhone'];
    // uin.personTrusted = attr['urn:esia:personTrusted'];
    // uin.principalContacts = attr['urn:esia:principalContacts'];
    // uin.principalDocuments = attr['urn:esia:principalDocuments'];
    // uin.principalAddresses = attr['urn:esia:principalAddresses'];
    // uin.assuranceLevel = attr['urn:esia:assuranceLevel'];

    // req.session.user_id = 0;
    // поищем пользователя
    User.findOne({ 'uid': uin.uid }, function(err, user) {
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
      console.log('--assert login from ESIA---------------')
      console.log('-- uin                               --')
      console.log(uin);
      console.log('-- user                              --')
      console.log(user);
      req.session.isadmin = false;
      req.session.ismoderator = false;

      req.session.name = user.name;
      req.session.currentUser = user;
      if (user.group === 3 ) {
        req.session.isadmin = true;
      }
      if (user.group === 2 ) {
        req.session.ismoderator = true;
      }
      req.session.currentUser = user;
      req.session.authorized = true;
      res.redirect(301, "/");

      // if(user.group == 3) {
      //     req.session.isadmin = true;
      // }
      // req.session.authorized = true;
      // res.redirect('/');
    });
  });
};
