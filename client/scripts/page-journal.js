'use strict';

const MT_JOURNAL = new URL(window.location).searchParams.get('id');

if(MT_JOURNAL === null)
	window.location.href = '/dashboard';

function clearEntryForm() {
	$('.mt-journal-addentry input').val('');
}

function handleJournalControls() {
	$('.mt-journal-addentry').hide().prop('hidden', true);
	$('.mt-journal-addentry-open').click(function() {
		$('.mt-journal-addentry').show().prop('hidden', false);
		$('.mt-journal-noentries, .mt-journal-entries').hide().prop('hidden', true);
		clearEntryForm();
	});

	$('.mt-journal-addentry').submit(function(evt) {
		evt.preventDefault();
		const title = $('#mt-journal-addentry-title');
		$.ajax({
			type: 'POST',
			url: `/journals/entries?id=${MT_JOURNAL}`,
			dataType: 'json',
			contentType: 'application/json',
			beforeSend: MT_AUTH_BEFORESEND,
			data: JSON.stringify({
				title: title.val()
			})
		})
		.done(() => {
			clearEntryForm();
			updateEntries();
		})
		.fail(() => window.location.href = '/error');
	});
}

function updateEntries() {
	$('.mt-journal-noentries, .mt-journal-entries, .mt-journal-addentry').hide().prop('hidden', true);
	$('.mt-journal-entries > ul').empty();
	$.ajax({
		type: 'GET',
		url: `/journals?id=${MT_JOURNAL}`,
		contentType: 'application/json',
		beforeSend: MT_AUTH_BEFORESEND
	})
	.done(res => {
		const journal = res.journal;
		$('title').text('MealTracker - ' + journal.title);
		$('h2').text('Journal - ' + journal.title);
		$.ajax({
			type: 'GET',
			url: `/journals/entries?id=${MT_JOURNAL}&perpage=10&page=0`,
			contentType: 'application/json',
			beforeSend: MT_AUTH_BEFORESEND
		})
		.done(res => {
			if(res.length === 0) {
				$('.mt-journal-noentries').show();
			} else {
				res.sort((e, f) => new Date(f.date) - new Date(e.date));
				for(let e of res)
					$('.mt-journal-entries > ul').append(`<li mt-journal-entry-id="${e.id}"><span>${e.title}</span><time>${formatDate(new Date(e.date))}</time></li>`);
				$('.mt-journal-entries').show();
			}
		})
		.fail(() => window.location.href = '/error');
	})
	.fail(() => window.location.href = '/error');
}

$(function() {
	updateEntries();
	handleJournalControls();
});