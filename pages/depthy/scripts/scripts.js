var doneAlready = false;
var done = function() {
    if(doneAlready) {
        return ;
    }
    doneAlready = true;
    console.log('done!');
};
