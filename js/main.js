$(document).ready(function() {
    // all custom jQuery will go here

    console.log('hello world');
    var icao;

    $('.submit-station').click(function(e) {

      e.preventDefault();
      console.log($('#input-station').val());
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
        }
      });

    }) // close on submit

    function displayForecast(data) {

      console.log(data);
      $('#station-id').append(icao);
      $('#search-result').append('data goes here');
    }
});
