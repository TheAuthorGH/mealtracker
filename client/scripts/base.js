'use strict';

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

function addAccountControls() {
	if(Cookies.get('mt_jwt')) {
		$('nav li.mt-signin').hide().prop('hidden', true);
		$('nav li.mt-signout').show().prop('hidden', false);
	} else {
		$('nav li.mt-signout').hide().prop('hidden', true);
		$('nav li.mt-signin').show().prop('hidden', false);
	}
}

$(function() {
	handleControls();
	addAccountControls();
});