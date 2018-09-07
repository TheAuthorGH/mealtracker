function checkAuth() {
	const jwt = Cookies.get('mt_jwt');
	if(!jwt) {
		window.location.href= '/signin';
		return;
	}
	$.ajax({
		type: 'GET',
		url: '/auth/refresh',
		dataType: 'json',
		contentType: 'application/json',
		beforeSend: function(xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + jwt) }
	})
	.done((res) => {
		Cookies.set('mt_jwt', res);
	})
	.fail((res) => {
		if(res.status === 401)
			window.location.href = '/signin';
		else
			window.location.href= '/error';
	});
}

checkAuth();