var head = document.getElementsByTagName('HEAD').item(0);
var style = document.createElement('link');
style.href = 'css/style.css';
style.rel = 'stylesheet';
style.type = 'text/css';
head.appendChild(style);

window.onload = function() {
    console.log("ds");
    $("audio")[0].play();
    $("#loading").fadeOut(2000,function(){
	alert("finished");
    })
}
