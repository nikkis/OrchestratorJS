		// initialisation
		editAreaLoader.init({
			id: "example_1"	// id of the textarea to transform	
			,start_highlight: true	
			,allow_resize: "y"
			,allow_toggle: false
			,language: "en"
			,syntax: "javascript"	
			,toolbar: "new_document, save, load, |, search, go_to_line, |, undo, redo, |, select_font, |, highlight, reset_highlight, |, help"
			,load_callback: "my_load"
			,save_callback: "my_save"
				
		});
		
		// callback functions
		function my_save(id, content){
			
			var text = encodeURIComponent(content);
			
			$.ajax({
				type: 'POST',
				url: '/api/action/upload/', 
				data: 'action_class_file='+text + '&web_console=True',
				
			}).fail(function( resp ) { 
				console.log(resp);
				alert( resp.responseText );
			});	
		}
		
		function my_load(id){
			editAreaLoader.setValue(id, "The content is loaded from the load_callback function into EditArea");
		}
		
		function test_setSelectionRange(id){
			editAreaLoader.setSelectionRange(id, 100, 150);
		}
		
		function test_getSelectionRange(id){
			var sel =editAreaLoader.getSelectionRange(id);
			alert("start: "+sel["start"]+"\nend: "+sel["end"]); 
		}
		
		function test_setSelectedText(id){
			text= "[REPLACED SELECTION]"; 
			editAreaLoader.setSelectedText(id, text);
		}
		
		function test_getSelectedText(id){
			alert(editAreaLoader.getSelectedText(id)); 
		}
		
		function editAreaLoaded(id){
			/*
			if(id=="example_2")
			{
				open_file1();
				open_file2();
			}
			*/
		}
		
		function open_file1()
		{
			var new_file= {id: "to\\ é # € to", text: "$authors= array();\n$news= array();", syntax: 'php', title: 'beautiful title'};
			editAreaLoader.openFile('example_2', new_file);
		}
		
		function open_file2()
		{
			var new_file= {id: "Filename", text: "<a href=\"toto\">\n\tbouh\n</a>\n<!-- it's a comment -->", syntax: 'html'};
			editAreaLoader.openFile('example_2', new_file);
		}
		
		function close_file1()
		{
			editAreaLoader.closeFile('example_2', "to\\ é # € to");
		}
		
		function toogle_editable(id)
		{
			editAreaLoader.execCommand(id, 'set_editable', !editAreaLoader.execCommand(id, 'is_editable'));
		}