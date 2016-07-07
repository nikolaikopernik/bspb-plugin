var s = document.createElement('script');
s.src = chrome.extension.getURL('costs.js');
document.getElementById('footer').appendChild(s);
s.onload = function() {
    this.remove();
};

var css = document.createElement('link');
css.rel = 'stylesheet';
css.type = 'text/css';
css.href = chrome.extension.getURL('costs.css');
document.head.appendChild(css);


