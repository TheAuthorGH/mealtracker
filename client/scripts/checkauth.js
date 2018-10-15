const MT_AUTH_BEFORESEND = function(xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + Cookies.get('mt_jwt')) };

function checkAuth() {
	if(!Cookies.get('mt_jwt')) {
		window.location.href= '/signin';
		return;
	}
	return new Promise((resolve, reject) => {
		$.ajax({
			type: 'GET',
			url: '/auth/refresh',
			dataType: 'json',
			contentType: 'application/json',
			beforeSend: MT_AUTH_BEFORESEND
		})
		.done(res => {
			Cookies.set('mt_jwt', res, {expires: 1});
			Cookies.set('mt_user', jwt_decode(res).user.id, {expires: 1});
			resolve();
		})
		.fail(res => {
			if(res.status === 401)
				window.location.href = '/signin';
			else
				window.location.href= '/error';
			reject();
		});
	});
}