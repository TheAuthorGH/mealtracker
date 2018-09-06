'use strict';

function handleSigninControls() {
	$('form.mt-signin').submit(function(evt) {
		evt.preventDefault();

		const messages = $('.mt-signin-messages');

		const email = $('#mt-signin-email').val();
		const password = $('#mt-signin-password').val();

		$.ajax({
			type: 'POST',
			url: '/auth/login',
			dataType: 'json',
			contentType: 'application/json',
			data: JSON.stringify({email: email, password: password})
		})
		.done(res => {
			Cookies.set('mt_jwt', res);
			window.location.href = '/dashboard';
		})
		.fail(res => {
			if(res.status === 401)
				messages.text('Invalid email or password!');
			else if(res.status === 500)
				messages.text('Sorry, we cannot process your request right now!');
		});
	});
}

$(function() {
	handleSigninControls();
});