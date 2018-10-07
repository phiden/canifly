$(document).ready(function() {

    var icao;
    var isVFR = false;
    var tafs = [];

    // console.log("Moment: ", moment().format("dddd, MMMM Do YYYY, h:mm:ss a"))
    var currentTime = moment().format("dddd, MMMM Do YYYY, h:mm:ss a") + " ET";
    $('#current-time').append(currentTime);

    $('.submit-station').click(function(e) {

      icao = ""; // clear out whatever was in there
      icao = $('#input-station').val();

      console.log('icao: ', icao);

      $.ajax({
        type: 'GET',
        url: 'https://api.checkwx.com/metar/' + icao + '/decoded',
        headers: { 'X-API-Key': '0b91b390b1eb0a5688e077858c' },
        dataType: 'json',
        success: function (result) {

          console.log(result.data);
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

      console.log(icao);
      $('#search-result').removeClass('hidden');
      $('#station-id').replaceWith("<span id='station-id'>" + icao + "</span>");
      data.forEach(displayData);

    }

    function displayData(taf) {

      // clean out tafs array
      tafs = [];

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

        // console.log("TAFs ", tafs[0])

        if(tafs[0] && tafs[0] != undefined) {

          $('#go-fly').replaceWith("<span id='go-fly' class='blue'>Yes! Conditions are currently VFR at " + icao + ". Go fly.</span>");
          $('#disclaimer').removeClass('hidden');

        } else if (tafs[0] == false) {

          $('#go-fly').replaceWith("<span id='go-fly' class='red'>Nope. Conditions are currently not VFR at " + icao +"</span>");
          $('#disclaimer').addClass('hidden'); // just in case it's been removed previously
        }
      }
    }

    function determineVFR(clouds, vis) {
      // min 3 mi visibility, ceiling > 3000 -- verify source
      // add minimums -- ceiling, winds, cloud type (bkn ovc scattered/few), visibility, day/night
      if(vis.length > 1) {
        vis = vis.split(" ")[2];
      }

      //console.log('determineVFR: ', clouds, vis);
      if(Number(clouds) > 3000 && Number(vis) > 3) {
        return true;
      } else {
        return false;
      }

    }

    $('#what-is-this-toggle').click(function() {

      $('#what-is-this').slideToggle("slow");

    })


}); // close file
