var packing = {};

//Empty variables to store the user's entries
  packing.province = '';
  packing.city = '';
  packing.startDate = '';
  packing.endDate = '';
  packing.occupation = '';
  packing.activity = '';
//Empty variables to store the weather high and rain
  packing.high = '';
  packing.rain = '';
 //Empty variables for the subcategories of weather
  packing.weather = '';
 // Empty variable for when someone is adding to the list
  packing.categoryOptions = '';
  packing.addedItem = '';



//Store province, city, occupation and activity preferences on change
$('input#province').on('change', function() {
	packing.province = $(this).val();
});
$('input#city').on('change', function() {
	packing.city = $(this).val();
});
$('select#occupation').on('blur', function() {
	packing.occupation = $(this).val();
});
$('select#activity').on('blur', function() {
	packing.activity = $(this).val();
});

//Store user's date entries into the variables when 'submit' is clicked, make the API call
$('button#submit-preferences').on('click', function(e) {
	e.preventDefault();
	packing.startDate = new Date ($('input#start-date').val());
	packing.startDate = $.format.date(packing.startDate, 'MMdd');
	packing.endDate = new Date ($('input#end-date').val());
	packing.endDate = $.format.date(packing.endDate, 'MMdd');
	//Get the weather
	packing.getWeather();
	//Delay getting lists because getting weather is slow
	setTimeout(packing.getLists, 2000);
	//Display the loader
	$('.loader').fadeIn();
});

//Get weather from API based on the user's selected country, city, and travel dates
packing.getWeather = function() {
	$.ajax({
		url: `http://api.wunderground.com/api/b9d637521ed85e6d/planner_${packing.startDate}${packing.endDate}/q/${packing.province}/${packing.city}.json`,
		type: 'GET',
		dataType: 'json',
	}).then(function(res) {
		packing.displayWeather(res);
	})
}
//Find the highs and lows of the weather and store them in variables
packing.displayWeather = function(data) {
	packing.high = data.trip.temp_high.avg.C;
	packing.rain = data.trip.chance_of.chanceofrainday.percentage;
	//Determine the subcategory of weather based on the temperature
	if (packing.high <= 5) {
		packing.weather = 'cold';
	} else if (packing.high > 5 && packing.high <= 20) {
		packing.weather = 'lukewarm';
	} else if (packing.high >= 21) {
		packing.weather = 'hot';
	}
	//It can also be rainy
	if (packing.rain >= 50) {
		packing.rain = 'rainy';
	}
}

//Get Lists from API based on the user's selected occupation, activity, and travel time/location temperatures
packing.getLists = function() {
	$.ajax({
		url: `https://api.airtable.com/v0/appeQnKnRykKVi84Q/Table%201?api_key=keyXYicuPJL6YOaE4`,
		type: 'GET',
		dataType: 'json',
	}).then(function(res) {
		packing.displayList(res);
		$('.loader').fadeOut();
	})
}
//Find the categories and subcategories and get the list of items
packing.displayList = function(data) {
	data.records.map(function(record) {
		// Add the default list
		if (record.fields.category === 'default') {
			$('ul#default-list').append(`<li><i class="fa fa-square-o" aria-hidden="true"></i> ${record.fields.Item}</li>`).fadeIn();
		}
		// Add the weather list
		else if (record.fields.subcategorytwo == packing.weather) {
			$('ul#weather-list').append(`<li><i class="fa fa-square-o" aria-hidden="true"></i> ${record.fields.Item}</li>`).fadeIn();
		} 
		// Add the rainy list
		else if (record.fields.subcategorytwo == packing.rain) {
			$('ul#weather-list').append(`<li><i class="fa fa-square-o" aria-hidden="true"></i> ${record.fields.Item}</li>`).fadeIn();
		}
		// Add the occupation list
		else if (record.fields.subcategorytwo == packing.occupation) {
			$('ul#occupation-list').append(`<li><i class="fa fa-square-o" aria-hidden="true"></i> ${record.fields.Item}</li>`).fadeIn();
		} 
		//Add the activity list
		else if (record.fields.subcategorytwo == packing.activity) {
			$('ul#activity-list').append(`<li><i class="fa fa-square-o" aria-hidden="true"></i> ${record.fields.Item}</li>`).fadeIn();
		}
	});
	$('ul#default-list').prepend(`<h4>Don't forget the essentials</h4>`);
	$('ul#weather-list').prepend(`<h4>Items for ${packing.weather} weather</h4>`);
	$('ul#occupation-list').prepend(`<h4>Items for a ${packing.occupation}</h4>`);
	$('ul#activity-list').prepend(`<h4>Items for when you ${packing.activity}</h4>`);
	$('#lists').append(`<small>Don't see something you need? <a class="add-modal" href="#">Add it here.</a></small>`);
}

//Change the square to checked
$('ul').on('click', 'li i', function() {
	$(this).toggleClass('fa-check-square-o fa-square-o');
	$(this).parent().toggleClass('checked');
});

//Open the modal on click
$('#lists').on('click', '.add-modal', function(e) {
	e.preventDefault();
	$('#modal-wrapper').fadeIn();
});
//Close the modal
$('.close').on('click', function() {
	$('#modal-wrapper').fadeOut();
});

//If 'weather' is chosen, show the extra weather options
$('#add-to-category').on('change', function() {
	packing.categoryOptions = $(this).val();
	if (packing.categoryOptions === 'weather') {
		$('#weather-type').fadeIn();
	} else {
		$('#weather-type').fadeOut();
	}
});

//Add the item to the list
$('.add-item').on('click', function(e) {
	e.preventDefault();
	$('#modal-wrapper').fadeOut();
	packing.addedItem = $('#new-item').val()
	$(`ul#${packing.categoryOptions}-list`).append(`<li><i class="fa fa-square-o" aria-hidden="true"></i> ${packing.addedItem}</li>`);
});


packing.init = function() {
}

$(function() {
	packing.init();
});


