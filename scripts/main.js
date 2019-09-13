var fileClient = SolidFileClient();

const popupUri = 'popup.html';
$('#login  button').click(() => solid.auth.popupLogin({ popupUri }) );
/*$('#login button').click(() => {
fileClient.popupLogin().then( webId => {
   console.log( `Logged in as ${webId}.`)
}, err => console.log(err) );

});*/
$('#logout button').click(() => solid.auth.logout());
// Update components to match the user's login status
var paths = {
  "uploads": "private/ZB/UPLOADS/",
  "posts": "private/ZB/POSTS/",
  "profile": "private/ZB/profile.ttl",
};
var username;
solid.auth.trackSession(session => {
  const loggedIn = !!session;
  $('#login').toggle(!loggedIn);
  $('#logout').toggle(loggedIn);
  if (loggedIn) {
    var UserLink = getUsername(session.webId);
    console.log(session);
    username = UserLink;
    $('#loader').show();
   //setStatus(session.webId);
    fileClient.createFolder(UserLink + paths['posts']).then(fileCreated => {
    }, err => console.log(err));

    fileClient.createFolder(UserLink + paths['uploads']).then(fileCreated => {
      writeProfile(session.webId, UserLink + paths['profile']);
      setTimeout(function(){window.location.href="newsfeed/index.html"},2500);  
      //alert('LOGGED');
      


    }, err => console.log(err));
    
    
    


    //window.location.href="newsfeed/index.html";

  }

});
async function setStatus(u){
  const doc = solid.data[u];
  const dtype = solid.data['http://schema.org/Document']
  const about = 'http://schema.org/';
  await doc.type.add(dtype);
  await doc[about + 'status'].add('');
  await doc[about + 'status'].set('online');
}
async function writeProfile(fro, to) {
  var predicatesToSearch = {
    'friend': 'http://xmlns.com/foaf/0.1/knows',
    'name': 'http://xmlns.com/foaf/0.1/name',
    'country': 'http://www.w3.org/2006/vcard/ns#country-name',
    'region': 'http://www.w3.org/2006/vcard/ns#region',
    'address': 'http://www.w3.org/2006/vcard/ns#street-address',
  };
  fileClient.fetchAndParse(fro, 'text/turtle').then(graph => {
    var parsed = JSON.stringify(graph);
    var parsed1 = JSON.parse(parsed);

    //console.log(parsed1);
    var me = parsed1['statements'];
    
    var k = Object.keys(predicatesToSearch);
    for (k in predicatesToSearch) {
    searchAndWrite(me, predicatesToSearch[k], to, k).then(console.log('INSERTED',k));
      
    }
  });
 
  
}
async function searchAndWrite(me, u, url, alias) {
  const doc = solid.data[url];
  const dtype = solid.data['http://schema.org/Document']
  const about = 'http://schema.org/';
  await doc.type.add(dtype);
  for (var i = 0; i < me.length; i++) {
    if (me[i]['predicate'].value == u) {
      await doc[about + alias].add(me[i]['object'].value);
    }
  }
 

}
function getUsername(profileURL) {
  var index = profileURL.indexOf("profile");
  var substring = profileURL.substr(0, index);
  return substring;
}
