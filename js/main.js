$(document).ready(function() {

    var icao;
    var isVFR = false;
    var tafs = [];

    // console.log("Moment: ", moment().format("dddd, MMMM Do YYYY, h:mm:ss a"))
    var currentTime = moment().format("dddd, MMMM Do YYYY, h:mm:ss a") + " ET";

    $('#current-time').append(currentTime);

    $('.submit-station').click(function(e) {

      icao = ""; // clear out whatever was in there

      // check for 'k' prefix
      icao = $('#input-station').val();

      console.log('icao: ', icao);

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

      console.log(icao, data);
      $('#search-result').removeClass('hidden');
      $('#station-id').replaceWith("<span id='station-id'>" + icao + "</span>");
      data.forEach(displayData);

    }

    function displayData(taf) {

      // clean out tafs array
      tafs = [];

      // instead of icao, display name:
      var name;

      // clear skies? default to true
      var clearSky = true;

      // check for change indicator in the data; if not present ignore report
      if (validate(taf.change_indicator && taf.change_indicator != "Probable")) {

        var forecast = "";
        var winds = "";
        var sky = "";

        // validate from - to
        var forecast_from = validate(taf.timestamp.forecast_from) ? taf.timestamp.forecast_from : null;
        var forecast_to = validate(taf.timestamp.forecast_to) ? taf.timestamp.forecast_to : null;

        // check that the data exist
        var ceiling = validate(taf.clouds) ? taf.clouds[0].code : null;

        //if the ceiling isn't BKN or OVC, check altitude
        if(ceiling != null && ceiling == "BKN" || ceiling == "OVC") {

          // 14 CFR 91.155 says that < 10k ft you need to be 500 ft
          // below the clouds; setting the min at 3000 ft assuming that
          // 2500 ft is a decent cruise altitude. verify w/P
          if(taf.clouds[0].base_feet_agl < 3000) {
            clearSky = false;
          }
        }

        if(validate(taf.wind)) {
          winds = "<p><b>Winds: </b>" + taf.wind.degrees+ " degrees at " + taf.wind.speed_kts + " kts</p></div><hr/>";
        }

        var visibility;
        validate(taf.visibility) ? visibility = taf.visibility.miles : visibility = null;

        if (determineVFR(visibility, clearSky)) {

          forecast = "<div class='forecast vfr'><p><b>Forecast valid from: </b>" + forecast_from + "<b> to: </b>" + forecast_to + "</p>" + "clouds" +
          "<p><b>Visibility: </b>" + visibility + " miles</p>" +
          winds;

        } else {
          forecast = "<div class='forecast'><p><b>Forecast valid from: </b>" + forecast_from + "<b> to: </b>" + forecast_to + "</p>" + "clouds" +
          "<p><b>Visibility: </b>" + visibility + " miles</p>" +
          winds;

        }

        // array contains vfr status, [0] is current time
        tafs.push(determineVFR(visibility, clearSky));
        $('#taf').append(forecast);

        if(tafs[0] && tafs[0] != undefined) {

          $('#go-fly').replaceWith("<span id='go-fly' class='blue'>Yes! Conditions are currently VFR at " + icao + ". Go fly.</span>");
          $('#disclaimer').removeClass('hidden');

        } else if (tafs[0] == false) {

          $('#go-fly').replaceWith("<span id='go-fly' class='red'>Nope. Conditions are currently not VFR at " + icao +"</span>");
          $('#disclaimer').addClass('hidden'); // just in case it's been removed previously
        }

      }
    }

    function determineVFR(vis, clearSky) {
      // min 3 mi visibility (should be 1 mile in G), ceiling > 3000 -- verify source
      // add minimums -- ceiling, winds, cloud type (bkn ovc scattered/few), visibility, day/night

      //
      if(vis != null && vis.length > 1) {
        vis = vis.split(" ")[2];
      }

      //console.log('determineVFR: ', clouds, vis);
      if(Number(vis) > 3 && clearSky) {
        return true;
      } else {
        return false;
      }

    }

    $('#what-is-this-toggle').click(function() {

      $('#what-is-this').slideToggle("slow");

    })


    function validate(data) {
      if(data != undefined) {
        return true;
      }
    }

}); // close file
