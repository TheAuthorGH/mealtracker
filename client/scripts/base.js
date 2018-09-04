let mtNavHidden = false;
function toggleMobileNav() {
	const nav = $('nav.responsive-mobile');
	if(mtNavHidden)
		nav.slideDown(250, 'easeOutCubic').prop('hidden', false);
	else
		nav.slideUp(250, 'easeOutCubic').prop('hidden', true);
	mtNavHidden = !mtNavHidden;
}

function handleControls() {
	toggleMobileNav();
	$('.nav-control').click(function(evt) {
		evt.preventDefault();
		toggleMobileNav();
	});
}

$(function() {
	handleControls();
});