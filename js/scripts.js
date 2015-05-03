// Global variables
var currentPage = "Summary"

// jquery functions

// sticky menu
$(function(){
        // Check the initial Poistion of the Sticky Header
        var menuTop = $('#menu').offset().top;
 
        $(window).scroll(function(){
                if( $(window).scrollTop() > menuTop ) {
                        $('#menu').css({position: 'fixed', top: '0px'});
                        $('#menu-alias').css('display', 'block');
                } else {
                        $('#menu').css({position: 'static', top: '0px'});
                        $('#menu-alias').css('display', 'none');
                }
        });
  });

// load xml from file
function loadXMLDoc(filename) {
    if (window.XMLHttpRequest) {
        xhttp=new XMLHttpRequest();
    }
    else {
        xhttp=new ActiveXObject("Microsoft.XMLHTTP");
    }
    xhttp.open("GET",filename,false);
    xhttp.send();
    return xhttp.responseXML;
} 

// parse url
function parseURL() {
    var uri = new URI(document.URL);
    var params = uri.search(true);
    console.log(params);
    getPeriodList();
    if (params.page !== undefined) {
        currentPage = params.page;
    }
    if (params.period !== undefined) { 
        var periodMenu = document.getElementById("periodSelect");
        periodMenu.value = params.period;
        loadRunList('periodSelect','runSelect');
        if (params.run !== undefined) {
            var runMenu = document.getElementById('runSelect');
            runMenu.value = params.run;
            loadDatasets('periodSelect','runSelect','datasetSelect');
            if (params.dataset !== undefined) {
                var datasetMenu = document.getElementById('datasetSelect');
                datasetMenu.value = params.dataset;
            }
        }
    }
    if (params.trigger !== undefined) {
        var triggerMenu = document.getElementById('triggerSelect');
        triggerMenu.value = params.trigger;
    }
    var compareRunBox = document.getElementById("compareRun");
    if (params.compare !== undefined) {
        compareRunBox.checked = true;
    }
    else {
        compareRunBox.checked = false;
    }
    setupCompareRun();
    if (params.comparePeriod !== undefined) { 
        var comparePeriodMenu = document.getElementById("comparePeriodSelect");
        comparePeriodMenu.value = params.comparePeriod;
        loadRunList('comparePeriodSelect','compareRunSelect');
        if (params.compareRun !== undefined) {
            var compareRunMenu = document.getElementById('compareRunSelect');
            compareRunMenu.value = params.compareRun;
            loadDatasets('comparePeriodSelect','compareRunSelect','compareDatasetSelect');
            if (params.compareDataset !== undefined) {
                var compareDatasetMenu = document.getElementById('compareDatasetSelect');
                compareDatasetMenu.value = params.compareDataset;
            }
        }
    }
    if (params.compareTrigger !== undefined) {
        var compareTriggerMenu = document.getElementById('compareTriggerSelect');
        compareTriggerMenu.value = params.compareTrigger;
    }
    if (params.period !== undefined & params.run !== undefined & params.dataset !== undefined) {
        buildSubmenu();
        loadRuns();
    }
}

function getURL(page) {
    var uri = new URI(document.URL);
    uri.search("");
    uri.setSearch("page",page);
    var periodMenu = document.getElementById("periodSelect");
    var runMenu = document.getElementById("runSelect");
    var datasetMenu = document.getElementById("datasetSelect");
    var triggerMenu = document.getElementById("triggerSelect");
    var period = periodMenu.options[periodMenu.selectedIndex].value;
    var run = runMenu.options[runMenu.selectedIndex].value;
    var dataset = datasetMenu.options[datasetMenu.selectedIndex].value;
    var trigger = triggerMenu.options[triggerMenu.selectedIndex].value;
    var compareRunBox = document.getElementById("compareRun");
    var doCompare = compareRunBox.checked;
    var comparePeriodMenu = document.getElementById("comparePeriodSelect");
    var compareRunMenu = document.getElementById("compareRunSelect");
    var compareDatasetMenu = document.getElementById("compareDatasetSelect");
    var compareTriggerMenu = document.getElementById("compareTriggerSelect");
    var comparePeriod = comparePeriodMenu.options[comparePeriodMenu.selectedIndex].value;
    var compareRun = compareRunMenu.options[compareRunMenu.selectedIndex].value;
    var compareDataset = compareDatasetMenu.options[compareDatasetMenu.selectedIndex].value;
    var compareTrigger = compareTriggerMenu.options[compareTriggerMenu.selectedIndex].value;
    uri.setSearch("period",period);
    uri.setSearch("run",run);
    uri.setSearch("dataset",dataset);
    uri.setSearch("trigger",trigger);
    if (doCompare) {
        uri.setSearch("compare","true");
        uri.setSearch("comparePeriod",comparePeriod);
        uri.setSearch("compareRun",compareRun);
        uri.setSearch("compareDataset",compareDataset);
        uri.setSearch("compareTrigger",compareTrigger);
    }
    return uri.toString();
}

function loadPage() {
    var url = getURL(currentPage);
    window.location=url;
}

// create period list
function getPeriodList() {
    var periodMenu = document.getElementById("periodSelect");
    var comparePeriodMenu = document.getElementById("comparePeriodSelect");
    for (var period in periodData) {
        var periodOption = document.createElement("option");
        var comparePeriodOption = document.createElement("option");
        periodOption.textContent = period;
        comparePeriodOption.textContent = period;
        periodOption.value = period;
        comparePeriodOption.value = period;
        periodMenu.appendChild(periodOption);
        comparePeriodMenu.appendChild(comparePeriodOption);
    }
    var archiveMenu = document.getElementById("archiveSelect");
    for (var run in archiveList) {
        var archiveOption = document.createElement("option");
        archiveOption.textContent = archiveList[run];
        archiveOption.value = archiveList[run];
        archiveMenu.appendChild(archiveOption);
    }
}

// create run list
function loadRunList(periodMenuString,runMenuString) {
    var periodMenu = document.getElementById(periodMenuString);
    var runMenu = document.getElementById(runMenuString);
    var period = periodMenu.options[periodMenu.selectedIndex].text;
    var startrun = periodData[period]["startrun"];
    var endrun = periodData[period]["endrun"];
    // remove old options
    while (runMenu.length>0) {
        runMenu.remove(runMenu.length-1);
    }
    // load current menu
    for (var run in runData) {
        if (parseInt(run)>=parseInt(startrun) && parseInt(run)<=parseInt(endrun)) {
            var runOption = document.createElement("option");
            runOption.textContent = run;
            runOption.value = runData[run]["directory"];
            //runMenu.appendChild(runOption);
            runMenu.insertBefore(runOption,runMenu.firstChild);
            runMenu.selectedIndex = 0;
        }
    }
    runMenu.disabled = false;
}

// download archive from https://cms-conddb.cern.ch/eosweb/csc/
function downloadArchive() {
    var archiveMenu = document.getElementById("archiveSelect");
    var run = archiveMenu.options[archiveMenu.selectedIndex].text;
    var tarfile = "https://cms-conddb.cern.ch/eosweb/csc/results/run" + run + "/run" + run + ".tar.gz";
    downloadURL(tarfile);
}

function downloadURL(url) {
    var hiddenIFrameID = 'hiddenDownloader',
        iframe = document.getElementById(hiddenIFrameID);
    if (iframe === null) {
        iframe = document.createElement('iframe');
        iframe.id = hiddenIFrameID;
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
    }
    iframe.src = url;
}

// load datasets for selected run
function loadDatasets(periodMenuString,runMenuString,datasetMenuString) {
    var periodMenu = document.getElementById(periodMenuString);
    var runMenu = document.getElementById(runMenuString);
    var datasetMenu = document.getElementById(datasetMenuString);
    var run = runMenu.options[runMenu.selectedIndex].text;
    // remove old options
    while (datasetMenu.length>0) {
        datasetMenu.remove(datasetMenu.length-1);
    }
    // add new options
    for (var dataset in runData[run]["datasets"]) {
        var datasetOption = document.createElement("option");
        datasetOption.textContent = dataset;
        datasetOption.value = dataset;
        datasetMenu.appendChild(datasetOption);
    }
    datasetMenu.disabled = false;
}

// setup comparison between two runs
function setupCompareRun() {
    var comparePeriodMenu = document.getElementById("comparePeriodSelect");
    var compareRunMenu = document.getElementById("compareRunSelect");
    var compareDatasetMenu = document.getElementById("compareDatasetSelect");
    var compareRunBox = document.getElementById("compareRun");
    if (compareRunBox.checked) {
        comparePeriodMenu.disabled = false;
        compareRunMenu.disabled = false;
        compareDatasetMenu.disabled = false;
    }
    else {
        comparePeriodMenu.disabled = true;
        compareRunMenu.disabled = true;
        compareDatasetMenu.disabled = true;
    }
}

// function to build the submenu
function buildSubmenu() {
    var submenuHtml = ''
    for (var pageName in pageData) {
        submenuHtml += '<a href="' + getURL(pageName)
                        + '" id="' + pageName
                        + '">' + pageName
                        + '</a>';
        if (pageName=="Wire Timing") {
            submenuHtml += '<br>';
        }
        else if (pageName=="Hot and dead wire groups") {
            continue;
        }
        else {
            submenuHtml += ' - '
        }
    }
    document.getElementById("submenu").innerHTML = submenuHtml;
}

// set link to active
function setActive() {
    var aObjects = submenu.getElementsByTagName('a');
    for (var i=0; i<aObjects.length; i++) {
        if (aObjects[i].id==currentPage) {
            aObjects[i].className='active';
        }
        else {
            aObjects[i].className='';
        }
    }
}

// load page for given run for the dataset(s) selected
function loadRuns() {
    setActive();
    var runMenu = document.getElementById("runSelect");
    var datasetMenu = document.getElementById("datasetSelect");
    var triggerMenu = document.getElementById("triggerSelect");
    var run = runMenu.options[runMenu.selectedIndex].value;
    var dataset = datasetMenu.options[datasetMenu.selectedIndex].value;
    var trigger = triggerMenu.options[triggerMenu.selectedIndex].value;
    var pngDir = "results/run" + run + "/" + dataset + "/Site/PNGS/";
    if (trigger !== 'All') {
        pngDir += trigger + '/';
    }
    var compareRunBox = document.getElementById("compareRun");
    var doCompare = compareRunBox.checked;
    var theHtml = '';
    if (doCompare) {
        var compareRunMenu = document.getElementById("compareRunSelect");
        var compareDatasetMenu = document.getElementById("compareDatasetSelect");
        var compareTriggerMenu = document.getElementById("compareTriggerSelect");
        var compareRun = compareRunMenu.options[compareRunMenu.selectedIndex].value;
        var compareDataset = compareDatasetMenu.options[compareDatasetMenu.selectedIndex].value;
        var compareTrigger = compareTriggerMenu.options[compareTriggerMenu.selectedIndex].value;
        var comparePngDir = "results/run" + compareRun + "/" + compareDataset + "/Site/PNGS/";
        if (compareTrigger !== 'All') {
            comparePngDir += compareTrigger + '/';
        }
        var pageHtml = getHtml(pngDir,doCompare,run,dataset);
        var comparePageHtml = getHtml(comparePngDir,doCompare,compareRun,compareDataset);
        theHtml = '<div id="content-window" style="width:98%; margin:1%;">'
                   + '<div id="content-table" style="width:1215px; display: table;">'
                   + '<div style="display: table-row">'
                   + '<div id="left-compare" style="width:600px; display: table-cell;">'
                   + pageHtml
                   + '</div>'
                   + '<div id="empty-spacer" style="width:6px; display: table-cell;"></div>'
                   + '<div id="compare-spacer" style="width:3px; display: table-cell;"></div>'
                   + '<div id="empty-spacer" style="width:6px; display: table-cell;"></div>'
                   + '<div id="right-compare" style="width:600px; display: table-cell;">'
                   + comparePageHtml
                   + '</div>'
                   + '</div>'
                   + '</div>'
                   + '</div>';
    }
    else {
        pageHtml = getHtml(pngDir,doCompare,run,dataset);
        theHtml = '<div id="content-window" style="width:98%; margin:1%;">'
                   + '<div id="content-table" style="width:960px; display: table;">'
                   + '<div style="display: table-row">'
                   + '<div id="left-compare" style="width:960px; display: table-cell;">'
                   + pageHtml
                   + '</div>'
                   + '</div>'
                   + '</div>';
    }
    document.getElementById("outputWindow").innerHTML = theHtml;
}

// get the html for a given page
function getHtml(pngDir,doCompare,run,dataset) {
    var pageHTML = "";
    pageHTML += '<p class="header">' + pageData[currentPage]['title'] + '</p>';
    // if summary, get info from runlist
    if (currentPage==="Summary") {
       pageHTML += '<p class="sublabel">Release: ' + runData[run]['datasets'][dataset]['release'] + '</p>'
       pageHTML += '<p class="sublabel">Dataset: ' + runData[run]['datasets'][dataset]['datasetname'] + '</p>'
       pageHTML += '<p class="sublabel">Run: ' + runData[run]['datasets'][dataset]['runnum'] + '</p>'
       pageHTML += '<p class="sublabel">Event Processed: ' + runData[run]['datasets'][dataset]['events'] + '</p>'
       pageHTML += '<p class="sublabel">GlobalTag: ' + runData[run]['datasets'][dataset]['globaltag'] + '</p>'
       pageHTML += '<p class="sublabel">CSCValidation run on ' + runData[run]['datasets'][dataset]['rundate'] + '</p>'
       pageHTML += '<p class="sublabel">More information: <br/>'
                   + '<a href="https://cmsweb.cern.ch/das/request?view=list&limit=10&instance=prod%2Fglobal&input=summary+dataset=' 
                   + runData[run]['datasets'][dataset]['datasetname'] + '+run=' 
                   + runData[run]['datasets'][dataset]['runnum'] + '">DAS Summary</a><br/>'
                   + '<a href="https://cmsweb.cern.ch/das/request?view=list&limit=10&instance=prod%2Fglobal&input=run='
                   + runData[run]['datasets'][dataset]['runnum'] + '">DAS Run Information</a><br/>'
                   + '<a href="https://cmswbm.web.cern.ch/cmswbm/cmsdb/servlet/RunSummary?RUN=' 
                   + runData[run]['datasets'][dataset]['runnum'] + '&SUBMIT=Submit">Run Summary</a><br/>'
                   + '<a href="https://cmsweb.cern.ch/dqm/online/start?runnr=' 
                   + runData[run]['datasets'][dataset]['runnum'] + ';dataset=/Global/Online/ALL;sampletype=online_data;filter=all;referencepos=overlay;'
                   + 'referenceshow=customise;referenceobj1=refobj;referenceobj2=none;referenceobj3=none;referenceobj4=none;search=;'
                   + 'striptype=object;stripruns=;stripaxis=run;stripomit=none;workspace=CSC;size=M;root=Quick%20collection;focus=;zoom=no;">Online DQM</a><br/>'
                   + '</p>'
       return pageHTML;
    }
    for (var l in pageData[currentPage]['content']['labels']) {
        pageHTML += '<p class="sublabel">' + pageData[currentPage]['content']['labels'][l] + '</p>';
        var numColumns = pageData[currentPage]['content']['columns'][l];
        var pageWidth = doCompare ? 600. : 960.;
        var colWidth = pageWidth / numColumns;
        var colIterator = 0;
        pageHTML += '<div id="plot-window" style="width:' + pageWidth + 'px; display: table;">';
        for (var p in pageData[currentPage]['content']['plots'][l]) {
            var pngFile = pngDir + pageData[currentPage]['content']['plots'][l][p] + '.png';
            if (colIterator==0) {
                pageHTML += '<div id="plot-row" style="display: table-row">';
            }
            pageHTML += '<a href="' + pngFile + '" id="plot" style="background-image: url(\'' + pngFile
                         + '\'); width:' + colWidth + 'px; height:' + colWidth + 'px;'
                         + 'display:table-cell;"></a>';
            colIterator += 1;
            if (colIterator==numColumns) {
                colIterator = 0;
                pageHTML += '</div>';
            }
        }
        pageHTML += '</div>';
    }
    return pageHTML;
}
