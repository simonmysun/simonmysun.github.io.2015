var doneAlready = false;
var footerPrepended = false;
var done = function() {
    if(doneAlready) {
        return ;
    }
    doneAlready = true;
};

readyFn.push(function() {
   if(doneAlready === true) {
       return 1;
   } else {
       return 0;
   }
});

readyFn.push(function() {
    if(footerPrepended) {
        return 1;
    }
    $('.footer-itself').html('Using <a href="http://depthy.me">Depthy</a>. ');
    footerPrepended = true;
    return 1;
});
