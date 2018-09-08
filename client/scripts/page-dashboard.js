function handleDashboardControls() {
	$('.mt-dashboard-addjournal').submit(function(evt) {
		evt.preventDefault();
		$.ajax({
			type: 'POST',
			url: '/journals',
			dataType: 'json',
			contentType: 'application/json',
			data: JSON.stringify({user: MT_USER, title: $('.mt-dashboard-addjournal input').val()}),
			beforeSend: MT_AUTH_BEFORESEND
		})
		.done(updateJournals)
		.fail(() => window.location.href = '/error');
	});
}

function updateJournals() {
	$.ajax({
		type: 'GET',
		url: `/journals?userid=${MT_USER}`,
		contentType: 'application/json',
		beforeSend: MT_AUTH_BEFORESEND
	})
	.done(res => {
		const list = $('.mt-dashboard-journals ul');
		list.empty();
		for(let j of res.journals)
			list.append(`<li><span>${j.title}</span></li>`);
	})
	.fail(() => window.location.href = '/error');
}

$(function() {
	handleDashboardControls();
	updateJournals();
});