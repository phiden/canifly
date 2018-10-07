$(document).ready(function() {

    var icao;
    var globalICAO; // ugh why
    var isVFR = false;
    var tafs = [];

    // console.log("Moment: ", moment().format("dddd, MMMM Do YYYY, h:mm:ss a"))
    var currentTime = moment().format("dddd, MMMM Do YYYY, h:mm:ss a") + " ET";

    $('#current-time').append(currentTime);

    // bind the enter key
    $('#input-station')[0].addEventListener("keyup", function(event) {
      event.preventDefault();
      // Number 13 is the "Enter" key on the keyboard
      if (event.keyCode === 13) {
        // Trigger the button element with a click
        $('.submit-station').click();
      }
    });

    // the mama function
    $('.submit-station').click(function(e) {

      icao = ""; // clear out whatever was in there
      // check for 'k' prefix
      icao = $('#input-station').val();
      icao = validate(icao) ? validateICAO(icao) : showError("no-icao");

    }) // close on submit

    function showError(err) {

      $('#error-container').removeClass('hidden');
      switch(err) {
        case "no-icao":
          $('#error').text("Please give us a 4-character airport code.");
          break;
        case "empty-icao":
          $('#error').text("Please give us a 4-character airport code.");
          break;
        case "wrong-length":
          $('#error').text("Your code's either too long or too short. Try again!");
          break;
        case "show-error":
          $('#error').text("Sorry, there's no data for that station. Try again!");
          break;
        default:
          $('#error').textContent = "";
          break;
      }
    }

    // validate ICAO code
    function validateICAO(icao) {

      // console.log('validating: ', icao);
      // is empty?
      if(icao == "") {
        showError("empty-icao");
      // has 3 chars?
      } else if(icao.length == 3) {
        //assume the initial 'k' was dropped off and add it
        icao = 'k' + icao;
        retrieveData(icao);
      } else if(icao.length > 4 || icao.length < 3) {
        showError("wrong-length");
      } else {
        retrieveData(icao);
      }
    }

    function retrieveData(icao) {

      // console.log('retrieve data for: ', icao);
      $.ajax({
        type: 'GET',
        url: 'https://api.checkwx.com/taf/' + icao + '/decoded',
        headers: { 'X-API-Key': '0b91b390b1eb0a5688e077858c' },
        dataType: 'json',
        success: function (result) {
          // make sure the returned data is what we need
          if(typeof(result.data[0]) == "object") {
            $('#station-id').replaceWith("<span id='station-id'>" + icao + "</span>");
            globalICAO = icao;
            displayForecast(result.data[0].forecast);
          } else {
            showError("show-error");
          }
        },
        error: function (error) {
          console.log(error);
        }
      });
    }

    function displayForecast(data) {
      // console.log("display: ", icao, data);
      $("#error-container").addClass('hidden');
      $('#search-result').removeClass('hidden');
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

          $('#go-fly').replaceWith("<span id='go-fly' class='blue'>Yes! Conditions are currently VFR at " + globalICAO + ". Go fly.</span>");
          $('#disclaimer').removeClass('hidden');

        } else if (tafs[0] == false) {

          $('#go-fly').replaceWith("<span id='go-fly' class='red'>Nope. Conditions are currently not VFR at " + globalICAO +"</span>");
          $('#disclaimer').addClass('hidden'); // just in case it's been removed previously
        }

      }
    }

    function determineVFR(vis, clearSky) {
      // min 3 mi visibility (should be 1 mile in G), ceiling > 3000 -- verify source
      // add minimums -- ceiling, winds, cloud type (bkn ovc scattered/few), visibility, day/night

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

    $('#what-is-this-toggle').click(function(e) {
      e.preventDefault();
      $('#what-is-this').slideToggle("slow");
    })

    function validate(data) {
      if(data != undefined) {
        return true;
      }
    }

}); // close file
