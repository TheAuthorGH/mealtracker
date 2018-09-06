function checkAuth() {
	if(!Cookies.get('mt_jwt'))
		window.location.href= '/signin'
}

checkAuth();