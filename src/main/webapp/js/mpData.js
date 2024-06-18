/*******************************************************************************
* Copyright (c) 2018, 2022 IBM Corporation and others.
* All rights reserved. This program and the accompanying materials
* are made available under the terms of the Eclipse Public License v1.0
* which accompanies this distribution, and is available at
* http://www.eclipse.org/legal/epl-v10.html
*
* Contributors:
*     IBM Corporation - initial API and implementation
*******************************************************************************/


function displayLibertyUptime() {
    updateLibertyUptime();
    setInterval(updateLibertyUptime, 1000);
}

function updateLibertyUptime() {
    url = location.origin + "/system/config/uptime";
    var uptimeReq = new XMLHttpRequest();

    uptimeReq.onreadystatechange = function () {
        if (uptimeReq.status === 200) {
            var uptime = JSON.parse(uptimeReq.responseText);
            var appTitle = document.getElementById("uptime");
            var newTitle = appTitle.innerText;
            newTitle = newTitle.substring(0, newTitle.indexOf("!") + 1)

            var totalSeconds = Math.floor(uptime.uptime / 1000);

            var hours = Math.floor( totalSeconds / 3600);
            var minutes = Math.floor( totalSeconds % 3600 / 60);
            var seconds = Math.floor( totalSeconds % 3600 % 60);

            var days = 0;

            if (hours > 24) {
                days = Math.floor ( hours / 24 );
                hours = Math.floor ( hours % 24 );
            }

            var display = "";
            var separator = "";

            if (days > 0) {
                display += days + " days";
                separator = ", ";
            }

            if (hours > 0) {
                display += separator + hours + " hour";
                if (hours != 1) {
                    display += "s";
                }
                separator = ", ";
            }

            if (minutes > 0) {
                display += separator + minutes + " min";
                if (minutes != 1) {
                    display += "s";
                }
                separator = ", ";
            }

            display += separator + seconds + " sec";
            if (seconds != 1) {
                display += "s";
            }

            newTitle = newTitle + " Available for " + display + ".";
            appTitle.innerText = newTitle;
        }
    };
    uptimeReq.open("GET", url, true);
    uptimeReq.send();
}

function displaySystemProperties() {
    getSystemPropertiesRequest();
}

function getSystemPropertiesRequest() {
    var propToDisplay = ["java.vendor", "java.version", "user.name", "os.name", "wlp.install.dir", "wlp.server.name"];
    var url = location.origin + "/system/properties";
    var req = new XMLHttpRequest();
    var table = document.getElementById("systemPropertiesTable");
    // Create the callback:
    req.onreadystatechange = function () {
        if (req.readyState != 4) return; // Not there yet
        if (req.status != 200) {
            table.innerHTML = "";
            var row = document.createElement("tr");
            var th = document.createElement("th");
            th.innerText = req.statusText;
            row.appendChild(th);
            table.appendChild(row);

            addSourceRow(table, url);
            return;
        }
        // Request successful, read the response
        var resp = JSON.parse(req.responseText);
        for (var i = 0; i < propToDisplay.length; i++) {
            var key = propToDisplay[i];
            if (resp.hasOwnProperty(key)) {
                var row = document.createElement("tr");
                var keyData = document.createElement("td");
                keyData.innerText = key;
                var valueData = document.createElement("td");
                valueData.innerText = resp[key];
                row.appendChild(keyData);
                row.appendChild(valueData);
                table.appendChild(row);
            }
        }

        addSourceRow(table, url);
    };
    req.open("GET", url, true);
    req.send();
}

function displayConfigProperties() {
    getConfigPropertiesRequest();
}

function getConfigPropertiesRequest() {
    var url = location.origin + "/system/config";
    var req = new XMLHttpRequest();

    var configToDisplay = {};
    configToDisplay["io_openliberty_sample_system_inMaintenance"] = "System In Maintenance";
    configToDisplay["io_openliberty_sample_testConfigOverwrite"] = "Test Config Overwrite";
    configToDisplay["io_openliberty_sample_port_number"] = "Port Number";
    // Create the callback:
    req.onreadystatechange = function () {
        if (req.readyState != 4) return; // Not there yet
        if (req.status != 200) {
            return;
        }

        // Request successful, read the response
        var resp = JSON.parse(req.responseText);
        var configProps = resp["ConfigProperties"];
        var table = document.getElementById("configTableBody");
        for (key in configProps) {
            var row = document.createElement("tr");
            var keyData = document.createElement("td");
            keyData.innerText = configToDisplay[key];
            var valueData = document.createElement("td");
            valueData.innerText = configProps[key];
            row.appendChild(keyData);
            row.appendChild(valueData);
            table.appendChild(row);
        }

        addSourceRow(table, url);
    }
    req.open("GET", url, true);
    req.send();
}

function toggle(e) {
    var callerElement;
    if (!e) {
        if (window.event) {
            e = window.event;
            callerElement = e.currentTarget;
        } else {
            callerElement = window.toggle.caller.arguments[0].currentTarget; // for firefox
        }
    }

    var classes = callerElement.parentElement.classList;
    var collapsed = classes.contains("collapsed");
    var caretImg = callerElement.getElementsByClassName("caret")[0];
    var caretImgSrc = caretImg.getAttribute("src");
    if (collapsed) { // expand the section
        classes.replace("collapsed", "expanded");
        caretImg.setAttribute("src", caretImgSrc.replace("down", "up"));
    } else { // collapse the section
        classes.replace("expanded", "collapsed");
        caretImg.setAttribute("src", caretImgSrc.replace("up", "down"));
    }
}

function addSourceRow(table, url) {
    var sourceRow = document.createElement("tr");
    sourceRow.classList.add("sourceRow");
    var sourceText = document.createElement("td");
    sourceText.setAttribute("colspan", "100%");
    sourceText.innerHTML = "API Source\: <a href='" + url + "'>" + url + "</a>";
    sourceRow.appendChild(sourceText);
    table.appendChild(sourceRow);
}
