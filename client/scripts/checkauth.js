let MT_USER;
const MT_AUTH_BEFORESEND = function(xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + Cookies.get('mt_jwt')) };

function checkAuth() {
	if(!Cookies.get('mt_jwt')) {
		window.location.href= '/signin';
		return;
	}
	$.ajax({
		type: 'GET',
		url: '/auth/refresh',
		dataType: 'json',
		contentType: 'application/json',
		beforeSend: MT_AUTH_BEFORESEND
	})
	.done(res => {
		Cookies.set('mt_jwt', res);
		MT_USER = jwt_decode(res).user.id;
	})
	.fail(res => {
		if(res.status === 401)
			window.location.href = '/signin';
		else
			window.location.href= '/error';
	});
}

checkAuth();