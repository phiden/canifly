$(document).ready(function() {

    var icao;

    $('.submit-station').click(function(e) {

      e.preventDefault();
      icao = ""; // clear out whatever was in there
      icao = $('#input-station').val();

      $.ajax({
        type: 'GET',
        url: 'https://api.checkwx.com/taf/' + icao + '/decoded',
        headers: { 'X-API-Key': '0b91b390b1eb0a5688e077858c' },
        dataType: 'json',
        success: function (result) {
          var forecasts = result.data[0].forecast;
          displayForecast(forecasts);
          console.log(forecasts)
        },
        error: function (error) {
          console.log(error);

          // write a function that explains the error
        }
      });

    }) // close on submit

    function displayForecast(data) {

      console.log(data);
      $('#search-result h3').removeClass('hidden');
      $('#station-id').replaceWith(icao);

      data.forEach(displayData);

    }

    function displayData(taf) {

      var clouds = taf.clouds[0].base_feet_agl;
      var forecast_from = taf.timestamp.forecast_from;
      var forecast_to = taf.timestamp.forecast_to;
      var visibility_mi = taf.visibility.miles;
      var wind_direction = taf.wind.degrees;
      var windspeed = taf.wind.speed_kts;

      var forecast =
        "<div class='forecast'><p><b>Forecast valid from:</b>" + forecast_from + "<b> to: </b>" + forecast_to + "</p>" +
        "<p><b>Clouds: </b>" + clouds + " feet AGL</p>" +
        "<p><b>Visibility: </b>" + visibility_mi + " miles</p>" +
        "<p><b>Winds: </b>" + wind_direction + " degrees at " + windspeed + " kts</p></div>";

      $('#taf').append(forecast);
    }
});
