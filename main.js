var self;

module.exports = function (config) {
    
    self = this;
    
    handlers();
}

function handlers() {

    $(".btn-import", self.dom).on("click", function() {
        importApplications();       
    });
}

function importApplications() {

    $(".spinner", self.dom).fadeIn();
    $(".btn-import", self.dom).attr("disabled", "");

    self.link("importApps", function (err, data) {

        $(".btn-import", self.dom).removeAttr("disabled");
        $(".spinner", self.dom).fadeOut();
       
        if (err) {
           
            $(".error-message", self.dom).text(err); 
            $("#modal-error", self.dom).modal("show");
        }
    });
}
