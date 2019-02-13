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
	document.cookie="cprompt=hide; max-age=31536000;";
	var element = document.getElementById("cookieSnackbar");
  element.classList.remove("mdc-snackbar--open");
}
//
function ignoredCookie() {
	//alert("ignored");
	document.cookie="cprompt=show";
	document.cookie="cprompt=hide; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
	var element = document.getElementById("cookieSnackbar");
  element.classList.add("mdc-snackbar--open");
}
