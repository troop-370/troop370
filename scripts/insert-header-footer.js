$(document).ready(function(){
	//$( "<titlebar> <container> <heading>Boy Scout Troop 370</heading> </container> </titlebar> <topnav> <container> <ul> <li><a href='index.html#home' id='home'>Home</a></li> <li class='dropdown'> <a href='javascript:void(0)' id='about'>About</a> <dropdown class='dropdown-content'> <a href='about.html#about'>General Information</a> <a href='leaders.html#about'>Leaders</a> <a href='eagle-scout-honor-role.html#about'>Eagle Scout Honor Role</a> </dropdown> <li class='dropdown'> <a href='javascript:void(0)' id='information'>Information</a> <dropdown class='dropdown-content'> <a href='participation.html#information'>Scout/Parent Participation</a> <a href='forms-documents.html#information'>Forms &amp; Documents</a> <a href='advancement.html#information'>Advancement</a> <a href='helpful-links.html#information'>Helpful Links</a> <a href='pine-straw-info.html#information'>Pine Straw Sales</a> </dropdown> <li class='dropdown'> <a href='javascript:void(0)' id='scouts'>Scouts</a> <dropdown class='dropdown-content'> <a href='leadership-training.html#scouts'>Leadership Training</a> <a href='faqs.html#scouts'>Frequently Asked Questions</a> <a href='finding-mb.html#scouts'>​Finding a Merit Badge Class or Counselor</a> <a href='new-scouts.html#scouts'>Letter to New Scouts</a> </dropdown> <li class='dropdown'> <a href='javascript:void(0)' id='tevents'>Troop Events</a> <dropdown class='dropdown-content'> <a href='camps-adventure.html#tevents'>Camps/High Adventure</a> <a href='campout-schedule-local-events.html#tevents'>Campout Schedule &amp; Local Events</a> </dropdown> <li><a href='photos.html#photos' id='photos'>Photos</a></li> <li><a href='contact.html#contact' id='contact'>Contact</a></li> <li><a href='payments.html#payments' id='payments'>Payments</a></li> <li><a href='pinestraw.html#pinestraw' id='pinestraw'>Pine Straw</a></li> </li> </ul> </container> </topnav>" ).insertBefore( "body" );

	$(".dropdown").click(function (e) {
    e.stopPropagation();
    $(this).children('.dropdown-content').toggle();
 	});

  var title = $(document).prop('title');
  $(document).prop('title', title+' | Boy Scout Troop 370');

  $('meta[property=og\\:url]').attr('content', window.location.href);
  $('meta[property=og\\:image]').attr('content', window.location.href);
});
