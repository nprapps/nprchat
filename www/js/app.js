$(function() {
    var CHAT_ROOT = 'https://' + APP_CONFIG['FIREBASE_HOST'] + '/' + APP_CONFIG['FIREBASE_CHAT_KEY'];

    var users = new Firebase(CHAT_ROOT + '/users');
    var posts = new Firebase(CHAT_ROOT + '/posts');
    //var username = $.cookie('username');
    //var secret = parseInt($.cookie('secret'));

    var $posts = $('#posts');

    posts.on('child_added', function(snapshot) {
        var context = {
            'id': snapshot.name(),
            'post': snapshot.val()
        };

        $posts.append(JST.chat_post(context));
    });

    posts.on('child_removed', function(snapshot) {
        var id = snapshot.name();

        $posts.find('li[data-post-id="' + id + '"]').remove();
    });

    posts.on('child_changed', function(snapshot) {
        var id = snapshot.name();

        var context = {
            'id': id,
            'post': snapshot.val()
        };

        $posts.find('li[data-post-id="' + id + '"]').replaceWith(JST.chat_post(context));
    });

    $('#post-form').submit(function() {
        var text = $(this).find('input[name="text"]').val();

        posts.push({ 'text': text, 'author': $.cookie('username') });
            
        return false;
    });

    function create_user(username, expires, secret) {
        // Create user
        users.child(username).set({ 'expires': expires, 'secret': secret });

        $.cookie('username', username);
        $.cookie('secret', secret);
    }

    $('#login-form').submit(function() {
        var username = $(this).find('input[name="username"]').val();
        var query = users.startAt(null, username).endAt(null, username);

        query.once('value', function(snapshot) {
            var expires = moment().add('hours', 2).valueOf();
            var secret = Math.floor(Math.random() * 1000000).toString();

            if (snapshot.val() === null) {
                create_user(username, expires, secret);
            }

            else {
                // Check if username is expired
                var user = snapshot.val()[username];

                if (user.secret == $.cookie('secret')) {
                    alert('You are already using that username');
                }

                else if (moment(user.expires) > moment().subtract('hours', 2)) {
                    create_user(username, expires, secret);
                }

                else {
                    alert('Sorry that username is taken try another')
                }
            }
        });

        return false;
    });
});
