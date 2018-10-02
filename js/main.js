$(document).ready(function() {

    var icao;
    var isVFR = false;
    var tafs = [];

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
          // console.log(forecasts)
        },
        error: function (error) {
          console.log(error);

          // write a function that explains the error
        }
      });

    }) // close on submit

    function displayForecast(data) {

      // console.log(data);
      $('#search-result').removeClass('hidden');
      $('#station-id').replaceWith(icao);

      // console.log("Moment: ", moment().format("dddd, MMMM Do YYYY, h:mm:ss a"))
      var currentTime = moment().format("dddd, MMMM Do YYYY, h:mm:ss a") + " ET";
      $('#current-time').append(currentTime);
      data.forEach(displayData);

    }

    function displayData(taf) {

      // ignore temporary TAF. Sloppy, sloppy
      if(taf.change_indicator != undefined && taf.change_indicator != "Temporary") {

        var forecast = "";
        var winds = "";
        var clouds = "";
        var forecast_from = taf.timestamp.forecast_from;
        var forecast_to = taf.timestamp.forecast_to;
        var visibility_mi = taf.visibility.miles;

        if(taf.clouds != undefined) {
          var clouds_raw = taf.clouds[0].base_feet_agl;
          var clouds = "<p><b>Clouds: </b>" + clouds_raw + " feet AGL</p>";
        }

        if(taf.wind != undefined) {
          winds = "<p><b>Winds: </b>" + taf.wind.degrees+ " degrees at " + taf.wind.speed_kts + " kts</p></div><hr/>";
        }

        if (determineVFR(clouds_raw, visibility_mi)) {

          forecast = "<div class='forecast vfr'><p><b>Forecast valid from: </b>" + forecast_from + "<b> to: </b>" + forecast_to + "</p>" + clouds +
          "<p><b>Visibility: </b>" + visibility_mi + " miles</p>" +
          winds;

        } else {
          forecast = "<div class='forecast'><p><b>Forecast valid from: </b>" + forecast_from + "<b> to: </b>" + forecast_to + "</p>" + clouds +
          "<p><b>Visibility: </b>" + visibility_mi + " miles</p>" +
          winds;

        }

        // array contains vfr status, [0] is current time
        tafs.push(determineVFR(clouds_raw, visibility_mi));
        $('#taf').append(forecast);
        $('#disclaimer').removeClass('hidden');
        
        if(tafs[0] || tafs[0] != undefined) {
          $('#go-fly').replaceWith("<h1 id='go-fly'>Conditions are currently VFR at " + icao + ". Go fly.<a href='#disclaimer'>*</a></h1>")
        }
      }
    }

    function determineVFR(clouds, vis) {
      // min 3 mi visibility, ceiling > 3000 -- verify source
      if(vis.length > 1) {
        vis = vis.split(" ")[2];
      }

      // console.log(clouds, vis);
      if(Number(clouds) > 3000 && Number(vis) > 3) {
        return true;
      } else {
        return false;
      }

    }
});
