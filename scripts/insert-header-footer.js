$(document).ready(function(){
	$(".button-collapse").sideNav();

	//show dropdown content for top navbar
	$(".dropdown").click(function (e) {
    e.stopPropagation();
    $(this).children('.dropdown-content').toggle();
 	});

	//underline current page in navigation
	$(function(){
		$('a').each(function(){
	    if ($(this).prop('href') == window.location.href) {
	      $(this).addClass('current-page'); $(this).parents('li.dropdown').addClass('current-dropdown');
	    }
	  });
	});

	//show sections of announcment submission form when checked
	$('#weekly_email').on('change', function() {
			console.log('changed');
			$('#weekly_email_section').toggle();
	});
	$('#remind_text').on('change', function() {
			console.log('changed');
			$('#remind_section').toggle();
	});
	$('#website').on('change', function() {
			console.log('changed');
			$('#website_section').toggle();
	});
});
