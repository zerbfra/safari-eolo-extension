/*
 * Copyright 2015 - Francesco Zerbinati (@zerbfra)
 * Released under the terms of GNU GPL 3 or later.
 *
 * https://github.com/zerbfra/safari_eolo_extension
 *
 * Copyright 2012 - Davide Alberani <da@erlug.linux.it>
 * Released under the terms of GNU GPL 3 or later.
 *
 * https://github.com/alberanid/chrome_eolo_extension
*/


var REMOTE_URL = 'https://care.ngi.it/ws/ws.asp';
var REMOTE_QUERY_ARGS = {a: 'get.quota'};
var QUERY_TIMEOUT_MS = 10000;
var _QUERY_RUNNING = false;


/* Fetch remote data and call the appropriate callback. */
function fetch_data(successCb, errorCb) {
	if (_QUERY_RUNNING) {
		return;
	}

	_QUERY_RUNNING = true;
	$.ajax({
		url: REMOTE_URL,
		data: REMOTE_QUERY_ARGS,
		dataType: 'json',
		timeout: QUERY_TIMEOUT_MS,
		success: function(data, textStatus, jqXHR) {
			_QUERY_RUNNING = false;
			if (data && data.response && data.response['status'] == 200) {
				var now = new Date();

				localStorage['last_check'] = now.getTime();
				localStorage['last_data'] = JSON.stringify(data);
				successCb(data);
			} else {
				// here we can implement an error callback function
			}
		},
		error: function(jqXHR, textStatus, errorThrown) {
			_QUERY_RUNNING = false;
			// here we can implement an error callback function
		}
	});
}


/* Replace information with a spinner. */
function show_spinners() {
	$('.ajax_info').html('<i class="fa fa-spinner fa-spin"></i>');
}


/* Show collected data. */
function update_fields(data) {

	var traffic_left = $('#traffic_left');
	var traffic_left_percent = $('#traffic_left_percent');
	var traffic_total = $('#traffic_total');
	var voice_left = $('#voice_left');

	var success = true;
	var t_percent = null;
	var v_left = null;
	var resp = localStorage['last_data'];

	var last_check = localStorage['last_check'];
	console.log(last_check);

	if (resp) {
		resp = JSON.parse(resp);
	} else {
		resp = data;
	}
	if (resp.data) {

		var t_left = resp.data.used/ 1024;
        var t_total = resp.data.quota / 1024;
        
        var left_u = "MB";
        var total_u = "MB";

        if(t_left >= 1024) {
            t_left = t_left/1024;
            left_u = "GB";
        }
        if(t_total >= 1024) {
            t_total = t_total/1024;
            total_u = "GB";
        }



		t_percent = (resp.data.used / resp.data.quota) * 100;
		traffic_left.text(t_left.toFixed(2)+" GB ("+t_percent.toFixed(1)+"%)");
		traffic_left_percent.text(t_percent.toFixed(1)+"%");
		traffic_total.text(t_total.toFixed(2)+" GB");
		
	} else {
		traffic_left.text('-');
		traffic_left_percent.text('-');
		traffic_total.text('-');
		success = false;
	}
	if (resp.voice) {
		v_left = resp.voice.credit;
		voice_left.html(v_left.toFixed(2)+" &#8364;");
	} else {
		voice_left.text('-');
		success = false;
	}

	return success;
}


/* Things to do when the popup is shown. */
function open_popup() {
	//localizePage();

	safari.self.height = 110;
	safari.self.width = 260;

	var _errorCb = function(error, msg) {
		update_fields();
		add_info(msg, 'errors');
	};
	$('#refresh').click(function() {
		show_spinners();
		fetch_data(update_fields,null);

	});
	show_spinners();
	fetch_data(update_fields,null);
}


$(document).ready(open_popup);

