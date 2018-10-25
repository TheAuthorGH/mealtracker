'use strict';

function handleSignupControls() {
	$('form.mt-signup').submit(function(evt) {
		evt.preventDefault();
		
		$(this).find('input').removeClass('mt-invalid');

		const messages = $('.mt-signup-messages');

		const email = $('#mt-signup-email').val().trim();
		const password = $('#mt-signup-password').val();
		
		messages.text('Please wait...');

		// Validate Input
		if(password !== $('#mt-signup-password-confirm').val()) {
			$('#mt-signup-password, #mt-signup-password-confirm').addClass('mt-invalid');
			messages.text("Passwords don't match!");
			return;
		}
		if(password.length < 5) {
			$('#mt-signup-password, #mt-signup-password-confirm').addClass('mt-invalid');
			messages.text('Password is too short!');
			return;
		}

		$.ajax({
			type: 'POST',
			url: '/users',
			dataType: 'json',
			contentType: 'application/json',
			data: JSON.stringify({ email: email, password: password })
		})
		.done(res => {
			$.ajax({
				type: 'POST',
				url: '/auth/login',
				dataType: 'json',
				contentType: 'application/json',
				data: JSON.stringify({email: email, password: password})
			})
			.done(res => {
				Cookies.set('mt_jwt', res, {expires: 1});
				window.location.href = '/dashboard';
			});
		})
		.fail(res => {
			if(res.status === 400 && res.responseJSON.reason === 'email-taken') {
				$('#mt-signup-email').addClass('mt-invalid');
				messages.text('Email is already in use!');
			} else if(res.status === 500) {
				messages.text('Sorry, we cannot process your request right now!');
			}
		});
	});
}

$(function() {
	handleSignupControls();
});