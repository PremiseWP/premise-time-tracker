/**
 * Premise Time Tracker main JS file.
 *
 * @package Premise Time Tracker\JS
 */
(function($){

	$(document).ready( function() {
		pwpTimeTracker();
	} );

	/**
	 * Premise Time Tracker main object
	 *
	 * @return {object} class for our main object
	 */
	function pwpTimeTracker() {
		// for efficiency, reference the elements that will not change in our DOM.
		var timersLoop = $( '#pwptt-loop-wrapper'),                                            // the loop wrapper
		tcSearch       = $( '.pwptt-search' ),                                                 // the search field
		quickChange    = $( '#pwptt-quick-change' ),                                           // the quick change select element
		tcAuthor       = $( '#pwptt-author' ),                                                 // the author select element
		tcWrapper      = $( '#pwptt-body' ),                                                   // the timers loop wrapper
		totalHours     = $( '.pwptt-total-hours' ),                                            // the element that holds the total hours
		isIframe       = $( '.iframe' ).length,                                                // Is viewed inside Chrome extension iframe?
		restClientFrame,

  		loadingIcon    = '<p class="pwptt-loading"><i class="fa fa-spin fa-spinner"></i></p>', // loading icon html
		wpajaxurl      = pwptt_localized.wpajaxurl;                                            // url for WP admin ajax

		// run our code
		var init = function() {

			if ( isIframe ) {

				window.addEventListener("message", receiveEditMessage, false);

				iframeEditClick();
			}

			( timersLoop.length ) ? bindEvents() : false;
		};

		var iframeEditClick = function() {

			$( '.pwptt-iframe-edit a' ).on( 'click', function( e ) {

				e.preventDefault();

				// Get URL.
				var url = $(this).attr('href');

				// Open URL in parent frame:
				// Send message with URL.
				restClientFrame.postMessage(url, '*');

				return false;
			});
		};

		var receiveEditMessage = function(event) {
			console.log(event.origin);

			// Do we trust the sender of this message?
			/*if (event.origin.indexOf( "iframe://" ) !== 0 )
				return;*/

			// console.log(event.data);

			if (event.data !== 'edit')
				return;

			restClientFrame = event.source;

			window.removeEventListener("message", receiveEditMessage);
		};


		// bind events for elements that exist in DOM
		var bindEvents = function() {
			// bind search event if the field exists
			if ( tcSearch.length ) {
				tcSearch.change( doSearch );
				tcSearch.keyup( function( e ) {
					( 13 === e.keyCode ) ? doSearch : false;
				} );
			}
			// bind quickchange if the field exists
			if ( quickChange.length ) {
				quickChange.change( function( e ) {
					e.preventDefault();
					// display loading icon
					loading();
					// empty the search field
					tcSearch.val('');

					var ajaxPost = {
						action:       'ptt_search_timers',
						quick_change: $(this).val(),
						taxonomy:     tcSearch.attr( 'data-tax' ),
						slug:         tcSearch.attr( 'data-slug' )
					};

					if ( isIframe ) {

						ajaxPost.iframe = true;
					}

					window.history.pushState(
						{},
						'title',
						'?week='+ajaxPost.quick_change
					);

					$.post( wpajaxurl, ajaxPost, updateLoop );

					return false;
				} );
			}
			// bind author if the field exists
			if ( tcAuthor.length ) {
				tcAuthor.change( function( e ) {
					e.preventDefault();
					// display loading icon
					loading();
					// empty the search field
					tcSearch.val('');

					var ajaxPost = {
						action:   'ptt_search_timers',
						author:   $(this).val(),
						taxonomy: tcSearch.attr( 'data-tax' ),
						slug:     tcSearch.attr( 'data-slug' )
					};

					if ( isIframe ) {

						ajaxPost.iframe = true;
					}

					$.post( wpajaxurl, ajaxPost, updateLoop );

					return false;
				} );
			}
		};

		// do the search
		var doSearch = function( e ) {
			var $this = $(this),
			s         = $this.val() ?  $this.val() : '',
			_taxonomy = $this.attr( 'data-tax' ),
			_slug     = $this.attr( 'data-slug' ),
			_regexp   = new RegExp( "^(([0-9]{1,2})/([0-9]{1,2})/([0-9]{2,4})) ?(-) ?(([0-9]{1,2})/([0-9]{1,2})/([0-9]{2,4}))$", "g" ),
			_isDate   = s.match( _regexp );

			if ( _isDate ) {
				// display loading icon
				loading();
				// get date range
				var dateRange = _isDate[0].split( '-' );

				var ajaxPost = {
					action:     'ptt_search_timers',
					taxonomy:   _taxonomy,
					slug:       _slug,
					date_range: {
						from: dateRange[0],
						to:   dateRange[1],
					},
				};

				if ( isIframe ) {

					ajaxPost.iframe = true;
				}

				window.history.pushState({}, 'title', '?range='+dateRange[0].trim()+'-'+dateRange[1].trim());
				// call our ajax search
				$.post( wpajaxurl, ajaxPost, updateLoop );

			}

			return false;
		};

		init();

		/*
			Helpers
		 */

		// show loading icon
		function loading() {
			tcWrapper.html( loadingIcon );
		};

		// handle the ajax response and update total
		function updateLoop( r ) {
			tcWrapper.html( r );
			updateTotal();
			if ( isIframe ) {
				iframeEditClick();
			}
			return false;
		};

		// updates the total based on the time cards being viewed
		function updateTotal() {
			var th = 0.00;
			// cannot refernce element since it changes in DOM
			$( '.pwptt-time-card-time' ).each( function() {
				th = ( parseFloat( $(this).text() ) + parseFloat( th ) );
				totalHours.html( th );
			} );
		};
	};

})(jQuery);
