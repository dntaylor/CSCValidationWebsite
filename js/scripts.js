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
            runMenu.appendChild(runOption);
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
        submenuHtml += '<a href="javascript:void(0)" id="' + pageName
                        + '" onclick="currentPage=\'' + pageName
                        + '\';loadRuns();">' + pageName
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
    var run = runMenu.options[runMenu.selectedIndex].value;
    var dataset = datasetMenu.options[datasetMenu.selectedIndex].value;
    var pngDir = "results/run" + run + "/" + dataset + "/Site/PNGS/";
    var compareRunBox = document.getElementById("compareRun");
    var doCompare = compareRunBox.checked;
    var theHtml = '';
    if (doCompare) {
        var compareRunMenu = document.getElementById("compareRunSelect");
        var compareDatasetMenu = document.getElementById("compareDatasetSelect");
        var compareRun = compareRunMenu.options[compareRunMenu.selectedIndex].value;
        var compareDataset = compareDatasetMenu.options[compareDatasetMenu.selectedIndex].value;
        var comparePngDir = "results/run" + compareRun + "/" + compareDataset + "/Site/PNGS/";
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
