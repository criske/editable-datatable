## Editable cells for jQuery Datatables.

Small gist for editable cells for jQuery Datatables, without using a specialized Datatables plugin like Editor.

The table is connected to a mocked  data server. Each editable cell state is tracked allowing to edit, update and cancel updates to server across pages. 

![Tables](https://user-images.githubusercontent.com/10284893/103883339-c18e6680-50e5-11eb-94ca-e494bda23b8f.gif)

Updates:
- made editable cells to be clearable/revertable to the value before edit.([PR-2](https://github.com/criske/editable-datatable/pull/2))
- showing tooltip under input if input is invalid. ([PR-5](https://github.com/criske/editable-datatable/pull/5))
