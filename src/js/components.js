$(document).ready(function() {
	// load sidebar content using AJAX
	$.ajax({
		url: "../components/sidebar.html",
		cache: false,
		success: function(html) {
			$("#sidebar-collapse").html(html);
		}
	});
});

$(document).ready(function() {
	// load sidebar content using AJAX
	$.ajax({
		url: "../components/header.html",
		cache: false,
		success: function(html) {
			$("#header-collapse").html(html);
		}
	});
});

    $(document).ready(function() {
  // Add Room button click event
  $("#add-room-btn").click(function() {
    // Show the Add Room modal
    $("#addRoomModal").modal("show");
  });
  
  // Add Room form submit event
  $("#addRoomBtn").click(function() {
    // TODO: Add code to handle form submission
  });
});

$(document).ready(function() {
	$("#add-customer-btn").click(function() {
	  // Show the Add Room modal
	  $("#addCustomerModal").modal("show");
	});
	
  });
  








