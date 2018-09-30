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
           console.log(result)
        },
        error: function (error) {
          console.log(error);
        }
      });

    }) // close on submit
});
