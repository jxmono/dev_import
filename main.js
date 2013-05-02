var self;

module.exports = function (config) {
    
    self = this;
    
    handlers();
}

function handlers() {

    $(".btn-import").on("click", function() {

        var btn = $(this);

        // UI
        btn.hide();
        var spn = $('.importSpinner', self.dom).clone();
        spn.insertAfter(this);

        // prepare the link parameters
        var data = {
            type: btn.attr("data-type"),
            subtype: btn.attr("data-subtype")
        };

        // do some error checks
        // "a" for applications, "m" for modules
        if (!data.type.match(/^a|m$/)) {
            showError("Invalid import type: " + data.type + ". Valid types are: module, application");
            uiBack(btn, spn);
            return;
        }

        if (!data.subtype.match(/^owner|member$/)) {
            showError("Invalid import subtype: " + data.subtype + ". Valid subtypes are: owner, collaborator");
            uiBack(btn, spn);
            return;
        }

        // and go for it!
        // Import applications (data: "a")
        self.link("importProjects", { "data": data }, function (err, data) {

            if (err) {
                showError(err);
            }
            else {
                self.emit("importedOwned");
            }

            uiBack(btn, spn);
        });

        // return false otherwise this could cause problems if this is an <a> tag
        return false;
    });
}

function uiBack(btn, spn) {
    spn.remove();
    btn.show();
}

function showError(error) {
    $(".error-message", self.dom).text(error); 
    $("#modal-error", self.dom).modal("show");
}
