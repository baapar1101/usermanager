var UM_PROF_STATE =
{
    0: "Waiting", 1: "Running",
    2: "Running active",
    3: "Used",

};
var UM_PROF_STARTS_AT = {
    0: "Logon",
    1: "Immediately",
};
var UM_PAY_STATE = {
    0: "Started",
    1: "Pending",
    2: "OK",
    3: "Declined",
    4: "Error",
    5: "Timeout",
    6: "Aborted",
    7: "User-approved",
};
// معالجة_رد_فاشل
function processFailedResp(obj) {
    if (obj.type === "LOGIN") {
        location.reload();
    }
    else {
        alert(obj.data.error);
    }
}
// الحصول_على_الموقع
function getLocationHash() {
    return window.location.hash.substring(1);
}
// حظر_الواجهة
function blockGUI() {
    document.getElementById("global-blocker").style.visibility = "visible";
}
// إلغاء_حظر_الواجهة
function unblockGUI() {
    document.getElementById("global-blocker").style.visibility = "hidden";
}
// إخفاء_الكل
function hideAll() {
    var children = document.getElementById("container").children;
    for (var i = 0; i < children.length; i++) {
        children[i].style.display = "none";
    }
    document.getElementById("status-data").innerHTML = "";
    document.getElementById("status-profiles").innerHTML = "";
    document.getElementById("status-exp-profiles").innerHTML = "";
    document.getElementById("profiles-profiles").innerHTML = "";
    document.getElementById("payments-payments").innerHTML = "";
    document.getElementById("sessions-sessions").innerHTML = "";
    document.getElementById("buyprofile-buyprofile").innerHTML = "";
}
// معالجة_التنقل
function processNavigation() {
    blockGUI();
    hideAll();

    var hashMap = getLocationHash().split(":");

    if (hashMap[0] === "sessions") {
        document.getElementById("sessions").style.display = "block";
        loadSessions();
    }
    else if (hashMap[0] === "payments") {
        document.getElementById("payments").style.display = "block";
        loadPayments();
    }
    else if (hashMap[0] === "profiles") {
        document.getElementById("profiles").style.display = "block";
        loadProfiles();
    }
    else if (hashMap[0] === "profile") {
        document.getElementById("profile").style.display = "block";
        loadProfile(hashMap[1]);
    }
    else if (hashMap[0] === "buyprofile") {
        document.getElementById("buyprofile").style.display = "block";
        loadPaymentTypes();
    }
    else { // defaults to status
        document.getElementById("status").style.display = "block";
        loadStatusData();
    }
}

window.onload = function () {
    // معالجة_التنقل
    processNavigation();
};

// onhashchange XXX Won't work IE < 8
window.onhashchange = function (e) {
    processNavigation();
};
// تحميل_بيانات_الحالة

function loadStatusData() {
    loadSessions();
    unblockGUI();
    ajax.post('../api/getUser', null, function (responseText) {
        try {
            obj = JSON.parse(responseText); // XXX probably wont work if <= IE7
            if (obj.success) {
                var tableRows = "";
                // استخدام تعبير لتعتيم أول 6 خانات من اسم المستخدم
                let maskedUsername = obj.data.username.replace(/^.{6}/, '******');

                // إضافة الصف إلى الجدول مع اسم المستخدم المعتم
                tableRows += "<tr><td>رقم الكرت:</td><td>" + maskedUsername + "</td></tr>";
               
                
              // دالة لتحويل القيم إلى ميجابايت
function convertToMiB(value, unit) {
    switch (unit) {
        case 'GiB':
            return value * 1024; // 1 GiB = 1024 MiB
        case 'KiB':
            return value / 1024; // 1 MiB = 1024 KiB
        case 'MiB':
        default:
            return value; // إذا كانت القيمة بالفعل بالميجابايت
    }
}

// استخراج القيم والوحدات من النص
let downloadMatch = obj.data.download.match(/([\d.]+)\s*(GiB|MiB)/);
let uploadMatch = obj.data.upload.match(/([\d.]+)\s*(GiB|MiB)/);
let consumedMatch = obj.data.consumedBalance.match(/([\d.]+)\s*(GiB|MiB)/); // استخراج الرصيد المستهلك

if (downloadMatch && uploadMatch && consumedMatch) {
    let downloadValue = parseFloat(downloadMatch[1]);
    let uploadValue = parseFloat(uploadMatch[1]);
    let consumedValue = parseFloat(consumedMatch[1]);

    // تحويل القيم إلى ميجابايت
    let downloadInMiB = convertToMiB(downloadValue, downloadMatch[2]);
    let uploadInMiB = convertToMiB(uploadValue, uploadMatch[2]);
    let consumedInMiB = convertToMiB(consumedValue, consumedMatch[2]); // تحويل الرصيد إلى ميجابايت

    // إضافة الصفوف الأصلية
    tableRows += "<tr><td>التحميل:</td><td>" + obj.data.download + "</td></tr>";
    tableRows += "<tr><td>الرفع:</td><td>" + obj.data.upload + "</td></tr>";
    tableRows += "<tr><td>الرصيد المستهلك:</td><td>" + obj.data.consumedBalance + "</td></tr>";

    // حساب المجموع
    let totalValue = downloadInMiB + uploadInMiB;

    // إضافة صف المجموع
    tableRows += "<tr><td>إجمالي الرفع والتحميل:</td><td>" + totalValue.toFixed(1) + " MiB</td></tr>";
    // إضافة صف الرصيد المستهلك بوحدة الميجابايت
    tableRows += "<tr><td>إجمالي الرصيد المستهلك:</td><td>" + consumedInMiB.toFixed(1) + " MiB</td></tr>";
} else {
    console.error("Failed to parse download, upload, or consumed balance values.");
}



                tableRows += "<tr><td>الوقت المستهلك :</td><td>" + obj.data.uptime + "</td></tr>";

                document.getElementById("status-data").innerHTML = tableRows;
            }
            else {
                processFailedResp(obj);
            }
        }
        catch (e) {
            alert("Unknown error.");
        }
        unblockGUI(); // Not 100% correct in this case
    });


    ajax.post('../api/getUserProfiles', null, function (responseText) {
        try {
            obj = JSON.parse(responseText); // XXX probably wont work if <= IE7
            if (obj.success) {
                var tableRows = "<tr><th>رقم الكرت</th><th>الحالة</th><th>ينتهي بعد</th><th>الحدث</th></tr><tbody>";
                var expTableRows = "<tr><th>رقم الكرت</th><th>الحالة</th><th>ينتهي في</th></tr><tbody>";
                // So that we can sort them
                var waitingRows = "";
                var runningRows = "";

                var profiles = obj.data.profiles;
                for (var i = 0; i < profiles.length; i++) {
                    // 3 - USED
                    if (profiles[i].state == 3) {
                        expTableRows += "<tr>";
                        expTableRows += "<td><a class=\"link\" href=\"#profile:" + profiles[i].profileId + "\">" + profiles[i].name + "</a></td>";
                        expTableRows += "<td>" + UM_PROF_STATE[profiles[i].state] + "</td>";
                        expTableRows += "<td>" + profiles[i].expAt + "</td>";
                        expTableRows += "</tr>";
                    }
                    // 0 - WAITING
                    else if (profiles[i].state == 0) {
                        waitingRows += "<tr>";
                        waitingRows += "<td><a class=\"link\" href=\"#profile:" + profiles[i].profileId + "\">" + profiles[i].name + "</a></td>";
                        waitingRows += "<td>" + UM_PROF_STATE[profiles[i].state] + "</td>";
                        waitingRows += "<td>" + profiles[i].expAfter + "</td>";
                        waitingRows += "<td><button value=\"" + profiles[i].id + "\" onclick=\"onActivateClick(this)\">Activate</button></td>";
                        waitingRows += "</tr>";
                    }
                    // 1 - RUNNING
                    else if (profiles[i].state == 1) {
                        runningRows += "<tr>";
                        runningRows += "<td><a class=\"link\" href=\"#profile:" + profiles[i].profileId + "\">" + profiles[i].name + "</a></td>";
                        runningRows += "<td>" + UM_PROF_STATE[profiles[i].state] + "</td>";
                        runningRows += "<td>" + profiles[i].expAfter + "</td>";
                        runningRows += "<td><button value=\"" + profiles[i].id + "\" onclick=\"onActivateClick(this)\">Activate</button></td>";
                        runningRows += "</tr>";
                    }
                    // RUNNING_ACTIVE there should be one and we add it immediately
                    else {
                        tableRows += "<tr>";
                        tableRows += "<td><a class=\"link\" href=\"#profile:" + profiles[i].profileId + "\">" + profiles[i].name + "</a></td>";
                        tableRows += "<td>" + UM_PROF_STATE[profiles[i].state] + "</td>";
                        tableRows += "<td>" + profiles[i].expAfter + "</td>";
                        tableRows += "<td></td>";
                        tableRows += "</tr>";
                    }
                }

                tableRows += runningRows;
                tableRows += waitingRows;
                tableRows += "</tbody>";
                expTableRows += "</tbody>";
                document.getElementById("status-profiles").innerHTML = tableRows;
                document.getElementById("status-exp-profiles").innerHTML = expTableRows;
            }
            else {
                processFailedResp(obj);
            }
        }
        catch (e) {
            alert("Unknown error.");
        }
    });
}

function loadProfiles() {
    ajax.post('../api/getProfiles', null, function (responseText) {
        try {
            obj = JSON.parse(responseText); // XXX probably wont work if <= IE7
            if (obj.success) {
                var tableRows = "<tr><th>نوع الكرت</th><th>صلاحية الكرت</th><th>بداء في</th></tr><tbody>";

                var profiles = obj.data.profiles;
                for (var i = 0; i < profiles.length; i++) {
                    tableRows += "<tr>";
                    tableRows += "<td><a class=\"link\" href=\"#profile:" + profiles[i].id + "\">" + profiles[i].name + "</a></td>";
                    tableRows += "<td>" + profiles[i].validity + "</td>";
                    tableRows += "<td>" + UM_PROF_STARTS_AT[profiles[i].startsAt] + "</td>";
                    tableRows += "</tr>";
                }
                tableRows += "</tbody>";
                document.getElementById("profiles-profiles").innerHTML = tableRows;
            }
            else {
                processFailedResp(obj);
            }
        }
        catch (e) {
            alert("Unknown error.");
        }
        unblockGUI();
    });
}

function loadSessions() {
    ajax.post('../api/getUserSessions', null, function (responseText) {
        try {
            obj = JSON.parse(responseText); // XXX probably wont work if <= IE7
            if (obj.success) {
                var tableRows = "<tr><th>بداية الوقت</th><th>وقت الانتهاء</th><th>الوقت </th>"
                    + "<th>التحميل</th><th>الرفع</th><th>الحالة</th></tr><tbody>";

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
            }
            else {
                processFailedResp(obj);
            }
        }
        catch (e) {
            alert("Unknown error.");
        }
        unblockGUI();
    });
}

function loadPaymentTypes() {
    ajax.post('../api/getPayamentTypes', null, function (responseText) {
        try {
            obj = JSON.parse(responseText); // XXX probably wont work if <= IE7
            if (obj.success) {

                var pTypes = obj.data.paymentTypes;
                var resultHtml = "";

                if (pTypes.length) {
                    resultHtml += "<form id=\"buy-form\">";

                    for (var i = 0; i < pTypes.length; i++) {
                        var checkStr = "";
                        if (i == 0) checkStr = "checked=\"checked\"";
                        if (pTypes[i].typeId === 1) {
                            resultHtml += "<input style=\"margin:8px 15px;\" type=\"radio\" name=\"paymethod\" value=\"1\" "
                                + checkStr + " /><img src=\"../img/PayPal_mark_37x23.gif\" alt=\"PayPal\" /><br />";
                        }
                        else if (pTypes[i].typeId === 2) {
                            resultHtml += "<input style=\"margin:8px 15px;\" type=\"radio\" name=\"paymethod\" value=\"2\" "
                                + checkStr + " />Credit card <span style=\"font-size:12px;color:#762824;\">(via Authorize.net)</span> <br />";
                        }
                    }

                    resultHtml += "</form>";
                    resultHtml += "<button style=\"width: 100px; margin-left: 40px;margin-top: 20px;\" onclick=\"onBuyClick(this);\">Buy</button>";
                }
                else {
                    resultHtml += "<div style=\"text-align:center;padding:20px;\">No payment method enabled.</div>";
                }

                document.getElementById("buyprofile-buyprofile").innerHTML = resultHtml;
            }
            else {
                processFailedResp(obj);
            }
        }
        catch (e) {
            alert("Unknown error.");
        }
        unblockGUI();
    });
}


function loadPayments() {
    ajax.post('../api/getUserPayments', null, function (responseText) {
        try {
            obj = JSON.parse(responseText); // XXX probably wont work if <= IE7
            if (obj.success) {
                var tableRows = "<tr><th>Type</th><th>Profile</th><th>Start</th>"
                    + "<th>End</th><th>Message</th><th>State</th><th>Action</th></tr><tbody>";

                var payments = obj.data.payments;
                for (var i = payments.length - 1; i >= 0; i--) {
                    tableRows += "<tr>";
                    tableRows += "<td>Paypal</td>"; //TODO
                    tableRows += "<td>" + payments[i].profileName + "</td>";
                    tableRows += "<td>" + payments[i].start + "</td>";
                    tableRows += "<td>" + payments[i].end + "</td>";
                    tableRows += "<td>" + payments[i].message + "</td>";
                    tableRows += "<td>" + UM_PAY_STATE[payments[i].state] + "</td>";

                    // Can continue on STARTED, PENDING and USER-APPROVED
                    if (payments[i].state == 0 || payments[i].state == 1 || payments[i].state == 7) {
                        tableRows += "<td><button value=\"" + payments[i].id + "\" onclick=\"onContinueBuyClick(this)\">Continue</button></td>";
                    }
                    else {
                        tableRows += "<td></td>";
                    }
                    tableRows += "</tr>";
                }
                tableRows += "</tbody>";
                document.getElementById("payments-payments").innerHTML = tableRows;
            }
            else {
                processFailedResp(obj);
            }
        }
        catch (e) {
            alert("Unknown error.");
        }
        unblockGUI();
    });
}

function loadProfile(profileId) {
    ajax.post('../api/getProfile', { id: profileId }, function (responseText) {
        try {
            obj = JSON.parse(responseText); // XXX probably wont work if <= IE7
            if (obj.success) {
                var tableRows = "";
                tableRows += "<tr><td>Name:</td><td>" + obj.data.name + "</td></tr>";
                tableRows += "<tr><td>Price:</td><td>" + obj.data.price + "</td></tr>";
                tableRows += "<tr><td>Validity:</td><td>" + obj.data.validity + "</td></tr>";
                tableRows += "<tr><td>Starts at:</td><td>" + UM_PROF_STARTS_AT[obj.data.startsAt] + "</td></tr>";
                if (obj.data.canBuy) {
                    tableRows += "<tr><td colspan=\"2\"><button onclick=\"window.location.href='#buyprofile:" + obj.data.id + "'\">Buy this Profile</button></td></tr>";
                }

                document.getElementById("profile-data").innerHTML = tableRows;
            }
            else {
                processFailedResp(obj);
            }
        }
        catch (e) {
            alert("Unknown error.");
        }
        unblockGUI();
    });
}

function onActivateClick(elmnt) {
    blockGUI();
    document.getElementById("status-profiles").innerHTML = "";
    document.getElementById("status-exp-profiles").innerHTML = "";

    var postData = { 'id': elmnt.value };
    ajax.post('../api/activateProfile', postData, function (responseText) {
        try {
            obj = JSON.parse(responseText); // XXX probably wont work if <= IE7
            if (obj.success) {
                loadStatusData();
            }
            else {
                processFailedResp(obj);
            }
        }
        catch (e) {
            alert("Unknown error.");
        }
        unblockGUI();
    });
}

function onContinueBuyClick(elmnt) {
    blockGUI();
    document.getElementById("payments-payments").innerHTML = "";

    var postData = { 'id': elmnt.value };
    ajax.post('../api/continueBuy', postData, function (responseText) {
        try {
            obj = JSON.parse(responseText); // XXX probably wont work if <= IE7
            if (obj.success) {
                loadPayments();
            }
            else {
                processFailedResp(obj);
                loadPayments();
            }
        }
        catch (e) {
            alert("Unknown error.");
        }
        unblockGUI();
    });
}

function onBuyClick(elmnt) {
    blockGUI();
    var buyForm = document.getElementById("buy-form");
    var postData = {
        'payMethod': buyForm["paymethod"].value,
        'profileId': getLocationHash().split(":")[1]
    };

    ajax.post('../api/buyProfile', postData, function (responseText) {
        try {
            obj = JSON.parse(responseText); // XXX probably wont work if <= IE7
            if (obj.success) {
                hideAll();
                document.getElementById("redirecting").style.display = "block";
                window.location.href = obj.data.redirectUrl;
            }
            else {
                unblockGUI();
                processFailedResp(obj);
            }
        }
        catch (e) {
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
        var postData = {};
        ajax.post('../api/logout', null, function (responseText) {
            try {
                obj = JSON.parse(responseText); // XXX probably wont work if <= IE7
                if (obj.success) {
                    location.reload();
                }
            }
            catch (e) {
                alert("Unknown error.");
            }
        });
    }
}
