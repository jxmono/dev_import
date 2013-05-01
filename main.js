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
        if (!data.type.match(/^application|module$/)) {
            showError("Invalid import type: " + data.type + ". Valid types are: module, application");
            uiBack(btn, spn);
            return;
        }
        if (!data.subtype.match(/^owner|collaborator$/)) {
            showError("Invalid import subtype: " + data.subtype + ". Valid subtypes are: owner, collaborator");
            uiBack(btn, spn);
            return;
        }

        // and go for it!
        self.link("importApps", function (err, data) {

            if (err) {
                showError(err);
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
