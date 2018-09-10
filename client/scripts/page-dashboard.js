function handleDashboardControls() {
	$('.mt-dashboard-addjournal').submit(function(evt) {
		evt.preventDefault();
		const input = $('.mt-dashboard-addjournal input');
		$.ajax({
			type: 'POST',
			url: '/journals',
			dataType: 'json',
			contentType: 'application/json',
			data: JSON.stringify({user: Cookies.get('mt_user'), title: input.val()}),
			beforeSend: MT_AUTH_BEFORESEND
		})
		.done(() => {
			input.val('');
			updateJournals();
		})
		.fail(() => window.location.href = '/error');
	});
}

function updateJournals() {
	$.ajax({
		type: 'GET',
		url: `/journals?userid=${Cookies.get('mt_user')}`,
		contentType: 'application/json',
		beforeSend: MT_AUTH_BEFORESEND
	})
	.done(res => {
		const list = $('.mt-dashboard-journals ul');
		list.empty();
		for(let j of res.journals)
			list.append(`
				<li mt-journal-id="${j.id}">
					<span>${j.title}</span>
				</li>`);
	})
	.fail(() => window.location.href = '/error');
}

$(function() {
	handleDashboardControls();
	updateJournals();
});