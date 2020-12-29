// disable loading animation if internally referred
let url = window.location.toString();
url = url.substring(0, url.lastIndexOf("/"));
if (document.referrer.startsWith(url)) {
    document.getElementById("logo").style.visibility = "hidden";
    document.getElementById("content").classList.remove("fadeIn");
}
