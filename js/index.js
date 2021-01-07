$(document).ready(function () {
    $("#contracts").DataTable({
        deferRender: true,
        ajax: function (_data, callback) {
            $.ajax({
                url: "/api/john/test/contracts",
                type: "GET",
                success: function (contracts) {
                    callback({
                        data: contracts.map(function (c) {
                            return {
                                contributor: c.id.username,
                                role: c.id.role,
                                hourlyRate: {
                                    value: c.hourlyRate,
                                    editingValue: c.hourlyRate,
                                    isEditing: false,
                                    error: null
                                },
                                value: c.value,
                                options: {
                                    updatingHandler: null
                                }
                            };
                        })
                    });
                }
            });
        },
        rowId: function (data) {
            return data.contributor + data.role;
        },
        columns: [
            { data: "contributor" },
            { data: "role" },
            {
                data: "hourlyRate",
                render: function (data, type, row, meta) {
                    if (type === "display") {
                        if (data.isEditing) {
                            var disabled = (row.options.updatingHandler !== null) ? "disabled" : "";
                            var error = (data.error !== null) ? '<div class="invalid-tooltip d-block">' + data.error + '</div>' : '';
                            var errorInputStyle = (data.error != null) ? 'style = "border-color: rgba(220,53,69,.9)"' : '';
                            return '<div class="input-group pr-1 hourlyRateInputGroup"><input type="number" class="hourlyRateInput form-control shadow-none" ' + disabled + ' value="' + data.editingValue + '" ' + errorInputStyle + '>' +
                                '<span class="input-group-append"><button class="hourlyRateInputClear btn btn-outline border-left-0 border" type="button" ' + disabled + ' ' + 
                                errorClearStyle + '><i class="fa fa-times" ' + errorIconStyle +'></i></button></span>' +
                                error + '</div>';
                        } else {
                            return "<div class='hourlyRateStatic d-flex align-items-center w-100' style='height:30px'>" + data.value + "$</div>";
                        }
                    } else {
                        return data;
                    }
                }
            },
            {
                data: "value",
                render: function (data) { return data + "$"; }
            },
            {
                data: "options",
                render: function (data, type, row) {
                    if (type === "display") {
                        var title;
                        if (row.hourlyRate.isEditing && data.updatingHandler == null) {
                            title = '<i class="fas fa-sync"></i>';
                        } else if (data.updatingHandler !== null) {
                            title = '<i class="fas fa-sync fa-spin"></i>';
                        } else {
                            title = '<i class="fas fa-edit"></i>';
                        }
                        return "<button class='edit btn btn-sm '>" + title + "</button>";
                    } else {
                        return data;
                    }
                }
            }
        ]
    });

    $("#contracts").DataTable().on('draw', function () {
        console.log('Redraw occurred at: ' + new Date().getTime());
    });

    $("#contracts").on("click", ".hourlyRateInputClear", function (e) {
        var table = $("#contracts").DataTable();
        var row = table.row($(e.currentTarget).parents('tr'));
        var data = row.data();
        row.data($.extend(true, data, { hourlyRate: { editingValue: data.hourlyRate.value, isEditing: false } }))
            .draw("page");
    });

    $("#contracts").on("click", ".hourlyRateInput", function (e) {
        var table = $("#contracts").DataTable();
        var row = table.row($(e.currentTarget).parents('tr'));
        var data = row.data();
        if (data.hourlyRate.error != null) {
            var index = row.index();
            table.cell({ row: row.index(), column: 2 }).data(
                $.extend(true, data.hourlyRate, { error: null })
            );
            //focus and put cursor position at the end
            setTimeout(function () {
                var input = table.cell({ row: index, column: 2 }).nodes().to$().find(".hourlyRateInput");
                input.focus();
                input[0].type = 'text';
                input[0].setSelectionRange(input.val().length, input.val().length);
                input[0].type = 'number';
            }, 50);
        }
    });


    $("#contracts").on("click", ".hourlyRateStatic", function (e) {
        var table = $("#contracts").DataTable();
        var row = table.row($(e.currentTarget).parents('tr'));
        var data = row.data();
        row.data($.extend(true, data, { hourlyRate: { isEditing: true } })).draw("page");
        var input = table.cell({ row: row.index(), column: 2 }).nodes().to$().find(".hourlyRateInput");
        //focus and put cursor position at the end
        setTimeout(function () {
            input.focus();
            input[0].type = 'text';
            input[0].setSelectionRange(input.val().length, input.val().length);
            input[0].type = 'number';
        }, 50);

    });

    $("#contracts").on("click", ".edit", function (e) {
        var table = $("#contracts").DataTable();
        var row = table.row($(e.currentTarget).parents('tr'));
        var data = row.data();
        if (!data.hourlyRate.isEditing) {
            row.data($.extend(true, data, { hourlyRate: { isEditing: true } })).draw("page");
        } else if (data.options.updatingHandler === null) {
            var editingValue = $("#" + row.id() + " .hourlyRateInput").val();
            if (parseInt(editingValue) < 15) {
                table.cell({ row: row.index(), column: 2 }).data(
                    $.extend(true, data.hourlyRate, { editingValue: editingValue, error: "Hourly rate must be at least 15$" })
                );
            } else {
                table.cell({ row: row.index(), column: 2 }).data(
                    $.extend(true, data.hourlyRate, { editingValue: editingValue })
                );
                var updatingHandler = $.ajax({
                    url: "/api/john/test/contracts",
                    type: "POST",
                    data: "contributor=" + data.contributor + "&role=" + data.role + "&hourlyRate=" + data.hourlyRate.editingValue,
                    success: function (updated) {
                        var row = $("#contracts").DataTable().row("#" + updated.id.username + updated.id.role);
                        var data = row.data();
                        row.data($.extend(true, data, {
                            hourlyRate: { isEditing: false, value: updated.hourlyRate },
                            options: { updatingHandler: null }
                        })).draw("page");
                    },
                    error: function () {

                    }
                });
                table.cell({ row: row.index(), column: 4 }).data({ updatingHandler: updatingHandler });
                table.cell({ row: row.index(), column: 2 }).invalidate().draw("page");
            }
        } else {
            data.options.updatingHandler.abort();
            table.cell({ row: row.index(), column: 4 }).data({ updatingHandler: null });
            table.cell({ row: row.index(), column: 2 }).invalidate().draw("page");
        }
    });

});