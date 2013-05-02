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
            showError("Invalid import subtype: " + data.subtype + ". Valid subtypes are: owner, member");
            uiBack(btn, spn);
            return;
        }

        // and go for it!
        // Import applications (data: "a")
        self.link("importProjects", { "data": data }, function (err, projects) {

            if (err) {
                showError(err);
            }
            else {
                var message = "imported" + capitalizeFirstLetter(data.subtype) + "Apps";
                self.emit(message);
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

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
