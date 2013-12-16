
require.config({
    baseUrl: "/js",
    paths: {
        "templates": "/templates"
    },
    waitSeconds: 15
  });

var apiVersion = '1';

$(function(){ 
    $('.launchActionBtn').click(function(event) {
        var actionName = event.target.id;
        $.ajax({
            type: 'POST',
            url: '/api/'+apiVersion+'/action/'+actionName,
        }).done(function( msg ) { 
            console.log(msg);
        });
    });
});


$(function(){ 
    $('.topMenuBtn').click(function(event) {
        var toShow = $.param.fragment(event.target.href);
        showView(toShow);
    });
});





function showView(name) {
    /*
    var cases = {
        'actions':      showActions,
        'capabilities': showCapabilities,
        'instances':    showInstances,
        'devices':      showDevices
    };

    if(cases[name]) {
        cases[name]();
    } else {
        showHome();
    }
*/


    switch(name) {
        case 'actions': 
            showActions();
            break;
        case 'capabilities': 
            showCapabilities();
            break;
        case 'instances': 
            showInstances();
            break;
        case 'devices': 
            showDevices();
            break;
        case 'download': 
            showDownloads();
            break;
        default: 
            showHome();
            break;
    }

};



/********************************************************************
*     ACTIONS
*********************************************************************/

function showActions() {
    $.getJSON('/api/'+apiVersion+'/action', function(data) {
        var template = '<ul class="side-nav">{{#actions}}<li class="actionNameLink actionName_{{.}}"><a href="#" onclick="showActionCode(\'{{.}}\');">{{.}}</a></li>{{/actions}}</ul>';
        var html = Mustache.to_html(template, data);
        html = '<div class="row contents"><div class="large-9 columns actionCode"></div><div class="large-3 columns actionNames">'+html+'</div></div>';
        $('.container').html(html);
    });
};


function updateActionNames() {
    $.getJSON('/api/'+apiVersion+'/action', function(data) {
        var template = '<ul class="side-nav">{{#actions}}<li class="actionNameLink actionName_{{.}}"><a href="#" onclick="showActionCode(\'{{.}}\');">{{.}}</a></li>{{/actions}}</ul>';
        var html = Mustache.to_html(template, data);
        html = '<div class="large-3 columns actionNames">'+html+'</div>';
        $('.actionNames').replaceWith(html);
        var actionName = $('#fileNameInput').val();
        $('.actionName_'+actionName).addClass('active');

    });	
};

function showActionCode(actionName) {

    if(actionName == '') {
        $('.actionCode').replaceWith('<div class="large-9 columns actionCode">'+'</div>');
        return
    }

    $.ajax({
        type: 'GET',
        url: '/api/'+apiVersion+'/action/'+actionName,
    }).done(function( data ) { 
        require(['text!templates/editor.html'], function(editorTemplate) { 
            var html = Mustache.to_html(editorTemplate, {"code": data});

            //var editLink = '<div class="row"><div class="large-4 columns"><p><a class="editStopEditLink" href="#" onclick="editableCode();" >Edit action</a></p></div><div style="display: none;" class="large-4 columns right fileNameEdit"><input type="text" id="fileNameInput" value="'+actionName+'" /></div></div>';
            var editLink = '<div class="row"><div class="large-1 columns"><p><a class="editStopEditLink" href="#" onclick="editableCode();" ><i class="foundicon-edit myEditIcon"></i></a></p></div><div class="large-1 columns"><p><a href="#" onclick="ensureDeleteAction();" ><i class="foundicon-remove myRemoveIcon" style="display: none;" ></i></a></p></div><div style="display: none;" class="large-4 columns right fileNameEdit"><input type="text" id="fileNameInput" value="'+actionName+'" /></div></div>';
            
            var editArea = '<div class="row"><div class="large-12 columns actionCode">'+html+'</div></div>';
            var triggerForm = '<form class="custom triggerActionForm">'
            +'<div class="row">'
            +'<div class="large-10 columns">'
            +'<label for="checkbox2" class="has-tooltip" title="currently not working"><input onchange="showPreviousParams(this,\''+actionName+'\');" type="checkbox" id="checkbox2" style="display: none;"><span class="custom checkbox"></span> Use previous arguments</label>'
            +'</div>'
            +'<div class="large-2 columns right">'
            +'<a class="triggerLink" href="javascript:void(0)" onclick="triggerAction(\''+actionName+'\');" >trigger</a>'
            +'</div>'
            +'</div>'
            +'<div class="row newActionParams"><div class="large-10 columns"><input type="text" id="paramLine" style="width:100%;" placeholder=\'usage: \"string\" or \"device:username@devicename\" or number, and then hit enter\'/></div></div>'
            +'</form>';

            $('.actionCode').replaceWith('<div class="large-9 columns actionCode">'+editLink+editArea+triggerForm+'</div>');
            loadFileToEditor('action');
            $('.actionNameLink').removeClass('active');
            $('.actionName_'+actionName).addClass('active');

            showParams();
        });
    });
};

function showPreviousParams(checkbox, actionName) {
    if(checkbox.checked) {
        $.getJSON('/api/'+apiVersion+'/action/'+actionName+'/metadata', function(data) {
            console.log(data);
            var preLoadData = [];
            for(i in data.args) 
            {
                var temp = data.args[i];
                preLoadData.push({id: "p"+i, text: JSON.stringify(temp)});
            }
            $("input#paramLine").select2('data', preLoadData);            
        });
    }
};

function showParams() {

    //var newParamLine = '<input type="text" id="paramLine" style="width:100%;" placeholder="usage: &quot;string&quot; or 1234 or &quot;device:username@devicename&quot; and then hit enter"/>';
    //var newParamLine = '<input type="text" id="paramLine" style="width:100%;" placeholder="usage: string or device:username@devicename and then hit enter"/>';
    //$('.triggerActionForm').append('<div class="row newActionParams"><div class="large-10 columns">'+newParamLine+'</div></div>');

    $.getJSON('/api/'+apiVersion+'/devices', function(data) {

        var devices = [];
        var devicesResp = data.devices;
        for(i in devicesResp) {
            var devId = devicesResp[i].identity;
            devices.push('\"device:'+devId+'\"');
        }

        $("#paramLine").select2({
            tags: devices,
            separator: "<myseparotor>",
            tokenSeparators: ["<myseparotor>"]}
        );

        $('#paramLine').on('change', function() { $('#paramLine_val').html($('#paramLine').val());});
        $('#paramLine').select2('container').find('ul.select2-choices').sortable({
            containment: 'parent',
            start: function() { $('#paramLine').select2('onSortStart'); },
            update: function() { $('#paramLine').select2('onSortEnd'); }
        });
    }); 

};

function triggerAction(actionName) {

    var actionParameters = [];
    var divs = $("#paramLine").select2("container").children().find('.select2-search-choice').find('div');
    for (var i = 0; i < divs.length; i++) {
        var div = divs[i];
        var param = $(div).text();
        var object = JSON.parse(param);
        actionParameters.push(object);
    };

    var pp = {};
    pp['actionName'] = actionName;
    pp['parameters'] = actionParameters;

    $.ajax({
        type: 'POST',
        url: '/api/'+apiVersion+'/actioninstance',
        contentType: 'application/json',
        data: JSON.stringify(pp),
    }).done(function( msg ) { 
        alert(msg);
        console.log(msg);
    });

};


function ensureDeleteAction() {
    require(['text!templates/deleteActionModal.html'], function(deleteActionModal) { 
        var actionName = $('#fileNameInput').val();
        var data = {"actionName": actionName};
        var html = Mustache.to_html(deleteActionModal, data);
        $('.generalModalDiv').replaceWith('<div class="generalModalDiv">'+html+'</div>');
        $('#deleteActionModal').foundation('reveal', 'open');
    });
};

function deleteAction(actionName) {
    $.ajax({
        type: 'DELETE',
        url: '/api/'+apiVersion+'/action/'+actionName,
    }).done(function( msg ) { 
        $('#deleteActionModal').foundation('reveal', 'close');
        updateActionNames();
        showActionCode('');
    });
};


/********************************************************************
*     CAPABILITIES
*********************************************************************/
function showCapabilities() {
    $.getJSON('/api/'+apiVersion+'/capability', function(data) {
        var template = '<ul class="side-nav">{{#capabilities}}<li class="capabilityNameLink capabilityName_{{.}}"><a href="#" onclick="showCapabilityCode(\'{{.}}\');">{{.}}</a></li>{{/capabilities}}</ul>';
        var html = Mustache.to_html(template, data);
        html = '<div class="row contents"><div class="large-9 columns capabilityCode"></div><div class="large-3 columns capabilityNames">'+html+'</div></div>';
        $('.container').html(html);
    });
};


function updateCapabilityNames() {
    $.getJSON('/api/'+apiVersion+'/capability', function(data) {
        var template = '<ul class="side-nav">{{#capabilities}}<li class="capabilityNameLink capabilityName_{{.}}"><a href="#" onclick="showCapabilityCode(\'{{.}}\');">{{.}}</a></li>{{/capabilities}}</ul>';
        var html = Mustache.to_html(template, data);
        html = '<div class="large-3 columns capabilityNames">'+html+'</div>';
        $('.capabilityNames').replaceWith(html);
        var capabilityName = $('#fileNameInput').val();
        $('.capabilityName_'+capabilityName).addClass('active');

    }); 
};


function showCapabilityCode(capabilityName) {
    if(capabilityName == '') {
        $('.capabilityCode').replaceWith('<div class="large-9 columns capabilityCode">'+'</div>');
        return;
    }

    $.ajax({
        type: 'GET',
        url: '/api/'+apiVersion+'/capability/'+capabilityName,
    }).done(function( data ) { 
        require(['text!templates/editor.html'], function(editorTemplate) { 
            var html = Mustache.to_html(editorTemplate, {"code": data});

            var editLink = '<div class="row"><div class="large-1 columns"><p><a class="editStopEditLink" href="#" onclick="editableCode();" ><i class="foundicon-edit myEditIcon"></i></a></p></div><div class="large-1 columns"><p><a href="#" onclick="ensureDeleteCapability();" ><i class="foundicon-remove myRemoveIcon" style="display: none;" ></i></a></p></div><div style="display: none;" class="large-4 columns right fileNameEdit"><input type="text" id="fileNameInput" value="'+capabilityName+'" /></div></div>';
            var editArea = '<div class="row"><div class="large-12 columns capabilityCode">'+html+'</div></div>';

            $('.capabilityCode').replaceWith('<div class="large-9 columns capabilityCode">'+editLink+editArea+'</div>');
            loadFileToEditor('capability');
            $('.capabilityNameLink').removeClass('active');
            $('.capabilityName_'+capabilityName).addClass('active');
        });
    });
};

function ensureDeleteCapability() {
    require(['text!templates/deleteCapabilityModal.html'], function(deleteCapabilityModal) { 
        var capabilityName = $('#fileNameInput').val();
        var data = {"capabilityName": capabilityName};
        var html = Mustache.to_html(deleteCapabilityModal, data);

        $('.generalModalDiv').replaceWith('<div class="generalModalDiv">'+html+'</div>');
        $('#deleteCapabilityModal').foundation('reveal', 'open');
    });
};

function deleteCapability(capabilityName) {
    $.ajax({
        type: 'DELETE',
        url: '/api/'+apiVersion+'/capability/'+capabilityName,
    }).done(function( msg ) { 
        console.log(msg);
        $('#deleteCapabilityModal').foundation('reveal', 'close');
        updateCapabilityNames();
        showCapabilityCode('');
    });
};



/********************************************************************
*     INSTANCES
*********************************************************************/


function showInstances() {
    $.getJSON('/api/'+apiVersion+'/actioninstances', function(data) {

        console.log(data);
        require(['text!templates/actioninstances.html'], function(actioninstancesTemplate) { 
            var html = Mustache.to_html(actioninstancesTemplate, data);
            html = '<div class="row contents"><div class="large-12 columns">'+html+'</div></div>';
            $('.container').html(html);
            console.log(html);
        });
    }); 
};


function deleteActionInstance(actioninstanceID) {
    console.log('deleting: '+actioninstanceID);

    $.ajax({
        type: 'DELETE',
        url: '/api/'+apiVersion+'/actioninstance/'+actioninstanceID,
    }).done(function( msg ) { 
        console.log(msg);
        //showInstances();
    });
};




/********************************************************************
*     DEVICES
*********************************************************************/


function showDevices() {
    $.getJSON('/api/'+apiVersion+'/devices', function(data) {
        require(['text!templates/devices.html'], function(devicesTemplate) { 
            var html = Mustache.to_html(devicesTemplate, data);
            html = '<div class="row contents"><div class="large-12 columns">'+html+'</div></div>';
            $('.container').html(html);
            console.log(html);
        });
    });	
};





/********************************************************************
*     DOWNLOADS
*********************************************************************/


function showDownloads() {
    $.getJSON('/api/'+apiVersion+'/downloads', function(data) {
        console.log(data);
        require(['text!templates/downloads.html'], function(downloadsTemplate) { 
            console.log(dependency);
            var html = Mustache.to_html(downloadsTemplate, data);
            $('.container').html(html);
            console.log(html);
        });
    }); 
};
function showHome() {};








