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
		evt.stopPropagation();
		toggleMobileNav();
	});
	$('body').click(function(evt) {
		if(!mtNavHidden)
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

// Util

function formatDate(date) {
	const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
	const diff = (new Date() - date) / 60000; // in minutes
	if(diff < 2)
		return 'Just now';
	if(diff < 60)
		return `${Math.floor(diff)} minutes ago`;
	if(diff < 120)
		return 'One hour ago';
	if(diff < 1440)
		return `${Math.floor(diff / 60)} hours ago`;
	return `${months[date.getMonth()]} ${date.getDay()}, ${date.getFullYear()}`;
}