$( document ).ready(function() {
		
	$("#fullList").on("click", function() {
		$("#fullListOutput").show();
		$(".image").show();
		$("#malesOutput").hide();
		$("#femalesOutput").hide();
		$("#byLetterOutput").hide();
		console.log("full list");
	});
	
	$("#males").on("click", function() {
		$("#fullListOutput").hide();
		$("#malesOutput").show();
		$("#femalesOutput").hide();
		$("#byLetterOutput").hide();
		console.log("males");
	});
	
	$("#females").on("click", function() {
		$("#fullListOutput").hide();
		$("#malesOutput").hide();
		$("#femalesOutput").show();
		$("#byLetterOutput").hide();
		console.log("females");
	});
	
	$("#byLetter").on("click", function() {
		$("#fullListOutput").hide();
		$("#malesOutput").hide();
		$("#femalesOutput").hide();
		$("#byLetterOutput").show();
		console.log("letter");
	});
	
});

function swapClass(el){
	
	var kids = el.parentElement.children;
	
	for(var i = 0; i < kids.length; i++){
        kids[i].className = "color1";
    }
	
	el.className = "color2";
}