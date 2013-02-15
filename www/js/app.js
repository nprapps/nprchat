$(function() {
    var CHAT_ROOT = 'https://' + APP_CONFIG['FIREBASE_HOST'] + '/' + APP_CONFIG['FIREBASE_CHAT_KEY'];

    var users = new Firebase(CHAT_ROOT + '/users');
    var posts = new Firebase(CHAT_ROOT + '/posts');

    var $posts = $('#posts');
    var $post_form = $('#post-form');
    var $user_info = $('#user-info');
    var $login_form = $('#login-form');
    var $logout_link = $user_info.find('.logout');

    posts.on('child_added', function(snapshot) {
        var context = {
            'id': snapshot.name(),
            'post': snapshot.val()
        };

        $posts.prepend(JST.chat_post(context));
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
        var $input = $(this).find('input[name="text"]')
        var text = $input.val();
        var timestamp = moment().valueOf();

        var new_post = posts.push();
        new_post.setWithPriority({ 'text': text, 'author': $.cookie('username') }, timestamp);

        $input.val('');
            
        return false;
    });

    function create_user(username, expires, secret) {
        // Create user
        users.child(username).set({ 'expires': expires, 'secret': secret });

        $.cookie('username', username);
        $.cookie('secret', secret);
    }

    function login(username) {
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
                    return;
                }

                else if (moment(user.expires) > moment().subtract('hours', 2)) {
                    create_user(username, expires, secret);
                }

                else {
                    alert('Sorry that username is taken try another')
                    return;
                }
            }
            toggle_user_state();
        });
    }

    $login_form.submit(function() {
        var username = $(this).find('input[name="username"]').val();
        login(username);

        return false;
    });

    $logout_link.click(function() {
        var user = new Firebase(CHAT_ROOT + '/users/' + $.cookie('username'));
        user.remove(function (error) {
            if (error) {
                alert("ERROR!!!");
                return;
            }

            $.removeCookie('username');
            $.removeCookie('secret');

            toggle_user_state();
        });
    });

    function toggle_user_state() {
        if (_.isUndefined($.cookie('username'))) {
            $user_info.hide();
            $login_form.show();
            $post_form.hide();
        }

        else {
            $user_info.find('.username').text($.cookie('username'));
            $login_form.hide();
            $user_info.show();
            $post_form.show();
        }
    }

    toggle_user_state();
});
