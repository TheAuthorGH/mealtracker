'use strict';

const SEARCHPARAMS = new URL(window.location).searchParams;

const MT_JOURNAL = SEARCHPARAMS.get('id');

if(MT_JOURNAL === null)
	window.location.href = '/dashboard';

let perpage = Number(SEARCHPARAMS.get('perpage')) || 10;
let currentPage = 0;

function clearEntryForm() {
	$('.mt-journal-addentry').find('input, textarea').val('');
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
			url: `/journals/entries?journalid=${MT_JOURNAL}&userid=${Cookies.get('mt_user')}`,
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
			updateInsights();
		})
		.fail(() => window.location.href = '/error');
	});

	$('.mt-journal-entries-pagination').on('click', '.mt-journal-entries-pagination-page', function() {
		window.location.href = `/journal?id=${MT_JOURNAL}&perpage=${perpage}&page=${Number($(this).attr('mt-journal-page')) + 1}`;
	});
	$('.mt-journal-entries-pagination').on('click', '.mt-journal-entries-pagination-first', function() {
		window.location.href = `/journal?id=${MT_JOURNAL}&perpage=${perpage}&page=first`;
	});
	$('.mt-journal-entries-pagination').on('click', '.mt-journal-entries-pagination-last', function() {
		window.location.href = `/journal?id=${MT_JOURNAL}&perpage=${perpage}&page=last`;
	});

	$('.mt-journal-entries > ul').on('click', '.mt-journal-entry-remove', function() {
		const entryId = $(this).closest('li').attr('mt-journal-entry-id');
		$.ajax({
			type: 'DELETE',
			url: `/journals/entries?journalid=${MT_JOURNAL}&userid=${Cookies.get('mt_user')}&entryid=${entryId}`,
			beforeSend: MT_AUTH_BEFORESEND
		})
		.done(updateEntries);
	});
}

function updateEntries(page = currentPage) {
	$.ajax({
		type: 'GET',
		url: `/journals?journalid=${MT_JOURNAL}&userid=${Cookies.get('mt_user')}`,
		contentType: 'application/json',
		beforeSend: MT_AUTH_BEFORESEND
	})
	.done(res => {
		const journal = res.journal;
		$('title').text('MealTracker - ' + journal.title);
		$('h2').first().text('Journal - ' + journal.title);
		$.ajax({
			type: 'GET',
			url: `/journals/entries?journalid=${MT_JOURNAL}&userid=${Cookies.get('mt_user')}&perpage=${perpage}&page=${page}`,
			contentType: 'application/json',
			beforeSend: MT_AUTH_BEFORESEND
		})
		.done(res => {
			currentPage = res.page;

			$('.mt-journal-noentries, .mt-journal-entries, .mt-journal-addentry').hide().prop('hidden', true);
			$('.mt-journal-entries > ul, .mt-journal-entries-pagination').empty();

			const pagination = $('.mt-journal-entries-pagination');
			pagination.append('<button class="mt-journal-entries-pagination-first"><span class="fas fa-angle-double-left"></span></button>');
			for(let c = -2; c < 3; c++) {
				const p = currentPage + c;
				let button;
				if(p < 0 || p >= res.pages)
					button = '<button class="mt-empty" disabled></button>';
				else
					button = `<button class="mt-journal-entries-pagination-page${p == currentPage ? ' mt-selected' : ''}" mt-journal-page="${p}">${p + 1}</button>`;
				pagination.append(button);
			}
			pagination.append('<button class="mt-journal-entries-pagination-last"><span class="fas fa-angle-double-right"></span></button>');

			const entries = res.entries;
			if(entries.length === 0) {
				$('.mt-journal-noentries').show();
			} else {
				for(let e of entries)
					$('.mt-journal-entries > ul').append(`
						<li mt-journal-entry-id="${e.id}">
							<div>
								<span>${e.title}</span>
								<button class="mt-journal-entry-expand mt-button-square"><span class="fas fa-fw fa-eye"></span></button>
							</div>
							<div>
								<div class="mt-journal-entry-details">
									<p>${e.description}<p>
									<time>${formatDate(new Date(e.date))}</time>
								</div>
								<div class="mt-journal-entry-controls">
									<button class="mt-journal-entry-edit mt-button-square"><span class="fas fa-fw fa-pencil-alt"></span></button>
									<button class="mt-journal-entry-remove mt-button-square"><span class="fas fa-fw fa-times"></span></button>
								</div>
							</div>
						</li>
					`);

				if(currentPage === res.pages - 1)
					$('.mt-journal-entries-pagination-last').attr('disabled', true).addClass('mt-selected');
				if(currentPage === 0)
					$('.mt-journal-entries-pagination-first').attr('disabled', true).addClass('mt-selected');

				$('.mt-journal-entries').show();
			}
		})
		.fail(() => window.location.href = '/error');
	})
	.fail(() => window.location.href = '/error');
}

function updateInsights() {
	$.ajax({
		type: 'GET',
		url: `/journals/insights?journalid=${MT_JOURNAL}&userid=${Cookies.get('mt_user')}`,
		contentType: 'application/json',
		beforeSend: MT_AUTH_BEFORESEND
	})
	.done(res => {
		$('.mt-journal-insights > ul').empty();
		for(let i of res.insights)
			$('.mt-journal-insights > ul').append(`<li>${i}</li>`);
	})
	.fail(() => window.location.href = '/error');
}

$(function() {
	checkAuth().then(() => {
		handleJournalControls();

		let page = SEARCHPARAMS.get('page');
		if(page)
			updateEntries(isNaN(page) ? page : Number(page) - 1);
		else
			updateEntries();
	
		updateInsights();
	});
});