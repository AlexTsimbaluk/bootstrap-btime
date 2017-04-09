var dateStart = new Date().getTime();

$(document).ready(function() {

	/*var dateReady = new Date().getTime();
	console.log(dateReady, dateStart);
	console.log(dateReady - dateStart);*/


});

$(window).load(function() {

	var dateLoad = new Date().getTime();
	// console.log(dateLoad, dateStart);
	console.log(dateLoad - dateStart);

	// Preloader
	$(".loader_inner").fadeOut();
	$(".loader").delay(400).fadeOut("slow");

});

