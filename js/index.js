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
                                    hasFocus: false,
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
                            return "<input type='number' class='hourlyRateInput w-100' " + disabled + " value=" + data.editingValue + ">";
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
                            title = "Upload";
                        } else if (data.updatingHandler !== null) {
                            title = "Cancel";
                        } else {
                            title = "Edit";
                        }
                        return "<button class='edit'>" + title + "</button>";
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

    $("#contracts").on("change", ".hourlyRateInput", function (e) {
        var table = $("#contracts").DataTable();
        var row = table.row($(e.currentTarget).parents('tr'));
        var editingValue = $(this).val();
        var data = row.data();
        table.cell({ row: row.index(), column: 2 }).data(
            $.extend(true, data.hourlyRate, { editingValue: editingValue })
        );
    });

    $("#contracts").on("click", ".hourlyRateStatic", function (e) {
        var table = $("#contracts").DataTable();
        var row = table.row($(e.currentTarget).parents('tr'));
        var data = row.data();
        row.data($.extend(true, data, { hourlyRate: { isEditing: true } })).draw("page");
        var input = table.cell({ row: row.index(), column: 2 }).nodes().to$().find(".hourlyRateInput");
        //focus and put cursor position at the end
        setTimeout(function(){
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
        } else {
            data.options.updatingHandler.abort();
            table.cell({ row: row.index(), column: 4 }).data({ updatingHandler: null });
            table.cell({ row: row.index(), column: 2 }).invalidate().draw("page");
        }
    });

});