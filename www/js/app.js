$(function() {
    var CHAT_ROOT = 'https://' + APP_CONFIG['FIREBASE_HOST'] + '/' + APP_CONFIG['FIREBASE_CHAT_KEY'];

    var users = new Firebase(CHAT_ROOT + '/users');
    var posts = new Firebase(CHAT_ROOT + '/posts');

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
        var text = $(this).find('.text').val();

        posts.push({ 'text': text, 'author': 'onyxfish' });
            
        return false;
    });
});
