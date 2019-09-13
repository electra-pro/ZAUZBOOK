

var fileClient = SolidFileClient;

var paths = {
    "uploads": "private/ZB/UPLOADS/",
    "posts": "private/ZB/POSTS/",
    "profile": "private/ZB/profile.ttl",
};
var userLink = '';

function loadProfile(){
    fileClient.fetchAndParse(userLink + paths['profile']).then(graph => {
        console.log(graph);
    });
}




function calculateDuration(d, t) {
    var today = new Date();
    var tm = today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();
    var date = today.getDate() + "/" + (today.getMonth() + 1) + '/' + today.getFullYear();
    
    if (date == d) {
          //console.log('DATE MATCHED : ',d);
        var dat = parseInt(tm) - parseInt(t);
        //console.log(`${date} - ${d} = ${dat}`);
        var result = '';
        if (dat > 0) {
            if (dat == 1) {
                result = dat + ' hr ago';
            }
            else {
                result = dat + ' hrs ago';
            }

        }
        else {
            result = 'recently uploaded';
        }
        return result;

    }
    return (t + '&nbsp;&nbsp;&nbsp;' + d);
}
 function getDp(u){
    fileClient.fetchAndParse(u, 'text/turtle').then(graph => {
        var parsed = JSON.stringify(graph);
        var parsed1 = JSON.parse(parsed);
        var m = parsed1['statements'];
        for(var i=0;i<m.length;i++){
            if(m[i]['predicate'].value =='http://schema.org/dp') {
                res = m[i]['object'].value;
                $('#profile').attr('src',res);
                $('.myProf').attr('src',res);
                $('.postDp').attr('src',res);
                //console.log(res);
                
            }
        }
    });

}
function likePost(V){
   console.log($(V).attr('class'));
}

function sharePost(V){
    console.log(V);
}
async function loadPosts() {
    posts = $('.posts');
    url = userLink+paths['posts'];
    fileClient.readFolder(url).then(folder => {
        if (!folder.files.length) {
            posts.append(`<h3 class="w3-container">you have not posted yet make your first post </h3>`);
        }
        for (var i = 0; folder.files.length; i++) {
            var URI = url + (folder.files[i].name);
            fileClient.fetchAndParse(URI, 'text/turtle').then(graph => {
                var parsed = JSON.stringify(graph);
                var parsed1 = JSON.parse(parsed);
                //console.log(parsed1['statements']);
                
                var me = parsed1['statements'][4].object['value'];

                var fecthedData = '';
                if (me != '') {
                    fecthedData = `  <div class="post" >
              <p class="postheader">
                  <img src="${getDp(userLink + paths['profile'])}" alt="X" class="postDp">
                  <span class="myProf">${$('#myPr').text()}</span>
                  &nbsp;
                  shared a post 
                  <br>
                  <span class="duration">${calculateDuration(parsed1['statements'][2].object['value'], parsed1['statements'][11].object['value'])}</span>
              </p>
              <p class="postData">
              <p class="postText">
              ${parsed1['statements'][6].object['value']}
          </p>
              <img class="sharedMedia" onclick="OpenImage(this)" src="${parsed1['statements'][4].object['value']} " alt="Unsupported File">
              </p>
          
              <p class="controls" >
                  <span onclick="likePost(this)" class="${parsed1['statements'][8].object['value']}">LIKE</span>
                  <span onclick="sharePost(this)" class="${parsed1['statements'][8].object['value']}">SHARE</span>
              </p>
              <p class='postfooter'>
                  <textarea placeholder="comment here"></textarea>
              </p>
          </div>
          <hr>`;
                }
                else {
                    fecthedData = `  <div class="post" >
              <p class="postheader">
                  <img src="${getDp(userLink + paths['profile'])}"  alt="X" class="postDp">
                  <span class="myProf">${$('#myPr').text()}</span>
                  &nbsp;
                  shared a post 
                  <br>
                  <span class="duration">${calculateDuration(parsed1['statements'][2].object['value'], parsed1['statements'][11].object['value'])}</span>
              </p>
              <p class="postData">
              <p class="postText">
              ${parsed1['statements'][6].object['value']}
          
              <p class="controls">
              <span onclick="likePost(this)" class="${parsed1['statements'][8].object['value']}">LIKE</span>
              <span onclick="sharePost(this)" class="${parsed1['statements'][8].object['value']}">SHARE</span>
              </p>
              <p class='postfooter'>
                  <textarea placeholder="comment here"></textarea>
              </p>
          </div>
          <hr>`;
                }


                posts.append(fecthedData);
            }, err => console.log(err));
        }


    }, err => console.log(err));




}
function getUsername(profileURL){
    var index = profileURL.indexOf("profile");
    var substring = profileURL.substr(0, index);
    return substring;
}
function getWebD(){
    userLink = getUsername($('#webd').text());
    
 
    solid.auth.trackSession(session=>{
        var uri = getUsername(session.webId);
        fileClient.fetchAndParse(uri + paths['profile'], 'text/turtle').then(graph => {
            var parsed = JSON.stringify(graph);
            var parsed1 = JSON.parse(parsed);
            var m = parsed1['statements'];
    
            for(var i=0;i<m.length;i++){
                if(m[i]['predicate'].value == 'http://schema.org/name'){
                      
                    $('#myPr').text(m[i]['object'].value);
               
                  }
              }
    
        });
    });
    loadPosts();    
}
function OpenImage(v){
    var win = window.open(v.src, '_blank');
    win.focus(); 
    
}
$(document).ready(function () {
    $('#buttonpost').hide();
    solid.auth.trackSession(session => {
        $('#webd').text(session.webId);
        
    });
   
   
    
   
   // loadPosts();

    var mediaLink = '';

    $('#logout').click(() => { solid.auth.logout(); console.log('DONE'); window.location.href = '../index.html' });
    $('#postbox').on('input',() =>{
        var d = $('#postbox').val();
        console.log(d);
            if(d.length  > 0){
                $('#buttonpost').fadeIn(250);
            }
            else{
                $('#buttonpost').fadeOut(250);
            }
    });
    $('#buttonpost').click(async function () {
        
        $('#loader').css("visibility",'visible');
        var today = new Date();
        var date = today.getFullYear().toString() + (today.getMonth() + 1).toString() + today.getDate().toString();
        var time = today.getHours().toString() + today.getMinutes().toString() + today.getSeconds().toString();
        var dateTime = date + time;
        var profile = $('#webd').text();
        var postId = 'ZBP' + dateTime;
        var postBody = $('#postbox').val();
        var tags = '0';
        var likes = '0';
        var comments = '0';
        var shares = '0';

        var url = userLink+paths['posts'] + postId + '.ttl';
        var tm = today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();
        var dt = today.getDate() + "/" + (today.getMonth() + 1) + '/' + today.getFullYear();


        var mF = mediaLink;
        //  console.log('Mf : ', mF);

        const obj = {
            'postId': postId,
            'PostBody': postBody,
            'tags': tags,
            'likes': likes,
            'comments': comments,
            'shares': shares,
            'postFrom': profile,
            'ofFolder':  userLink+paths['posts'] ,
            'url': url,
            'time': tm,
            'date': dt,
            'media': mF
        };

        console.log('YOU POSTED : ', obj);
        const doc = solid.data[url];
        const dtype = solid.data['http://schema.org/Document']
        const about = 'http://schema.org/';
        await doc.type.add(dtype);
        console.log(profile, doc);
        for (k in obj) {
            await doc[about + k].add(obj[k]);
        }

        const folder =  userLink+paths['uploads'] ;
        const fileInput = document.getElementById('files');
        const files = fileInput.files;
        
        if (fileInput.value) {
            for (var i = 0; i < files.length; i++) {
                var URI = folder + files[i].name;
                var content = files[i];
                SolidFileClient.updateFile(URI, content).then(res => {
                    console.log(res);
                    mediaLink = URI;

                    console.log("media link : ", mediaLink);
                }, err => { console.log("upload error : " + err) });

            }
            await doc[about + 'media'].set(folder + files[0].name);
           
        }
        setTimeout(function(){alert('Your post is Shared');
        window.location.reload();},500);  
        
    
    });
    $('#profile').click(function () {

        window.location.href='profile.html';

    });
});

