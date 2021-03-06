function IsNumeric(val) {
    console.log(val);
    return Number(parseInt(val)) == val;
}

$(document).ready(function(){
    $("#generate-btn").click(async function (){
    
        
        $('#myModal').modal('toggle');

        $(function() {
            var current_progress = 10;
            var interval = setInterval(function() {
                current_progress += 4;
                $("#progress_bar")
                .css("width", current_progress + "%")
                .attr("aria-valuenow", current_progress)
                .text(current_progress + "% Complete");
                if (current_progress >= 100)
                    clearInterval(interval);
            }, 1000);
          });


        console.log("Button is pressed.");
        $.ajax({
            type: 'GET',
            contentType: 'application/json',
            url: '/index/recommend',						
            success: function(data){
                console.log(data);
            }
        });
    })
    $('.card').on('click', function(){
        console.log($(this).find("collapse"));
        $(this).find( ".collapse" ).collapse('toggle');
    });

        const stars = $(".stars_class select");
        var stars_id_array = Object.keys(stars).map(function(key) {
            if(IsNumeric(key)){
                return stars[key].id.split("_")[1];
            }
          }).filter(n => n);


          stars_id_array.forEach(function(element){
            $('#starsid_' + element).barrating('show',{
                theme: 'fontawesome-stars',
                onSelect: function(value, text, event){
                    console.log(element);
                    var data = {itemid: element, rating: value};
                    // An item is rated, we need to post this.
					$.ajax({
						type: 'POST',
						data: JSON.stringify(data),
				        contentType: 'application/json',
                        url: '/index',						
                        success: function(data){
                            $('#starsid_' + element).barrating('readonly', true);
                            var card_id = '#cardid_' + element;
                            $(card_id).addClass('bg-secondary text-white font-weight-bold');
                        }
                    });
                }
              });
        });

});