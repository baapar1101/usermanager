var UM_PROF_STATE = {0:"Waiting", 1:"Running", 2:"Running active", 3:"Used"};
var UM_PROF_STARTS_AT = {0:"Logon", 1:"Immediately"};
var UM_PAY_STATE = {0:"Started", 1:"Pending",2:"OK",3:"Declined",4:"Error",5:"Timeout",6:"Aborted",7:"User-approved"};

function processFailedResp(obj) {
    if (obj.type === "LOGIN") {
        location.reload();
    }
    else {
        alert(obj.data.error);
    }
}

function getLocationHash () {
  return window.location.hash.substring(1);
}

function blockGUI() {
    document.getElementById("global-blocker").classList.add("active");
}

function unblockGUI() {
    document.getElementById("global-blocker").classList.remove("active");
}

function hideAll() {
    var children = document.getElementById("container").children;
    for (var i = 0; i < children.length; i++) {
        if(children[i].classList.contains("container-view")) {
            children[i].style.display = "none";
        }
    }
    document.getElementById("status-data").innerHTML = "";
    document.getElementById("status-profiles").innerHTML = "";
    document.getElementById("status-exp-profiles").innerHTML = "";
    document.getElementById("profiles-profiles").innerHTML = "";
    document.getElementById("payments-payments").innerHTML = "";
    document.getElementById("sessions-sessions").innerHTML = "";
    document.getElementById("buyprofile-buyprofile").innerHTML = "";
}

function updateNavActive(hash) {
    var links = document.querySelectorAll('.hmenu a');
    links.forEach(link => link.classList.remove('active'));
    var activeLink = document.getElementById('menu-' + hash);
    if (activeLink) activeLink.classList.add('active');
}

function processNavigation() {
    blockGUI();
    hideAll();

    var hashMap = getLocationHash().split(":");
    var view = hashMap[0] || "status";
    
    updateNavActive(view);

    if (view === "sessions") {
        document.getElementById("sessions").style.display = "block";
        loadSessions();
    }
    else if (view === "payments") {
        document.getElementById("payments").style.display = "block";
        loadPayments();
    }
    else if (view === "profiles") {
        document.getElementById("profiles").style.display = "block";
        loadProfiles();
    }
    else if (view === "profile") {
        document.getElementById("profile").style.display = "block";
        loadProfile(hashMap[1]);
    }
    else if (view === "buyprofile") {
        document.getElementById("buyprofile").style.display = "block";
        loadPaymentTypes();
    }
    else { 
        document.getElementById("status").style.display = "block";
        updateNavActive("status");
        loadStatusData();
    }
}

window.onload = function() {
    processNavigation();
};

window.onhashchange = function(e) {
    processNavigation();
};

function loadStatusData() {
    ajax.post('../api/getUser', null, function(responseText) {
        try {
            var obj = JSON.parse(responseText); 
            if (obj.success) {
                var tableRows = "";
                tableRows += "<tr><td>Username:</td><td>" + obj.data.username + "</td></tr>";
                tableRows += "<tr><td>Max simultaneous sessions:</td><td>" + (obj.data.sharedUsers == 0 ? 'unlimited' : obj.data.sharedUsers) + "</td></tr>";
                tableRows += "<tr><td>Currently active sessions:</td><td>" + obj.data.activeSess + "</td></tr>";
                tableRows += "<tr><td>Total download:</td><td>" + obj.data.download + "</td></tr>";
                tableRows += "<tr><td>Total upload:</td><td>" + obj.data.upload + "</td></tr>";
                tableRows += "<tr><td>Total uptime:</td><td>" + obj.data.uptime + "</td></tr>";

                document.getElementById("status-data").innerHTML = tableRows;
            } else {
                processFailedResp(obj);
            }
        } catch (e) {
            alert("Unknown error.");
        }
        unblockGUI(); 
    });


    ajax.post('../api/getUserProfiles', null, function(responseText) {
        try {
            var obj = JSON.parse(responseText); 
            if(obj.success) {
                var tableRows = "<thead><tr><th>Name</th><th>State</th><th>Expires after</th><th>Action</th></tr></thead><tbody>";
                var expTableRows = "<thead><tr><th>Name</th><th>State</th><th>Expired at</th></tr></thead><tbody>";
                
                var waitingRows = "";
                var runningRows = "";

                var profiles = obj.data.profiles;
                for (var i = 0; i < profiles.length; i++) {
                    if (profiles[i].state == 3) {
                        expTableRows += "<tr>";
                        expTableRows += "<td><a class=\"link\" href=\"#profile:"+profiles[i].profileId+"\">" + profiles[i].name + "</a></td>";
                        expTableRows += "<td>" + UM_PROF_STATE[profiles[i].state] + "</td>";
                        expTableRows += "<td>" + profiles[i].expAt + "</td>";
                        expTableRows += "</tr>";
                    } else if (profiles[i].state == 0) {
                        waitingRows += "<tr>";
                        waitingRows += "<td><a class=\"link\" href=\"#profile:"+profiles[i].profileId+"\">" + profiles[i].name + "</a></td>";
                        waitingRows += "<td>" + UM_PROF_STATE[profiles[i].state] + "</td>";
                        waitingRows += "<td>" + profiles[i].expAfter + "</td>";
                        waitingRows += "<td><button value=\"" + profiles[i].id + "\" onclick=\"onActivateClick(this)\">Activate</button></td>";
                        waitingRows += "</tr>";
                    } else if (profiles[i].state == 1) {
                        runningRows += "<tr>";
                        runningRows += "<td><a class=\"link\" href=\"#profile:"+profiles[i].profileId+"\">" + profiles[i].name + "</a></td>";
                        runningRows += "<td>" + UM_PROF_STATE[profiles[i].state] + "</td>";
                        runningRows += "<td>" + profiles[i].expAfter + "</td>";
                        runningRows += "<td><button value=\"" + profiles[i].id + "\" onclick=\"onActivateClick(this)\">Activate</button></td>";
                        runningRows += "</tr>";
                    } else {
                        tableRows += "<tr>";
                        tableRows += "<td><a class=\"link\" href=\"#profile:"+profiles[i].profileId+"\">" + profiles[i].name + "</a></td>";
                        tableRows += "<td>" + UM_PROF_STATE[profiles[i].state] + "</td>";
                        tableRows += "<td>" + profiles[i].expAfter + "</td>";
                        tableRows += "<td></td>";
                        tableRows += "</tr>";
                    }
                }

                tableRows += runningRows + waitingRows + "</tbody>";
                expTableRows += "</tbody>";
                
                document.getElementById("status-profiles").innerHTML = tableRows;
                document.getElementById("status-exp-profiles").innerHTML = expTableRows;
            } else {
                processFailedResp(obj);
            }
        } catch (e) {
            alert("Unknown error.");
        }
    });
}

function loadProfiles() {
    ajax.post('../api/getProfiles', null, function(responseText) {
        try {
            var obj = JSON.parse(responseText);
            if(obj.success) {
                var tableRows = "<thead><tr><th>Name</th><th>Validity</th><th>Starts at</th></tr></thead><tbody>";

                var profiles = obj.data.profiles;
                for (var i = 0; i < profiles.length; i++) {
                    tableRows += "<tr>";
                    tableRows += "<td><a class=\"link\" href=\"#profile:"+profiles[i].id+"\">" + profiles[i].name + "</a></td>";
                    tableRows += "<td>" + profiles[i].validity + "</td>";
                    tableRows += "<td>" + UM_PROF_STARTS_AT[profiles[i].startsAt] + "</td>";
                    tableRows += "</tr>";
                }
                tableRows += "</tbody>";
                document.getElementById("profiles-profiles").innerHTML = tableRows;
            } else {
                processFailedResp(obj);
            }
        } catch (e) {
            alert("Unknown error.");
        }
        unblockGUI();
    });
}

function loadSessions() {
    ajax.post('../api/getUserSessions', null, function(responseText) {
        try {
            var obj = JSON.parse(responseText); 
            if(obj.success) {
                var tableRows = "<thead><tr><th>Start Time</th><th>End Time</th><th>Uptime</th>"
                + "<th>Downloaded</th><th>Uploaded</th><th>Active</th></tr></thead><tbody>";

                var sessions = obj.data.sessions;
                for (var i = sessions.length - 1; i >= 0; i--) {
                    tableRows += "<tr>";
                    tableRows += "<td>" + sessions[i].startTime + "</td>";
                    tableRows += "<td>" + sessions[i].endTime + "</td>";
                    tableRows += "<td>" + sessions[i].uptime + "</td>";
                    tableRows += "<td>" + sessions[i].downloaded + "</td>";
                    tableRows += "<td>" + sessions[i].uploaded + "</td>";
                    tableRows += "<td>" + sessions[i].active + "</td>";
                    tableRows += "</tr>";
                }
                tableRows += "</tbody>";
                document.getElementById("sessions-sessions").innerHTML = tableRows;
            } else {
                processFailedResp(obj);
            }
        } catch (e) {
            alert("Unknown error.");
        }
        unblockGUI();
    });
}

function loadPaymentTypes() {
    ajax.post('../api/getPayamentTypes', null, function(responseText) {
        try {
            var obj = JSON.parse(responseText);
            if (obj.success) {
                var pTypes =  obj.data.paymentTypes;
                var resultHtml = "";

                if (pTypes.length) {
                    resultHtml += "<form id=\"buy-form\">";

                    for (var i = 0; i < pTypes.length; i++) {
                        var checkStr = (i == 0) ? "checked=\"checked\"" : "";
                        if (pTypes[i].typeId === 1) {
                            resultHtml += "<label><input type=\"radio\" name=\"paymethod\" value=\"1\" " + checkStr + " /> PayPal</label>";
                        } else if (pTypes[i].typeId === 2) {
                            resultHtml += "<label><input type=\"radio\" name=\"paymethod\" value=\"2\" " + checkStr + " /> Credit card <span style=\"font-size:12px;color:var(--text-muted); margin-left: 5px;\">(via Authorize.net)</span></label>";
                        }
                    }

                    resultHtml += "</form>";
                    resultHtml += "<button style=\"margin-top: 1rem; width:100%; max-width: 200px;\" onclick=\"onBuyClick(this);\">Proceed to Buy</button>";
                } else {
                    resultHtml += "<div style=\"text-align:center;padding:20px; color:var(--text-muted);\">No payment method enabled.</div>";
                }

                document.getElementById("buyprofile-buyprofile").innerHTML = resultHtml;
            } else {
                processFailedResp(obj);
            }
        } catch (e) {
            alert("Unknown error.");
        }
        unblockGUI();
    });
}

function loadPayments() {
    ajax.post('../api/getUserPayments', null, function(responseText) {
        try {
            var obj = JSON.parse(responseText); 
            if(obj.success) {
                var tableRows = "<thead><tr><th>Type</th><th>Profile</th><th>Start</th>"
                + "<th>End</th><th>Message</th><th>State</th><th>Action</th></tr></thead><tbody>";

                var payments = obj.data.payments;
                for (var i = payments.length - 1; i >= 0; i--) {
                    tableRows += "<tr>";
                    tableRows += "<td>Paypal</td>";
                    tableRows += "<td>" + payments[i].profileName + "</td>";
                    tableRows += "<td>" + payments[i].start + "</td>";
                    tableRows += "<td>" + payments[i].end + "</td>";
                    tableRows += "<td>" + payments[i].message + "</td>";
                    tableRows += "<td>" + UM_PAY_STATE[payments[i].state] + "</td>";

                    if (payments[i].state == 0 || payments[i].state == 1 || payments[i].state == 7) {
                        tableRows += "<td><button value=\"" + payments[i].id + "\" onclick=\"onContinueBuyClick(this)\">Continue</button></td>";
                    } else {
                        tableRows += "<td></td>";
                    }
                    tableRows += "</tr>";
                }
                tableRows += "</tbody>";
                document.getElementById("payments-payments").innerHTML = tableRows;
            } else {
                processFailedResp(obj);
            }
        } catch (e) {
            alert("Unknown error.");
        }
        unblockGUI();
    });
}

function loadProfile(profileId) {
    ajax.post('../api/getProfile', {id: profileId}, function(responseText) {
        try {
            var obj = JSON.parse(responseText); 
            if (obj.success) {
                var tableRows = "";
                tableRows += "<tr><td>Name:</td><td>" + obj.data.name + "</td></tr>";
                tableRows += "<tr><td>Price:</td><td>" + obj.data.price + "</td></tr>";
                tableRows += "<tr><td>Validity:</td><td>" + obj.data.validity + "</td></tr>";
                tableRows += "<tr><td>Starts at:</td><td>" + UM_PROF_STARTS_AT[obj.data.startsAt] + "</td></tr>";
                if (obj.data.canBuy) {
                    tableRows += "<tr><td colspan=\"2\"><button style=\"margin-top:1rem;\" onclick=\"window.location.href='#buyprofile:" + obj.data.id + "'\">Buy this Profile</button></td></tr>";
                }

                document.getElementById("profile-data").innerHTML = tableRows;
            } else {
                processFailedResp(obj);
            }
        } catch (e) {
            alert("Unknown error.");
        }
        unblockGUI();
    });
}

function onActivateClick(elmnt) {
    blockGUI();
    document.getElementById("status-profiles").innerHTML = "";
    document.getElementById("status-exp-profiles").innerHTML = "";

    var postData = {'id' : elmnt.value};
    ajax.post('../api/activateProfile', postData, function(responseText) {
        try {
            var obj = JSON.parse(responseText); 
            if(obj.success) {
                loadStatusData();
            } else {
                processFailedResp(obj);
            }
        } catch (e) {
            alert("Unknown error.");
        }
        unblockGUI();
    });
}

function onContinueBuyClick(elmnt) {
    blockGUI();
    document.getElementById("payments-payments").innerHTML = "";

    var postData = {'id' : elmnt.value};
    ajax.post('../api/continueBuy', postData, function(responseText) {
        try {
            var obj = JSON.parse(responseText); 
            if(obj.success) {
                loadPayments();
            } else {
                processFailedResp(obj);
                loadPayments();
            }
        } catch (e) {
            alert("Unknown error.");
        }
        unblockGUI();
    });
}

function onBuyClick(elmnt) {
    blockGUI();
    var buyForm = document.getElementById("buy-form");
    var postData = {
        'payMethod' : buyForm["paymethod"].value,
        'profileId' : getLocationHash().split(":")[1]
    };

    ajax.post('../api/buyProfile', postData, function(responseText) {
        try {
            var obj = JSON.parse(responseText); 
            if(obj.success) {
                hideAll();
                document.getElementById("redirecting").style.display = "block";
                window.location.href = obj.data.redirectUrl;
            } else {
                unblockGUI();
                processFailedResp(obj);
            }
        } catch (e) {
            unblockGUI();
            alert("Unknown error.");
        }
    });
}

function onMenuClick(elmnt, e) {
    if (elmnt.id === "menu-status") {
        location.hash = "#status";
    }
    else if (elmnt.id === "menu-sessions") {
        location.hash = "#sessions";
    }
    else if (elmnt.id === "menu-payments") {
        location.hash = "#payments";
    }
    else if (elmnt.id === "menu-profiles") {
        location.hash = "#profiles";
    }
    else {
        ajax.post('../api/logout', null, function(responseText) {
            try {
                var obj = JSON.parse(responseText); 
                if (obj.success) {
                    location.reload();
                }
            } catch (e) {
                alert("Unknown error.");
            }
        });
    }
}