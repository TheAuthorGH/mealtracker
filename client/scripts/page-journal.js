'use strict';

const MT_JOURNAL = new URL(window.location).searchParams.get('id');

if(MT_JOURNAL === null)
	window.location.href = '/dashboard';

let currentPage = 0;

function clearEntryForm() {
	$('.mt-journal-addentry').find('input, textarea').val('');
}

function uploadJournalEntry(title, desc) {
	$.ajax({
		type: 'POST',
		url: `/journals/entries?id=${MT_JOURNAL}`,
		dataType: 'json',
		contentType: 'application/json',
		beforeSend: MT_AUTH_BEFORESEND,
		data: JSON.stringify({
			title: title.trim(),
			description: desc
		})
	})
	.done(() => {
		console.log('Uploaded');
	})
	.fail(() => window.location.href = '/error');
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
		$.ajax({
			type: 'POST',
			url: `/journals/entries?id=${MT_JOURNAL}`,
			dataType: 'json',
			contentType: 'application/json',
			beforeSend: MT_AUTH_BEFORESEND,
			data: JSON.stringify({
				title: $('#mt-journal-addentry-title').val().trim(),
				description: $('#mt-journal-addentry-description').val().trim()
			})
		})
		.done(() => {
			clearEntryForm();
			updateEntries();
		})
		.fail(() => window.location.href = '/error');
	});

	$('.mt-journal-entries-pagination').on('click', '.mt-journal-entries-pagination-page', function() {
		updateEntries(Number($(this).attr('mt-journal-page')));
	});

}

function updateEntries(page = currentPage) {
	if(page < 0)
		return;
	$.ajax({
		type: 'GET',
		url: `/journals?id=${MT_JOURNAL}`,
		contentType: 'application/json',
		beforeSend: MT_AUTH_BEFORESEND
	})
	.done(res => {
		const journal = res.journal;
		$('title').text('MealTracker - ' + journal.title);
		$('h2').first().text('Journal - ' + journal.title);
		$.ajax({
			type: 'GET',
			url: `/journals/entries?id=${MT_JOURNAL}&perpage=10&page=${page}`,
			contentType: 'application/json',
			beforeSend: MT_AUTH_BEFORESEND
		})
		.done(res => {
			if(page >= res.pages)
				return;
			currentPage = page;

			$('.mt-journal-noentries, .mt-journal-entries, .mt-journal-addentry').hide().prop('hidden', true);
			$('.mt-journal-entries > ul, .mt-journal-entries-pagination').empty();

			for(let c = -2; c < 3; c++) {
				const p = page + c;
				let button;
				if(p < 0 || p >= res.pages)
					button = '<button class="mt-empty"></button>';
				else
					button = `<button class="mt-journal-entries-pagination-page${p == page ? ' mt-selected' : ''}" mt-journal-page="${p}">${p + 1}</button>`;
				$('.mt-journal-entries-pagination').append(button);
			}

			const entries = res.entries;
			if(entries.length === 0) {
				$('.mt-journal-noentries').show();
			} else {
				for(let e of entries)
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