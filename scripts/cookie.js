//JavaScript Document
//script to for checking cookies
function getCookie(cname) {
	var name = cname + "=";
	var decodedCookie = decodeURIComponent(document.cookie);
	var ca = decodedCookie.split(';');
	for(var i = 0; i <ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) == ' ') {
			c = c.substring(1);
		}
		if (c.indexOf(name) == 0) {
			return c.substring(name.length, c.length);
		}
	}
	return "";
}
//script to view cookies
function alertCookie() {
  	alert(document.cookie);
}
//show or hide cookie snackbar based on cookie
function recallCookie() {
	var cprompt = getCookie("cprompt");
	if (cprompt=="hide") {
		acceptedCookie();
	} else {
		ignoredCookie();
	}
}
//cookiePrompt=show changes
function acceptedCookie() {
	//alert("accepted");
  document.body.style.setProperty("--cookie-snackbar", "-100px");
	document.cookie="cprompt=hide; max-age=31536000;";

}
//
function ignoredCookie() {
	//alert("ignored");
  document.body.style.setProperty("--cookie-snackbar", "0");
	document.cookie="cprompt=show";
	document.cookie="cprompt=hide; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
}
