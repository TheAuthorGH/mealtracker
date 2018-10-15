function handleDashboardControls() {

	// Journals

	$('.mt-dashboard-addjournal').submit(function(evt) {
		evt.preventDefault();
		const input = $('.mt-dashboard-addjournal input');
		$.ajax({
			type: 'POST',
			url: '/journals',
			dataType: 'json',
			contentType: 'application/json',
			data: JSON.stringify({user: Cookies.get('mt_user'), title: input.val().trim()}),
			beforeSend: MT_AUTH_BEFORESEND
		})
		.done(() => {
			input.val('');
			updateJournals();
		})
		.fail(() => window.location.href = '/error');
	});

	$('.mt-dashboard-journals ul').on('click', 'li', function() {
		window.location.href = '/journal?id=' + $(this).attr('mt-journal-id');
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
		const journals = res.journals.sort((j, k) => {
			if(j.title > k.title) return 1; 
			else if(j.title < k.title) return -1;
			else return 0;
		});
		for(let j of journals)
			list.append(`
				<li mt-journal-id="${j.id}">
					<span>${j.title}</span>
				</li>`);
	})
	.fail(() => window.location.href = '/error');
}

$(function() {
	checkAuth()
		.then(() => {
			handleDashboardControls();
			updateJournals();
		});
});